import mongoose from 'mongoose';
import { config } from 'dotenv';
import {
  createAnswerNotification,
  getUserNotifications,
  clearNotifications,
} from '../../services/notification.service';
import { QUESTIONS, ans1, ans2, ans3, ans4, POPULATED_QUESTIONS } from '../mockData.models';
import NotificationModel from '../../models/notifications.model';
import QuestionModel from '../../models/questions.model';
import AnswerModel from '../../models/answers.model';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Notification Service', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should create a new answer notification', async () => {
    const question = QUESTIONS[0];

    const answer = ans1;

    const notification = await createAnswerNotification(
      question.askedBy,
      question._id.toString(),
      answer._id.toString(),
      ans1.ansBy,
      answer.text,
    );

    expect(notification).toBeDefined();
    expect(notification.type).toBe('ANSWER');
    expect(notification.recipient).toBe('q_by1');
    expect(notification.answeredBy).toBe('ansBy1');
  });

  it('should retrieve all notifications for a user', async () => {
    const question = QUESTIONS[0];

    const answer = ans1;

    await createAnswerNotification(
      question.askedBy,
      question._id.toString(),
      answer._id.toString(),
      ans1.ansBy,
      answer.text,
    );

    const notifications = await getUserNotifications('q_by1');
    expect(notifications[0].questionId.title).toBe('Q1');
    expect(notifications[0].answerId.text).toBe('A1');
  });

  it('should clear all notifications for a user', async () => {
    const question = await QuestionModel.create({
      title: 'Q2',
      text: '...',
      askedBy: 'eve',
    });

    const answer = await AnswerModel.create({
      text: 'A2',
      answeredBy: 'frank',
      questionId: question._id,
    });

    await createAnswerNotification(
      'eve',
      question._id.toString(),
      answer._id.toString(),
      'frank',
      'A2',
    );

    await clearNotifications('eve');
    const notifications = await NotificationModel.find({ recipient: 'eve' });
    expect(notifications.length).toBe(0);
  });
});
