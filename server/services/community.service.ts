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
    if (!chat) {
      throw new Error('Error creating chat');
    }

    // create a new community with the group chat id and no questions to start
    const CommunityWithModel = {
      ...communityPayload,
      groupChatId: chat._id,
      questions: [],
    };

    const result = await CommunityModel.create(CommunityWithModel);
    if (!result) {
      throw new Error('Error saving community');
    }
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
 * @returns {Promise<CommunityResponse[]>} - An array of all communities or an error message.
 */
export const getAllCommunities = async (): Promise<CommunitiesResponse> => {
  try {
    const communities: DatabaseCommunity[] = await CommunityModel.find().lean();
    return communities;
  } catch (error) {
    return { error: `Error retrieving communities: ${error}` };
  }
};

/**
 * Gets all questions associated with this community from the database.
 * @param communityId - The ID of the community to retrieve questions for.
 * @returns {Promise<PopulatedDatabaseQuestion[]>} - An array of questions or an error message.
 * NOTE - the rest of the service functions do not return fully populated Community (e.g. chat and questions), that is done in the controller
 */
export const getQuestionsForCommunity = async (
  communityId: string,
): Promise<PopulatedDatabaseQuestion[]> => {
  try {
    const community: DatabaseCommunity | null = await CommunityModel.findById(communityId).lean();
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
