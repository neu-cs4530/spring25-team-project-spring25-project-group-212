import { Schema } from 'mongoose';

/**
 * Mongoose schema for the User collection.
 *
 * This schema defines the structure for storing users in the database.
 * Each User includes the following fields:
 * - `username`: The username of the user.
 * - `password`: The encrypted password securing the user's account.
 * - `dateJoined`: The date the user joined the platform.
 * - `biography`: The biography of the user.
 * - `email`: The email of the user.
 */
const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      immutable: true,
    },
    password: {
      type: String,
    },
    dateJoined: {
      type: Date,
    },
    biography: {
      type: String,
      default: '',
    },
    savedQuestions: [
      {
        type: String,
        ref: 'Question',
      },
    ],
    email: {
      type: String,
      default: '',
    },
  },
  { collection: 'User' },
);

export default userSchema;
