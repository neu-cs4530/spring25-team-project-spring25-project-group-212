import { Schema } from 'mongoose';

const voteSchema: Schema = new Schema({
  username: { type: String, required: true },
  timestamp: { type: Date, required: true },
});
/**
 * Mongoose schema for the Question collection.
 *
 * This schema defines the structure for storing questions in the database.
 * Each question includes the following fields:
 * - `title`: The title of the question.
 * - `text`: The detailed content of the question.
 * - `tags`: An array of references to `Tag` documents associated with the question.
 * - `answers`: An array of references to `Answer` documents associated with the question.
 * - `askedBy`: The username of the user who asked the question.
 * - `askDateTime`: The date and time when the question was asked.
 * - `views`: An array of usernames that have viewed the question.
 * - `upVotes`: An array of usernames that have upvoted the question.
 * - `downVotes`: An array of usernames that have downvoted the question.
 * - `comments`: Comments that have been added to the question by users.
 * - `useMarkdown`: Boolean indicating whether markdown formatting is enabled for this question.
 */
const questionSchema: Schema = new Schema(
  {
    title: {
      type: String,
    },
    text: {
      type: String,
    },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
    askedBy: {
      type: String,
    },
    askDateTime: {
      type: Date,
    },
    views: [{ type: String }],
    upVotes: { type: [voteSchema], default: [] },
    downVotes: { type: [voteSchema], default: [] },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    useMarkdown: {
      type: Boolean,
      default: false,
      required: true,
    },
    anonymous: {
      type: Boolean,
    },
  },
  { collection: 'Question' },
);

export default questionSchema;
