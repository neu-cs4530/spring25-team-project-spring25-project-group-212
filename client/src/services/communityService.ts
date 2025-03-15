import axios from 'axios';
import { Community, PopulatedDatabaseCommunity, PopulatedDatabaseQuestion } from '../types/types';
import api from './config';

const COMMUNITY_API_URL = `${process.env.REACT_APP_SERVER_URL}/community`;

/**
 * Function to get communities
 *
 * @throws Error if there is an issue fetching communities.
 */
const getCommunities = async (): Promise<PopulatedDatabaseCommunity[]> => {
  const res = await api.get(`${COMMUNITY_API_URL}/getAll`);
  if (res.status !== 200) {
    throw new Error('Error when fetching communities');
  }
  return res.data;
};

/**
 * Function to get a community by its ID
 * @param id The ID of the community to fetch
 * @throws Error if there is an issue fetching the community.
 */
const getCommunityById = async (id: string): Promise<PopulatedDatabaseCommunity> => {
  const res = await api.get(`${COMMUNITY_API_URL}/getCommunity/${id}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching community');
  }
  return res.data;
};

/**
 * Sends a POST request to create a new community.
 * @param community - The community object to create.
 * @returns {Promise<PopulatedDatabaseCommunity>} The newly created community object.
 * @throws {Error} If an error occurs during the creation process.
 */
const createCommunity = async (
  community: Omit<Community, 'groupChat' | 'questions'>,
): Promise<PopulatedDatabaseCommunity> => {
  try {
    const res = await api.post(`${COMMUNITY_API_URL}/create`, { community });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Error while creating community: ${error.response.data}`);
    } else {
      throw new Error('Error while creating community');
    }
  }
};

const getQuestionsForCommunity = async (id: string): Promise<PopulatedDatabaseQuestion[]> => {
  const res = await api.get(`${COMMUNITY_API_URL}/getQuestions/${id}`);
  if (res.status !== 200) {
    throw new Error('Error while fetching questions for community');
  }
  return res.data;
};

/**
 * Sends POST request to add question to community
 */
const addQuestionToCommunity = async (
  communityId: string,
  questionId: string,
): Promise<PopulatedDatabaseCommunity> => {
  const res = await api.post(`${COMMUNITY_API_URL}/addQuestionToCommunity/${communityId}`, {
    questionId,
  });
  if (res.status !== 200) {
    throw new Error('Error while adding question to community');
  }
  return res.data;
};

export {
  getCommunities,
  getCommunityById,
  createCommunity,
  getQuestionsForCommunity,
  addQuestionToCommunity,
};
