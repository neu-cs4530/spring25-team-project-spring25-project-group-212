import express, { Response } from 'express';
import { ObjectId } from 'mongodb';
import { FakeSOSocket } from '../types/types';
import {
  createAnswerNotification,
  getUserNotifications,
  clearNotifications,
} from '../services/notification.service';

const notificationController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Retrieves all notifications for a specific user.
   * If there is an error, the HTTP response's status is updated.
   *
   * @param req The request object containing the username as a query parameter.
   * @param res The HTTP response object used to send back the list of notifications.
   *
   * @returns A Promise that resolves to void.
   */
  const getNotifications = async (
    req: { query: { username: string } },
    res: Response,
  ): Promise<void> => {
    const { username } = req.query;

    if (!username) {
      res.status(400).send('Username is required');
      return;
    }

    try {
      const notifications = await getUserNotifications(username);
      res.json(notifications);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).send(`Error when fetching notifications: ${err.message}`);
      } else {
        res.status(500).send('Error when fetching notifications');
      }
    }
  };

  /**
   * Clears all notifications for a specific user.
   * If there is an error, the HTTP response's status is updated.
   *
   * @param req The request object containing the username as a query parameter.
   * @param res The HTTP response object used to send back the success status.
   *
   * @returns A Promise that resolves to void.
   */
  const clearUserNotifications = async (
    req: { query: { username: string } },
    res: Response,
  ): Promise<void> => {
    const { username } = req.query;

    if (!username) {
      res.status(400).send('Username is required');
      return;
    }

    try {
      await clearNotifications(username);
      res.status(200).send('Notifications cleared successfully');
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).send(`Error when clearing notifications: ${err.message}`);
      } else {
        res.status(500).send('Error when clearing notifications');
      }
    }
  };

  /**
   * Creates a new notification for when a question is answered.
   * If there is an error, the HTTP response's status is updated.
   *
   * @param req The request object containing the notification data.
   * @param res The HTTP response object used to send back the created notification.
   *
   * @returns A Promise that resolves to void.
   */
  const createNotification = async (
    req: {
      body: {
        recipient: string;
        questionId: string;
        answerId: string;
        answeredBy: string;
        text: string;
      };
    },
    res: Response,
  ): Promise<void> => {
    const { recipient, questionId, answerId, answeredBy, text } = req.body;

    if (!recipient || !questionId || !answerId || !answeredBy || !text) {
      res.status(400).send('Missing required fields');
      return;
    }

    if (!ObjectId.isValid(questionId) || !ObjectId.isValid(answerId)) {
      res.status(400).send('Invalid ID format');
      return;
    }

    try {
      const notification = await createAnswerNotification(
        recipient,
        questionId,
        answerId,
        answeredBy,
        text,
      );
      socket.emit('notificationUpdate', { notification });
      res.json(notification);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).send(`Error when creating notification: ${err.message}`);
      } else {
        res.status(500).send('Error when creating notification');
      }
    }
  };

  // add appropriate HTTP verbs and their endpoints to the router
  router.get('/getNotifications', getNotifications);
  router.delete('/clearNotifications', clearUserNotifications);
  router.post('/createNotification', createNotification);

  return router;
};

export default notificationController;
