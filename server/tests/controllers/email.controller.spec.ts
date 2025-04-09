import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import emailController from '../../controllers/email.controller';
import * as questionService from '../../services/question.service';
import * as userService from '../../services/user.service';
import { PopulatedDatabaseQuestion } from '../../types/types';

jest.mock('nodemailer');
jest.mock('../../services/question.service');
jest.mock('../../services/user.service');

describe('Email Controller', () => {
  const mockCreateTransport = nodemailer.createTransport as jest.Mock;
  const mockSendMail = jest.fn();
  const mockGetUsersList = userService.getUsersList as jest.Mock;
  const mockGetQuestionsByOrder = questionService.getQuestionsByOrder as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateTransport.mockReturnValue({
      sendMail: mockSendMail,
    });
  });

  describe('send()', () => {
    it('should send email with correct parameters', async () => {
      const { send } = emailController();
      const receivers = ['test1@example.com', 'test2@example.com'];
      const subject = 'Test Subject';
      const contents = '<h1>Test Content</h1>';

      await send(receivers, subject, contents);

      expect(mockCreateTransport).toHaveBeenCalledWith({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'fakestackoverflow.digest@gmail.com',
          pass: process.env.GMAIL,
        },
      });

      expect(mockSendMail).toHaveBeenCalledWith({
        from: '"Community Overflow Team" <fakestackoverflow.digest@gmail.com>',
        to: receivers,
        subject,
        html: contents,
      });
    });
  });

  describe('getEmails()', () => {
    it('should return filtered list of emails', async () => {
      const { getEmails } = emailController();
      const mockUsers = [
        { email: 'valid1@example.com' },
        { email: '' },
        { email: 'valid2@example.com' },
        { email: null },
      ];

      mockGetUsersList.mockResolvedValue(mockUsers);

      const result = await getEmails();
      expect(result).toEqual(['valid1@example.com', 'valid2@example.com']);
    });

    it('should return empty array if getUsersList returns error', async () => {
      const { getEmails } = emailController();
      mockGetUsersList.mockResolvedValue({ error: 'Database error' });

      const result = await getEmails();
      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      const { getEmails } = emailController();
      mockGetUsersList.mockRejectedValue(new Error('Test error'));

      const result = await getEmails();
      expect(result).toEqual([]);
    });
  });

  describe('topQuestionFinder()', () => {
    const { topQuestionFinder } = emailController();

    const createTestQuestion = (
      overrides: Partial<PopulatedDatabaseQuestion>,
    ): PopulatedDatabaseQuestion => ({
      _id: new mongoose.Types.ObjectId(),
      title: overrides.title || 'Default Title',
      text: 'Default Text',
      upVotes: overrides.upVotes || [],
      downVotes: overrides.downVotes || [],
      views: overrides.views || [],
      answers: [],
      comments: [],
      tags: [],
      askDateTime: new Date(),
      anonymous: false,
      askedBy: 'sana',
      useMarkdown: false,
      ...overrides,
    });

    it('should find top voted questions', () => {
      const question1 = createTestQuestion({
        title: 'Question 1',
        upVotes: Array(5).fill(null),
        downVotes: Array(2).fill(null),
      });

      const question2 = createTestQuestion({
        title: 'Question 2',
        upVotes: Array(3).fill(null),
        downVotes: Array(1).fill(null),
      });

      const result = topQuestionFinder([question1, question2], 'voted');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Question 1');
    });

    it('should find top viewed questions', () => {
      const question1 = createTestQuestion({
        title: 'Question 1',
        views: Array(10).fill(null),
      });

      const question2 = createTestQuestion({
        title: 'Question 2',
        views: Array(15).fill(null),
      });

      const result = topQuestionFinder([question1, question2], 'viewed');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Question 2');
    });

    it('should return multiple questions when tied', () => {
      const question1 = createTestQuestion({
        title: 'Question 1',
        upVotes: Array(5).fill(null),
        downVotes: Array(2).fill(null),
      });

      const question2 = createTestQuestion({
        title: 'Question 2',
        upVotes: Array(3).fill(null),
        downVotes: Array(1).fill(null),
      });

      const question3 = createTestQuestion({
        title: 'Question 3',
        upVotes: Array(5).fill(null),
        downVotes: Array(2).fill(null),
      });

      const result = topQuestionFinder([question1, question2, question3], 'voted');
      expect(result).toHaveLength(2);
      expect(result.map(q => q.title)).toEqual(
        expect.arrayContaining(['Question 1', 'Question 3']),
      );
    });
  });

  describe('getContents()', () => {
    const { getContents } = emailController();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const mockQuestions: PopulatedDatabaseQuestion[] = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Yesterday Question',
        text: 'Yesterday Text',
        askDateTime: new Date(yesterday),
        upVotes: Array(5).fill(null),
        downVotes: Array(1).fill(null),
        views: Array(10).fill(null),
        answers: [],
        comments: [],
        tags: [],
        askedBy: 'sana',
        useMarkdown: false,
        anonymous: false,
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Older Question',
        text: 'Older Text',
        askDateTime: new Date('2021-01-01'),
        upVotes: Array(2).fill(null),
        downVotes: Array(1).fill(null),
        views: Array(5).fill(null),
        answers: [],
        comments: [],
        tags: [],
        askedBy: 'sana',
        useMarkdown: false,
        anonymous: false,
      },
    ];

    it('should return content with yesterday questions', async () => {
      mockGetQuestionsByOrder.mockResolvedValue(mockQuestions);

      const result = await getContents();
      expect(result).toContain("Yesterday's Top Questions");
      expect(result).toContain('Yesterday Question');
      expect(result).not.toContain('Older Question');
    });

    it('should return no questions message when none asked yesterday', async () => {
      mockGetQuestionsByOrder.mockResolvedValue([mockQuestions[1]]);

      const result = await getContents();
      expect(result).toContain('No questions were asked yesterday');
    });

    it('should return error message on failure', async () => {
      mockGetQuestionsByOrder.mockRejectedValue(new Error('Test error'));

      const result = await getContents();
      expect(result).toContain('An error occurred');
    });
  });

  describe('handleSendDigestEmail()', () => {
    it('should send digest email with proper content', async () => {
      const { handleSendDigestEmail } = emailController();

      mockGetUsersList.mockResolvedValue([
        { email: 'test1@example.com' },
        { email: 'test2@example.com' },
      ]);

      mockGetQuestionsByOrder.mockResolvedValue([
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Test Question',
          text: 'Test Content',
          askDateTime: new Date(Date.now() - 86400000),
          upVotes: [],
          downVotes: [],
          views: [],
          answers: [],
          comments: [],
          tags: [],
          askedBy: 'sana',
          useMarkdown: false,
          anonymous: false,
        },
      ]);

      await handleSendDigestEmail();

      expect(mockSendMail).toHaveBeenCalled();
      const sentMail = mockSendMail.mock.calls[0][0];

      expect(sentMail.to).toEqual(['test1@example.com', 'test2@example.com']);
      expect(sentMail.subject).toContain('Daily Digest');
      expect(sentMail.html).toContain('Test Question');
    });
  });
});
