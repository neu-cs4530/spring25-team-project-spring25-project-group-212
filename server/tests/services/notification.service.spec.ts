import mongoose from 'mongoose';
import {
  createAnswerNotification,
  getUserNotifications,
  clearNotifications,
} from '../../services/notification.service';
import { QUESTIONS, ans1 } from '../mockData.models';
import NotificationModel from '../../models/notifications.model';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Notification Service', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  test('should create a new answer notification', async () => {
    const question = QUESTIONS[0];
    const answer = ans1;

    mockingoose(NotificationModel).toReturn(
      {
        _id: new mongoose.Types.ObjectId(),
        type: 'ANSWER',
        recipient: question.askedBy,
        questionId: question._id,
        answerId: answer._id,
        answeredBy: answer.ansBy,
        createdAt: new Date(),
        read: false,
      },
      'create',
    );

    const notification = await createAnswerNotification(
      question.askedBy,
      question._id.toString(),
      answer._id.toString(),
      answer.ansBy,
      answer.text,
    );

    expect(notification).toBeDefined();
    expect(notification.type).toBe('ANSWER');
    expect(notification.recipient).toBe('q_by1');
    expect(notification.answeredBy).toBe('ansBy1');
  });

  test('createAnswerNotification should throw an error when creation fails', async () => {
    const question = QUESTIONS[0];
    const answer = ans1;

    jest.spyOn(NotificationModel, 'create').mockRejectedValue(new Error('Mock create error'));

    await expect(
      createAnswerNotification(
        question.askedBy,
        question._id.toString(),
        answer._id.toString(),
        answer.ansBy,
        answer.text,
      ),
    ).rejects.toThrow('Error creating notification');
  });

  test('should retrieve all notifications for a user', async () => {
    const question = QUESTIONS[0];
    const answer = ans1;

    mockingoose(NotificationModel).toReturn(
      [
        {
          _id: new mongoose.Types.ObjectId(),
          type: 'ANSWER',
          recipient: question.askedBy,
          questionId: { _id: question._id, title: question.title },
          answerId: { _id: answer._id, text: answer.text },
          answeredBy: answer.ansBy,
          createdAt: new Date(),
          read: false,
        },
      ],
      'find',
    );

    NotificationModel.schema.path('questionId', Object);
    NotificationModel.schema.path('answerId', Object);

    const notifications = await getUserNotifications(question.askedBy);

    expect(notifications.length).toBe(1);
    expect(notifications[0].questionId.title).toBe(question.title);
    expect(notifications[0].answerId.text).toBe(answer.text);
  });

  test('getUserNotifications should throw an error when fetching fails', async () => {
    const question = QUESTIONS[0];

    mockingoose(NotificationModel).toReturn(new Error('Mock find error'), 'find');

    await expect(getUserNotifications(question.askedBy)).rejects.toThrow(
      'Error fetching notifications',
    );
  });

  test('should clear all notifications for a user', async () => {
    const question = QUESTIONS[0];

    mockingoose(NotificationModel).toReturn({}, 'deleteMany');
    await clearNotifications(question.askedBy);

    mockingoose(NotificationModel).toReturn([], 'find');
    const notifications = await getUserNotifications(question.askedBy);

    expect(notifications).toEqual([]);
  });

  test('clearNotifications should throw an error when deletion fails', async () => {
    const question = QUESTIONS[0];

    mockingoose(NotificationModel).toReturn(new Error('Mock delete error'), 'deleteMany');

    await expect(clearNotifications(question.askedBy)).rejects.toThrow(
      'Error clearing notifications',
    );
  });
});
