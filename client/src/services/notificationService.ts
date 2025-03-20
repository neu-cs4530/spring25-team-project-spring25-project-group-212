import { PopulatedDatabaseNotification } from '../types/types';
import api from './config';

const NOTIFICATION_API_URL = `${process.env.REACT_APP_SERVER_URL}/notification`;

/**
 * Function to get notifications for a user.
 *
 * @param username - The username to get notifications for
 * @throws Error if there is an issue fetching notifications
 */
export const getUserNotifications = async (
  username: string,
): Promise<PopulatedDatabaseNotification[]> => {
  const res = await api.get(`${NOTIFICATION_API_URL}/getNotifications?username=${username}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching notifications');
  }
  return res.data;
};

/**
 * Function to create a notification for a new answer.
 *
 * @param questionId - The ID of the question that was answered
 * @param answerId - The ID of the new answer
 * @param answeredBy - The username of the person who answered
 * @param recipient - The username of the question owner who should receive the notification
 * @param text - The text of the answer
 * @throws Error if there is an issue creating the notification
 */
export const createAnswerNotification = async (
  questionId: string,
  answerId: string,
  answeredBy: string,
  recipient: string,
  text: string,
): Promise<void> => {
  const res = await api.post(`${NOTIFICATION_API_URL}/createNotification`, {
    recipient,
    questionId,
    answerId,
    answeredBy,
    text,
  });

  if (res.status !== 200) {
    throw new Error('Error when creating answer notification');
  }
};
