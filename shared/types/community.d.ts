import { Request } from 'express';
import { ObjectId } from 'mongodb';
import { Chat, PopulatedDatabaseChat } from './chat';
import { PopulatedDatabaseQuestion, Question } from './question';

/**
 * Represents a community in the application.
 * - `name`: The name of the community.
 * - `about`: A brief description of the community.
 * - `rules`: The rules of the community.
 * - `members`: The list of members in the community.
 * - `createdBy`: The username of the user who created the community.
 * - `groupChat`: The group chat associated with the community.
 * - `questions`: The list of questions associated with the community.
 */
export interface Community {
  name: string;
  about: string;
  rules: string;
  members: string[];
  createdBy: string;
  groupChat: Chat;
  questions: Question[];
}

export interface DatabaseCommunity {
  _id: ObjectId;
  name: string;
  about: string;
  rules: string;
  members: string[];
  createdBy: string;
  groupChatId: ObjectId;
  questions: ObjectId[];
}

/**
 * Represents a fully populated community from the database.
 * - `_id`: Unique identifier for the community.
 * - `name`: The name of the community.
 * - `about`: A brief descrption of the community.
 * - `rules`: The rules of the community.
 * - `members`: The list of members in the community.
 * - `createdBy`: The username of the user who created the community.
 * - `groupChatId`: THe id of the community's group chat.
 * - `groupChat`: The populated group chat associated with the community.
 * - `questions`: An array of populated `PopulatedDatabaseQuestion` objects.
 */
export interface PopulatedDatabaseCommunity {
  _id: ObjectId;
  name: string;
  about: string;
  rules: string;
  members: string[];
  createdBy: string;
  groupChat: PopulatedDatabaseChat;
  questions: PopulatedDatabaseQuestion[];
}

/**
 * Interface extending the request body for creating a new community.
 * - `community`: The community object being created.
 */
export interface CreateCommunityRequest extends Request {
  body: {
    community: Omit<Community, 'groupChat', 'questions'>;
  };
}

/**
 * Interface extending the request body for saving a question and adding it to a community
 */
export interface AddQuestionToCommunityRequest extends Request {
  params: {
    id: string;
  };
  body: {
    questionId: string;
  };
}

/**
 * Interface extending the request body for a user joining a community
 */
export interface UserJoinCommunityRequest extends Request {
  params: {
    id: string;
  };
  body: {
    username: string;
  };
}

/**
 * Type representing possible responses for a Community-related operation.
 * - Either a `DatabaseCommunity` object or an error message.
 */
export type CommunityResponse = DatabaseCommunity | { error: string };

/**
 * Type representing the response for multiple community-related operations.
 * Either:
 * - `DatabaseCommunity[]`: A list of community objects if the operation is successful.
 * - `error`: An error message if the operation fails.
 */
export type CommunitiesResponse = DatabaseCommunity[] | { error: string };
