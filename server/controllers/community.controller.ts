import express, { Request, Response, Router } from 'express';

import {
  Community,
  CreateCommunityRequest,
  CommunityResponse,
  FakeSOSocket,
  CommunitiesResponse,
  PopulatedDatabaseCommunity,
  PopulatedDatabaseQuestion,
  AddQuestionToCommunityRequest,
  UserCommunityRequest,
  UpdateCommunityNameAboutRulesRequest,
} from '../types/types';
import {
  saveCommunity,
  getCommunityById,
  getAllCommunities,
  getQuestionsForCommunity,
  saveQuestionToCommunity,
  joinCommunityService,
  updateCommunity,
  addOnlineUser,
  removeOnlineUser,
  getOnlineUsers,
} from '../services/community.service';
import { populateDatabaseCommunity } from '../utils/database.util';

const communityController = (socket: FakeSOSocket) => {
  const router: Router = express.Router();

  /**
   * Validates that the request body contains all required fields for a community.
   * @param req The incoming request containing community data.
   * @returns `true` if the body contains valid community fields; otherwise, `false`.
   */
  const isCommunityBodyValid = (req: CreateCommunityRequest): boolean =>
    req.body !== undefined &&
    req.body.community !== undefined &&
    req.body.community.name !== undefined &&
    req.body.community.name !== '' &&
    req.body.community.about !== undefined &&
    req.body.community.about !== '' &&
    req.body.community.rules !== undefined &&
    req.body.community.rules !== '' &&
    req.body.community.members !== undefined &&
    Array.isArray(req.body.community.members) &&
    req.body.community.createdBy !== undefined &&
    req.body.community.createdBy !== '';

  const isUpdateCommunityNameAboutRulesRequestValid = (
    req: UpdateCommunityNameAboutRulesRequest,
  ): boolean =>
    req.body !== undefined &&
    req.body.name !== undefined &&
    req.body.name !== '' &&
    req.body.about !== undefined &&
    req.body.about !== '' &&
    req.body.rules !== undefined &&
    req.body.rules !== '';

  /**
   * Creates a new community and saves it to the database.
   * If the community is invalid or saving fails, the HTTP response status is updated.
   * @param req The CreateCommunityRequest object containing the community data.
   * @param res The HTTP response object used to send back the result of the operation.
   * @returns A Promise that resolves to void.
   */
  const createCommunity = async (req: CreateCommunityRequest, res: Response): Promise<void> => {
    if (!isCommunityBodyValid(req)) {
      res.status(400).send('Invalid community body');
      return;
    }

    try {
      const requestCommunity: Omit<Community, 'groupChat' | 'questions'> = req.body.community;
      const result: CommunityResponse = await saveCommunity(requestCommunity);

      if ('error' in result) {
        throw new Error(result.error);
      }

      const populatedCommunity: PopulatedDatabaseCommunity =
        await populateDatabaseCommunity(result);

      socket.emit('communityUpdate', { community: populatedCommunity, type: 'created' });
      res.json(populatedCommunity);
    } catch (err: unknown) {
      res.status(500).send(`Error while creating community: ${(err as Error).message}`);
    }
  };

  /**
   * Gets a community (fully populated) by its ID from the database.
   * @param req Get request containing the community ID in params
   * @param res HTTP response object used to send back the result of the operation.
   * @returns A Promise that resolves to void.
   */
  const getCommunityFromId = async (req: Request, res: Response): Promise<void> => {
    const communityId: string = req.params.id as string;

    try {
      const community: CommunityResponse = await getCommunityById(communityId);
      if ('error' in community) {
        throw new Error(community.error);
      }

      const populatedCommunity: PopulatedDatabaseCommunity =
        await populateDatabaseCommunity(community);

      res.status(200).json(populatedCommunity);
    } catch (err: unknown) {
      res.status(500).send(`Error while retrieving community: ${(err as Error).message}`);
    }
  };

  /**
   * Gets all communities from database (fully populated)
   * @param req Generic request (nothing special)
   * @param res JSON response containing all populated communities from the database
   */
  const getCommunities = async (req: Request, res: Response): Promise<void> => {
    try {
      const communities: CommunitiesResponse = await getAllCommunities();
      if ('error' in communities) {
        throw new Error(communities.error);
      }

      const populatedDatabaseCommunities = await Promise.all(
        communities.map(async c => {
          const populatedDatabaseCommunity = await populateDatabaseCommunity(c);
          return populatedDatabaseCommunity as PopulatedDatabaseCommunity;
        }),
      );
      res.status(200).json(populatedDatabaseCommunities);
    } catch (err: unknown) {
      res.status(500).send(`Error while retrieving all communities: ${(err as Error).message}`);
    }
  };

  /**
   * Gets all questions that are associated with a particular community
   * @param req Community ID
   * @param res List of questions associated with that community
   */
  const getQuestionsByCommunityId = async (req: Request, res: Response): Promise<void> => {
    try {
      const communityId: string = req.params.id as string;
      const questions: PopulatedDatabaseQuestion[] = await getQuestionsForCommunity(communityId);
      res.status(200).json(questions);
    } catch (err: unknown) {
      res.status(500).send(`Error while retrieving questions associated with the community`);
    }
  };

  /**
   * Adds a question to community
   * @param req community ID and question ID
   * @param res updated community
   */
  const addQuestionToCommunity = async (
    req: AddQuestionToCommunityRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const communityId: string = req.params.id as string;
      const { questionId } = req.body;
      const updatedCommunity = await saveQuestionToCommunity(communityId, questionId);
      if ('error' in updatedCommunity) {
        throw new Error(updatedCommunity.error);
      }
      const populatedUpdatedCommunity = await populateDatabaseCommunity(updatedCommunity);
      socket
        .to(communityId)
        .emit('communityUpdate', { community: populatedUpdatedCommunity, type: 'updated' });
      res.status(200).json(populatedUpdatedCommunity);
    } catch (err: unknown) {
      res.status(500).send(`Error while adding question to community: ${(err as Error).message}`);
    }
  };

  /**
   * Adds a user to the list of members of a community, "joining" them
   * @param req Community ID and username of user joining
   * @param res Updated community with user in the list of members
   */
  const joinCommunity = async (req: UserCommunityRequest, res: Response): Promise<void> => {
    try {
      const communityId: string = req.params.id;
      const { username } = req.body;
      const joinedCommunity = await joinCommunityService(communityId, username);
      if ('error' in joinedCommunity) {
        throw new Error(joinedCommunity.error);
      }
      const updatedCommunity = await updateCommunity(communityId, {
        memberHistory: [
          ...joinedCommunity.memberHistory.filter(
            entry => new Date(entry.date).toDateString() !== new Date().toDateString(),
          ),
          { date: new Date(), count: joinedCommunity.members.length },
        ],
      });
      if ('error' in updatedCommunity) {
        throw new Error(updatedCommunity.error);
      }
      const populatedUpdatedCommunity = await populateDatabaseCommunity(joinedCommunity);
      socket
        .to(communityId)
        .emit('communityUpdate', { community: populatedUpdatedCommunity, type: 'updated' });
      socket
        .to(populatedUpdatedCommunity.groupChat._id.toString())
        .emit('chatUpdate', { chat: populatedUpdatedCommunity.groupChat, type: 'newParticipant' });
      res.status(200).json(populatedUpdatedCommunity);
    } catch (err: unknown) {
      res.status(500).send(`Error while joining community: ${(err as Error).message}`);
    }
  };

  /**
   * Updates name, about, and rules for a particular community
   * @param req Community ID, updated name, rules, and about
   * @param res Updated community
   */
  const updateCommunityNameAboutRules = async (
    req: UpdateCommunityNameAboutRulesRequest,
    res: Response,
  ): Promise<void> => {
    if (!isUpdateCommunityNameAboutRulesRequestValid(req)) {
      res.status(400).send('Invalid update community name, about, and/or rules body');
      return;
    }

    try {
      const updatedCommunity = await updateCommunity(req.params.id, {
        name: req.body.name,
        about: req.body.about,
        rules: req.body.rules,
      });

      if ('error' in updatedCommunity) {
        throw new Error(updatedCommunity.error);
      }

      const populatedUpdatedCommunity = await populateDatabaseCommunity(updatedCommunity);
      res.status(200).send(populatedUpdatedCommunity);
    } catch (err: unknown) {
      res
        .status(500)
        .send(
          `Error while updating community's name, about, and/or rules: ${(err as Error).message}`,
        );
    }
  };

  /**
   * Sends invite to user by adding a username to the list of community invites
   * @param req Community ID and username
   * @param res Updated community with added pending invite
   */
  const inviteUserToCommunity = async (req: UserCommunityRequest, res: Response): Promise<void> => {
    try {
      const communityId = req.params.id;
      const { username } = req.body;

      const community = await getCommunityById(communityId);
      if ('error' in community) {
        throw new Error(community.error);
      }

      if (community.members.includes(username)) {
        throw new Error('User already in community');
      }

      if (community.pendingInvites.includes(username)) {
        throw new Error('User already invited to community');
      }

      const updatedPendingInvites: string[] = [...community.pendingInvites, username];
      const updatedCommunity = await updateCommunity(communityId, {
        pendingInvites: updatedPendingInvites,
      });

      if ('error' in updatedCommunity) {
        throw new Error('Error updating community');
      }

      const populatedUpdatedCommunity = await populateDatabaseCommunity(updatedCommunity);
      res.status(200).send(populatedUpdatedCommunity);
    } catch (err: unknown) {
      res.status(500).send(`Error when inviting user to community: ${(err as Error).message}`);
    }
  };

  /**
   * Removes pending invite from community (after user accepts/declines it)
   * @param req Community ID and username
   * @param res Updated community with removed pending invite
   */
  const removeInvite = async (req: UserCommunityRequest, res: Response): Promise<void> => {
    try {
      const communityId = req.params.id;
      const { username } = req.body;
      const community = await getCommunityById(communityId);
      if ('error' in community) {
        throw new Error(community.error);
      }

      if (!community.pendingInvites.includes(username)) {
        throw new Error('No pending invites for this user');
      }

      // get all invites except for the one that contains the given username (removing it)
      const updatedPendingInvites: string[] = community.pendingInvites.filter(u => u !== username);
      const updatedCommunity = await updateCommunity(communityId, {
        pendingInvites: updatedPendingInvites,
      });
      if ('error' in updatedCommunity) {
        throw new Error('Error updating community');
      }

      const populatedUpdatedCommunity = await populateDatabaseCommunity(updatedCommunity);
      res.status(200).send(populatedUpdatedCommunity);
    } catch (err: unknown) {
      res
        .status(500)
        .send(`Error when handling declined invite to community: ${(err as Error).message}`);
    }
  };

  socket.on('connection', conn => {
    conn.on('joinCommunity', (communityID: string, username: string) => {
      conn.join(communityID);
      addOnlineUser(communityID, username);
      socket.to(communityID).emit('onlineUsersUpdate', { users: getOnlineUsers(communityID) });
    });

    conn.on('leaveCommunity', (communityID: string, username: string) => {
      if (communityID) {
        conn.leave(communityID);
        removeOnlineUser(communityID, username);
        socket.to(communityID).emit('onlineUsersUpdate', { users: getOnlineUsers(communityID) });
      }
    });
  });

  /**
   * Gets all online users for a community
   * @param req Community ID
   * @param res List of usernames
   */
  const getOnlineUsersForCommunity = async (req: Request, res: Response): Promise<void> => {
    const communityID = req.params.id;
    try {
      const onlineUsersList = getOnlineUsers(communityID);
      res.status(200).json({ onlineUsers: onlineUsersList });
    } catch (err: unknown) {
      res.status(500).send(`Error while retrieving online users: ${(err as Error).message}`);
    }
  };

  router.post('/create', createCommunity);
  router.get('/getAll', getCommunities);
  router.get('/getCommunity/:id', getCommunityFromId);
  router.get('/getQuestions/:id', getQuestionsByCommunityId);
  router.post('/addQuestionToCommunity/:id', addQuestionToCommunity);
  router.post('/join/:id', joinCommunity);
  router.patch('/updateCommunityNameAboutRules/:id', updateCommunityNameAboutRules);
  router.patch('/inviteUserToCommunity/:id', inviteUserToCommunity);
  router.patch('/removeInvite/:id', removeInvite);
  router.get('/onlineUsers/:id', getOnlineUsersForCommunity);

  return router;
};

export default communityController;
