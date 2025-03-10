import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Community collection.
 *
 * This schema defines the structure of the community used in the database.
 * Each community includes the following fields:
 *
 * - `name`: The name of the community.
 * - `about`: A brief description of the community.
 * - `rules`: The rules of the community.
 * - `members`: The list of members in the community.
 * - `createdBy`: The username of the user who created the community.
 * - `createdAt`: The date and time when the community was created.
 * - `groupChatId`: The id of the community's group chat.
 * TODO: NEED TO ADD:
 * - admins
 * - bulletin board
 * - visibility
 * - community stats
 */

const communitySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      required: true,
    },
    rules: {
      type: String,
      required: true,
    },
    members: {
      type: [String],
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    groupChatId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    questions: {
      type: [Schema.Types.ObjectId],
      required: true,
    },
  },
  { collection: 'Community', timestamps: true },
);

export default communitySchema;
