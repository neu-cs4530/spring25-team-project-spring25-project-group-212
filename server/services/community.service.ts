import CommunityModel from '../models/community.model';
import ChatModel from '../models/chat.model';
import {
  Community,
  CommunityResponse,
  DatabaseCommunity,
  CommunitiesResponse,
} from '../types/types';

/**
 * Saves a new community to the database (including creating the group chat).
 * @param communityPayload - The community object to save.
 * @returns {Promise<CommunityResponse>} - The saved community or an error message.
 */
export const saveCommunity = async (communityPayload: Community): Promise<CommunityResponse> => {
  try {
    const chat = await ChatModel.create({ messages: [] });
    if (!chat) {
      throw new Error('Error creating chat');
    }

    communityPayload.groupChatId = chat._id;
    const result = await CommunityModel.create(communityPayload);
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
    const community: DatabaseCommunity | null = await CommunityModel.findById(communityId);
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
    const communities: DatabaseCommunity[] = await CommunityModel.find();
    return communities;
  } catch (error) {
    return { error: `Error retrieving communities: ${error}` };
  }
};
