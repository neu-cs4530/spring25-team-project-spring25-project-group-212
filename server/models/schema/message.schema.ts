import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Message collection.
 *
 * This schema defines the structure of a message in the database.
 * Each message includes the following fields:
 * - `msg`: The text of the message.
 * - `msgFrom`: The username of the user sending the message.
 * - `msgDateTime`: The date and time the message was sent.
 * - `type`: The type of message, either 'global' or 'direct'.
 * - `useMarkdown`: Whether to render the message content as markdown.
 */
const messageSchema: Schema = new Schema(
  {
    msg: {
      type: String,
      required: true,
    },
    msgFrom: {
      type: String,
      required: true,
    },
    msgDateTime: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['global', 'direct'],
      required: true,
    },
    useMarkdown: {
      type: Boolean,
      default: false,
      required: true,
    },
    reactions: [
      {
        emoji: String,
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    seenBy: [{ type: Schema.Types.String, ref: 'User', default: [] }],
  },
  { collection: 'Message' },
);

export default messageSchema;
