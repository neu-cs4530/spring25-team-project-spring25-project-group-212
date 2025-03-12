import express, { Request, Response, Router } from 'express';

import {
  Community,
  CreateCommunityRequest,
  CommunityResponse,
  FakeSOSocket,
  CommunitiesResponse,
  PopulatedDatabaseCommunity,
  PopulatedDatabaseQuestion,
  PopulatedDatabaseChat,
  DatabaseCommunity,
} from '../types/types';
import {
  saveCommunity,
  getCommunityById,
  getAllCommunities,
  getQuestionsForCommunity,
} from '../services/community.service';
import { populateDocument } from '../utils/database.util';

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

  const populateDatabaseCommunity = async (
    community: DatabaseCommunity,
  ): Promise<PopulatedDatabaseCommunity> => {
    try {
      const populatedChat = await populateDocument(community.groupChatId.toString(), 'chat');
      if ('error' in populatedChat) {
        throw new Error(`populateDatabaseCommunity chat: ${populatedChat.error}`);
      }

      const populatedQuestions = await Promise.all(
        (community.questions || []).map(async questionId => {
          const populatedQuestion = await populateDocument(questionId.toString(), 'question');
          if ('error' in populatedQuestion) {
            throw new Error(`populateDatabaseCommunity question: ${populatedQuestion.error}`);
          }
          return populatedQuestion as PopulatedDatabaseQuestion;
        }),
      );

      const populatedCommunity: PopulatedDatabaseCommunity = {
        ...community,
        groupChat: populatedChat as PopulatedDatabaseChat,
        questions: populatedQuestions,
      };

      populatedCommunity._id = community._id;

      return populatedCommunity;
    } catch (err: unknown) {
      throw new Error((err as Error).message);
    }
  };
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

  const getQuestionsByCommunityId = async (req: Request, res: Response): Promise<void> => {
    try {
      const communityId: string = req.params.id as string;
      const questions: PopulatedDatabaseQuestion[] = await getQuestionsForCommunity(communityId);
      res.status(200).json(questions);
    } catch (err: unknown) {
      res.status(500).send(`Error while retrieving questions associated with the community`);
    }
  };

  router.post('/create', createCommunity);
  router.get('/getAll', getCommunities);
  router.get('/getCommunity/:id', getCommunityFromId);
  router.get('/getQuestions/:id', getQuestionsByCommunityId);

  return router;
};

export default communityController;
