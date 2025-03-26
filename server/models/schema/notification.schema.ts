import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Notification collection.
 *
 * This schema defines the structure for storing notifications in the database.
 * Each notification includes the following fields:
 * - `type`: The type of notification (currently only 'ANSWER')
 * - `recipient`: The username of the user who should receive the notification
 * - `questionId`: Reference to the Question document
 * - `answerId`: Reference to the Answer document
 * - `answeredBy`: The username of the user who answered the question
 * - `createdAt`: The date and time when the notification was created
 * - `read`: Boolean indicating whether the notification has been read
 */
const notificationSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ['ANSWER'],
      required: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    answerId: {
      type: Schema.Types.ObjectId,
      ref: 'Answer',
      required: true,
    },
    answeredBy: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { collection: 'Notification' },
);

export default notificationSchema;
