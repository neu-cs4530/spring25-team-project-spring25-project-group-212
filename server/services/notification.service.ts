import { ObjectId } from 'mongodb';
import { DatabaseNotification, PopulatedDatabaseNotification } from '../types/types';
import NotificationModel from '../models/notifications.model';
import QuestionModel from '../models/questions.model';
import AnswerModel from '../models/answers.model';

/**
 * Creates a new notification for when a question is answered.
 * @param {string} recipient - The username of the question asker
 * @param {string} questionId - The ID of the question
 * @param {string} answerId - The ID of the answer
 * @param {string} answeredBy - The username of the person who answered
 * @param {string} text - The text of the answer
 * @returns {Promise<DatabaseNotification>} - The created notification
 */
export const createAnswerNotification = async (
  recipient: string,
  questionId: string,
  answerId: string,
  answeredBy: string,
  text: string,
): Promise<DatabaseNotification> => {
  try {
    const notification = await NotificationModel.create({
      type: 'ANSWER',
      recipient,
      questionId: new ObjectId(questionId),
      answerId: new ObjectId(answerId),
      answeredBy,
      text,
      createdAt: new Date(),
      read: false,
    });
    return notification;
  } catch (error) {
    throw new Error('Error creating notification');
  }
};

/**
 * Retrieves all notifications for a specific user.
 * @param {string} username - The username to get notifications for
 * @returns {Promise<PopulatedDatabaseNotification[]>} - The list of notifications
 */
export const getUserNotifications = async (
  username: string,
): Promise<PopulatedDatabaseNotification[]> => {
  try {
    const notifications = await NotificationModel.find({ recipient: username })
      .sort({ createdAt: -1 })
      .populate<{
        questionId: { _id: ObjectId; title: string };
        answerId: { _id: ObjectId; text: string };
      }>([
        { path: 'questionId', model: QuestionModel, select: 'title' },
        { path: 'answerId', model: AnswerModel, select: 'text' },
      ]);
    return notifications;
  } catch (error) {
    throw new Error('Error fetching notifications');
  }
};

/**
 * Clears all notifications for a specific user.
 * @param {string} username - The username to clear notifications for
 * @returns {Promise<void>}
 */
export const clearNotifications = async (username: string): Promise<void> => {
  try {
    await NotificationModel.deleteMany({ recipient: username });
  } catch (error) {
    throw new Error('Error clearing notifications');
  }
};
