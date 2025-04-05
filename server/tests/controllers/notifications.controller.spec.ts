import mongoose from 'mongoose';
import supertest from 'supertest';
import { app } from '../../app'; // same approach as question.controller.spec
import * as notificationService from '../../services/notification.service';

// -- SPY on all service functions we need:
const getUserNotificationsSpy = jest.spyOn(notificationService, 'getUserNotifications');
const clearNotificationsSpy = jest.spyOn(notificationService, 'clearNotifications');
const createAnswerNotificationSpy = jest.spyOn(notificationService, 'createAnswerNotification');

// Example valid request body for POST /createNotification
const validNotificationRequest = {
  recipient: 'user1',
  questionId: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dc').toString(),
  answerId: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dd').toString(),
  answeredBy: 'user2',
  text: 'Here is your answer',
};

describe('Test notificationController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /notification/getNotifications', () => {
    it('should return notifications for a valid user', async () => {
      getUserNotificationsSpy.mockResolvedValueOnce([
        {
          _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
          type: 'ANSWER',
          recipient: 'user1',
          questionId: {
            _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dc'),
            title: 'Q1',
          },
          answerId: {
            _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dd'),
            text: 'A1',
          },
          answeredBy: 'user2',
          createdAt: new Date('2024-06-01'),
          read: false,
        },
      ]);

      // Making the request
      const response = await supertest(app).get('/notification/getNotifications?username=user1');

      // Asserting the response
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].recipient).toBe('user1');
      expect(getUserNotificationsSpy).toHaveBeenCalledWith('user1');
    });

    it('should return 400 if username is missing', async () => {
      const response = await supertest(app).get('/notification/getNotifications');

      expect(response.status).toBe(400);
      expect(response.text).toBe('Username is required');
    });

    it('should return 500 if notification fetch fails', async () => {
      getUserNotificationsSpy.mockRejectedValueOnce(new Error('Mock failure'));

      const response = await supertest(app).get('/notification/getNotifications?username=user1');

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when fetching notifications');
    });
  });

  //
  // DELETE /clearNotifications
  //
  describe('DELETE /notification/clearNotifications', () => {
    it('should clear notifications for a valid user', async () => {
      clearNotificationsSpy.mockResolvedValueOnce();

      const response = await supertest(app).delete(
        '/notification/clearNotifications?username=user1',
      );

      expect(response.status).toBe(200);
      expect(response.text).toBe('Notifications cleared successfully');
      expect(clearNotificationsSpy).toHaveBeenCalledWith('user1');
    });

    it('should return 400 if username is missing', async () => {
      const response = await supertest(app).delete('/notification/clearNotifications');

      expect(response.status).toBe(400);
      expect(response.text).toBe('Username is required');
    });

    it('should return 500 if clearing fails', async () => {
      clearNotificationsSpy.mockRejectedValueOnce(new Error('Mock delete failure'));

      const response = await supertest(app).delete(
        '/notification/clearNotifications?username=user1',
      );

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when fetching notifications: Mock delete failure');
    });
  });

  //
  // POST /createNotification
  //
  describe('POST /notification/createNotification', () => {
    it('should create a new notification and return it', async () => {
      createAnswerNotificationSpy.mockResolvedValueOnce({
        _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
        type: 'ANSWER',
        recipient: validNotificationRequest.recipient,
        questionId: new mongoose.Types.ObjectId(validNotificationRequest.questionId),
        answerId: new mongoose.Types.ObjectId(validNotificationRequest.answerId),
        answeredBy: validNotificationRequest.answeredBy,
        createdAt: new Date('2024-06-02'),
        read: false,
      });

      const response = await supertest(app)
        .post('/notification/createNotification')
        .send(validNotificationRequest);

      expect(response.status).toBe(200);
      expect(response.body.recipient).toBe(validNotificationRequest.recipient);
      expect(createAnswerNotificationSpy).toHaveBeenCalledWith(
        validNotificationRequest.recipient,
        validNotificationRequest.questionId,
        validNotificationRequest.answerId,
        validNotificationRequest.answeredBy,
        validNotificationRequest.text,
      );
    });

    it('should return 400 if required fields are missing', async () => {
      const incomplete = Object.fromEntries(
        Object.entries(validNotificationRequest).filter(([key]) => key !== 'recipient'),
      );

      const response = await supertest(app)
        .post('/notification/createNotification')
        .send(incomplete);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Missing required fields');
    });

    it('should return 400 if questionId or answerId are invalid', async () => {
      const invalidIDs = {
        ...validNotificationRequest,
        questionId: 'invalidObjectId',
      };

      const response = await supertest(app)
        .post('/notification/createNotification')
        .send(invalidIDs);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid ID format');
    });

    it('should return 500 if service throws during creation', async () => {
      createAnswerNotificationSpy.mockRejectedValueOnce(new Error('Service error'));

      const response = await supertest(app)
        .post('/notification/createNotification')
        .send(validNotificationRequest);

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when fetching notifications: Service error');
    });
  });
});
