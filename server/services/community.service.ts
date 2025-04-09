import CommunityModel from '../models/community.model';
import {
  Community,
  CommunityResponse,
  DatabaseCommunity,
  CommunitiesResponse,
  PopulatedDatabaseQuestion,
  DatabaseTag,
  PopulatedDatabaseAnswer,
  DatabaseComment,
} from '../types/types';
import ChatModel from '../models/chat.model';
import QuestionModel from '../models/questions.model';
import TagModel from '../models/tags.model';
import AnswerModel from '../models/answers.model';
import CommentModel from '../models/comments.model';
/**
 * Saves a new community to the database (including creating the community's associated group chat).
 * @param communityPayload - The community object to save.
 * @returns {Promise<CommunityResponse>} - The saved community or an error message.
 */
export const saveCommunity = async (
  communityPayload: Omit<Community, 'groupChat' | 'questions'>,
): Promise<CommunityResponse> => {
  try {
    const chat = await ChatModel.create({ participants: communityPayload.createdBy, messages: [] });

    const CommunityWithModel = {
      ...communityPayload,
      groupChatId: chat._id,
      questions: [],
      memberHistory: [
        {
          date: new Date(),
          count: 1,
        },
      ],
    };

    const result = await CommunityModel.create(CommunityWithModel);

    return result;
  } catch (error) {
    return { error: `Error saving community: ${error}` };
  }
};

/**
 * Retrieves a community by its ID.
 * @param communityId - The ID of the community to retrieve.
 * @returns {Promise<CommunityResponse>} - The retrieved community or an error message.
 */
export const getCommunityById = async (communityId: string): Promise<CommunityResponse> => {
  try {
    const community: DatabaseCommunity | null = await CommunityModel.findById(communityId).lean();
    if (!community) {
      throw new Error('Community not found');
    }
    return community;
  } catch (error) {
    return { error: `Error retrieving community: ${error}` };
  }
};

/**
 * Retrieves all communities from the database.
 * @returns {Promise<CommunityResponse[]>} - An array of all communities or an empty array.
 */
export const getAllCommunities = async (): Promise<CommunitiesResponse> => {
  try {
    const communities: DatabaseCommunity[] | null = await CommunityModel.find().lean();
    if (!communities) {
      throw new Error('Cannot find all communities');
    }
    return communities;
  } catch (error) {
    return [];
  }
};

/**
 * Gets all questions associated with this community from the database.
 * @param communityId - The ID of the community to retrieve questions for.
 * @returns {Promise<PopulatedDatabaseQuestion[]>} - An array of questions or an empty array.
 * NOTE - the rest of the service functions do not return fully populated Community (e.g. chat and questions), that is done in the controller
 */
export const getQuestionsForCommunity = async (
  communityId: string,
): Promise<PopulatedDatabaseQuestion[]> => {
  try {
    const community: DatabaseCommunity | null = await CommunityModel.findById(communityId);
    if (!community) {
      throw new Error('Community not found');
    }

    const questions: PopulatedDatabaseQuestion[] = await QuestionModel.find({
      _id: { $in: community.questions },
    }).populate<{
      tags: DatabaseTag[];
      answers: PopulatedDatabaseAnswer[];
      comments: DatabaseComment[];
    }>([
      { path: 'tags', model: TagModel },
      { path: 'answers', model: AnswerModel, populate: { path: 'comments', model: CommentModel } },
      { path: 'comments', model: CommentModel },
    ]);

    return questions;
  } catch (error) {
    return [];
  }
};

/**
 * Saves given question to database and adds it to community with given ID.
 * @param communityId ID of community that question is being added to (asked in)
 * @param questionId ID of question that has been saved
 * @returns community object with new question included or error
 */
export const saveQuestionToCommunity = async (
  communityId: string,
  questionId: string,
): Promise<CommunityResponse> => {
  try {
    const question = await QuestionModel.findById(questionId);
    if (!question) {
      throw new Error('Question with given ID could not be found');
    }
    const updatedCommunity: DatabaseCommunity | null = await CommunityModel.findOneAndUpdate(
      { _id: communityId },
      { $push: { questions: { $each: [question._id], $position: 0 } } },
      { new: true },
    );
    if (updatedCommunity === null) {
      throw new Error('Error when adding question to community');
    }
    return updatedCommunity;
  } catch (error) {
    return { error: `Error when adding question to community: ${(error as Error).message}` };
  }
};

/**
 * Adds a user to a community and the associated group chat.
 * @param communityId - The ID of the community to join.
 * @param username - The username of the user joining the community.
 * @returns {Promise<CommunityResponse>} - The updated community or an error message.
 */
export const joinCommunityService = async (
  communityId: string,
  username: string,
): Promise<CommunityResponse> => {
  try {
    const updatedCommunity: DatabaseCommunity | null = await CommunityModel.findOneAndUpdate(
      { _id: communityId },
      { $addToSet: { members: username } },
      { new: true },
    );
    if (!updatedCommunity) {
      throw new Error('Community with given ID could not be found');
    }
    const result = await ChatModel.updateOne(
      { _id: updatedCommunity.groupChatId },
      { $addToSet: { participants: username } },
    );

    if (!result) {
      throw new Error('Unable to update chat with new user after they joined community');
    }

    return updatedCommunity;
  } catch (error) {
    return { error: `Error when joining community: ${(error as Error).message}` };
  }
};

/**
 * Updates an existing community with new values.
 * @param communityId - The ID of the community to update.
 * @param updates - A partial Community object containing fields to update.
 * @returns {Promise<CommunityResponse>} - The updated community or an error message.
 */
export const updateCommunity = async (
  communityId: string,
  updates: Partial<Community>,
): Promise<CommunityResponse> => {
  try {
    const updatedCommunity = await CommunityModel.findOneAndUpdate(
      { _id: communityId },
      { $set: updates },
      { new: true },
    );
    if (!updatedCommunity) {
      throw new Error('Error updating community');
    }

    return updatedCommunity;
  } catch (error) {
    return { error: `Error when updating community: ${(error as Error).message}` };
  }
};

const onlineUsers: Record<string, Set<string>> = {};

/**
 * Adds a user to the online users set for a given community.
 * @param communityID - The ID of the community.
 * @param username - The username of the user to add.
 */
export const addOnlineUser = (communityID: string, username: string): void => {
  if (!onlineUsers[communityID]) {
    onlineUsers[communityID] = new Set();
  }
  onlineUsers[communityID].add(username);
};

/**
 * Removes a user from the online users set for a given community.
 * @param communityID - The ID of the community.
 * @param username - The username of the user to remove.
 */
export const removeOnlineUser = (communityID: string, username: string): void => {
  if (onlineUsers[communityID]) {
    onlineUsers[communityID].delete(username);
    if (onlineUsers[communityID].size === 0) {
      delete onlineUsers[communityID];
    }
  }
};

/**
 * Gets the list of online users for a specific community.
 * @param communityID - The ID of the community.
 * @returns An array of online users or an empty array if none.
 */
export const getOnlineUsers = (communityID: string): string[] =>
  onlineUsers[communityID] ? Array.from(onlineUsers[communityID]) : [];
