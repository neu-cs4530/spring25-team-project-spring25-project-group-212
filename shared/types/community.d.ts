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

/**
 * Represents a community stored in the database.
 * - `_id`: Unique identifier for the community.
 * - `name`: The name of the community.
 * - `about`: A brief description of the community.
 * - `rules`: The rules of the community.
 * - `members`: The list of members in the community.
 * - `createdBy`: The username of the user who created the community.
 * - `groupChatId`: The id of the community's group chat.
 * - `questions`: An array of ObjectIds referencing questions associated with the community.
 */
export interface DatabaseCommunity extends Omit<Community, 'groupChat', 'questions'> {
  _id: ObjectId;
  groupChatId: ObjectId;
  questions: ObjectId[];
}

/**
 * Represents a fully populated community from the database.
 * - `groupChat`: The populated group chat associated with the community.
 * - `questions`: An array of populated `PopulatedDatabaseQuestion` objects.
 */
export interface PopulatedDatabaseCommunity
  extends Omit<DatabaseCommunity, 'groupChatId' | 'questions'> {
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
