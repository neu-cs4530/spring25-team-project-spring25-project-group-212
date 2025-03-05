import { Request } from 'express';
import { ObjectId } from 'mongodb';

/**
 * Represents a community in the application.
 * - `name`: The name of the community.
 * - `about`: A brief description of the community.
 * - `rules`: The rules of the community.
 * - `members`: The list of members in the community.
 * - `createdBy`: The username of the user who created the community.
 * - `groupChatId`: The id of the community's group chat.
 */
export interface Community {
  name: string;
  about: string;
  rules: string;
  members: string[];
  createdBy: string;
  groupChatId: ObjectId;
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
 */
export interface DatabaseCommunity extends Community {
  _id: ObjectId;
}

/**
 * Interface extending the request body for creating a new community.
 * - `community`: The community object being created.
 */
export interface CreateCommunityRequest extends Request {
  body: {
    community: Omit<Community, 'groupChatId'>;
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
