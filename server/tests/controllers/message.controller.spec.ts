import mongoose from 'mongoose';
import supertest from 'supertest';
import { app } from '../../app';
import * as util from '../../services/message.service';
import { DatabaseMessage, Message } from '../../types/types';
import MessageModel from '../../models/messages.model';

const saveMessageSpy = jest.spyOn(util, 'saveMessage');
const getMessagesSpy = jest.spyOn(util, 'getMessages');
const addReactionSpy = jest.spyOn(util, 'addReactionToMessage');
const removeReactionSpy = jest.spyOn(util, 'removeReactionFromMessage');
const getReactionsSpy = jest.spyOn(util, 'getReactions');
const markMessageAsSeenSpy = jest.spyOn(util, 'markMessageAsSeen');
const deleteMessageSpy = jest.spyOn(util, 'deleteMessage');
const restoreMessageSpy = jest.spyOn(util, 'restoreMessage');

describe('POST /addMessage', () => {
  it('should add a new message', async () => {
    const validId = new mongoose.Types.ObjectId();

    const requestMessage: Message = {
      msg: 'Hello',
      msgFrom: 'User1',
      msgDateTime: new Date('2024-06-04'),
      type: 'global',
      useMarkdown: false,
    };

    const message: DatabaseMessage = {
      ...requestMessage,
      seenBy: [],
      _id: validId,
    };

    saveMessageSpy.mockResolvedValue(message);

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: requestMessage });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      _id: message._id.toString(),
      msg: message.msg,
      msgFrom: message.msgFrom,
      msgDateTime: message.msgDateTime.toISOString(),
      type: 'global',
      useMarkdown: false,
      seenBy: [],
    });
  });

  it('should return bad request error if messageToAdd is missing', async () => {
    const response = await supertest(app).post('/messaging/addMessage').send({});

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return bad message body error if msg is empty', async () => {
    const badMessage = {
      msg: '',
      msgFrom: 'User1',
      msgDateTime: new Date('2024-06-04'),
      useMarkdown: false,
    };

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: badMessage });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid message body');
  });

  it('should return bad message body error if msg is missing', async () => {
    const badMessage = {
      msgFrom: 'User1',
      msgDateTime: new Date('2024-06-04'),
      useMarkdown: false,
    };

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: badMessage });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid message body');
  });

  it('should return bad message body error if msgFrom is empty', async () => {
    const badMessage = {
      msg: 'Hello',
      msgFrom: '',
      msgDateTime: new Date('2024-06-04'),
      useMarkdown: false,
    };

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: badMessage });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid message body');
  });

  it('should return bad message body error if msgFrom is missing', async () => {
    const badMessage = {
      msg: 'Hello',
      msgDateTime: new Date('2024-06-04'),
      useMarkdown: false,
    };

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: badMessage });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid message body');
  });

  it('should return bad message body error if msgDateTime is missing', async () => {
    const badMessage = {
      msg: 'Hello',
      msgFrom: 'User1',
      useMarkdown: false,
    };

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: badMessage });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid message body');
  });

  it('should return bad message body error if msgDateTime is null', async () => {
    const badMessage = {
      msg: 'Hello',
      msgFrom: 'User1',
      msgDateTime: null,
    };

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: badMessage });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid message body');
  });

  it('should return internal server error if saveMessage fails', async () => {
    const validId = new mongoose.Types.ObjectId();
    const message = {
      _id: validId,
      msg: 'Hello',
      msgFrom: 'User1',
      msgDateTime: new Date('2024-06-04'),
      useMarkdown: false,
    };

    saveMessageSpy.mockResolvedValue({ error: 'Error saving document' });

    const response = await supertest(app)
      .post('/messaging/addMessage')
      .send({ messageToAdd: message });

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when adding a message: Error saving document');
  });
});

describe('GET /getMessages', () => {
  it('should return all messages', async () => {
    const message1: Message = {
      msg: 'Hello',
      msgFrom: 'User1',
      msgDateTime: new Date('2024-06-04'),
      type: 'global',
      useMarkdown: false,
    };

    const message2: Message = {
      msg: 'Hi',
      msgFrom: 'User2',
      msgDateTime: new Date('2024-06-05'),
      type: 'global',
      useMarkdown: false,
    };

    const dbMessage1: DatabaseMessage = {
      ...message1,
      seenBy: [],
      _id: new mongoose.Types.ObjectId(),
    };

    const dbMessage2: DatabaseMessage = {
      ...message2,
      seenBy: [],
      _id: new mongoose.Types.ObjectId(),
    };

    getMessagesSpy.mockResolvedValue([dbMessage1, dbMessage2]);

    const response = await supertest(app).get('/messaging/getMessages');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        ...dbMessage1,
        _id: dbMessage1._id.toString(),
        msgDateTime: dbMessage1.msgDateTime.toISOString(),
      },
      {
        ...dbMessage2,
        _id: dbMessage2._id.toString(),
        msgDateTime: dbMessage2.msgDateTime.toISOString(),
      },
    ]);
  });
});

const createMockMessage = (overrides: Partial<DatabaseMessage> = {}) => {
  const mockDoc = {
    msg: 'Test message',
    msgFrom: 'user1',
    msgDateTime: new Date(),
    type: 'global',
    useMarkdown: false,
    seenBy: [],
    reactions: [],
    __v: 0,
    ...overrides,
    ...mongoose.Document.prototype,
  };

  return new MessageModel(mockDoc);
};

describe('Message Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /addReaction', () => {
    it('should add reaction to message', async () => {
      const messageId = new mongoose.Types.ObjectId().toString();
      const emoji = '👍';
      const username = 'user1';
      const mockMessage = createMockMessage({
        _id: new mongoose.Types.ObjectId(messageId),
        reactions: [{ emoji, userId: new mongoose.Types.ObjectId() }],
      });

      addReactionSpy.mockResolvedValue(mockMessage);

      const response = await supertest(app)
        .post('/messaging/addReaction')
        .send({ messageId, emoji, username });

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(messageId);
      expect(response.body.reactions).toEqual([
        {
          _id: expect.any(String),
          emoji,
          userId: expect.any(String),
        },
      ]);
    });

    it('should return 400 if username is missing', async () => {
      const messageId = new mongoose.Types.ObjectId().toString();
      const emoji = '👍';

      const response = await supertest(app)
        .post('/messaging/addReaction')
        .send({ messageId, emoji });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Username is required' });
    });
  });

  describe('POST /removeReaction', () => {
    it('should remove reaction from message', async () => {
      const messageId = new mongoose.Types.ObjectId().toString();
      const emoji = '👍';
      const username = 'user1';

      const mockMessage = createMockMessage({
        _id: new mongoose.Types.ObjectId(messageId),
        reactions: [],
      });

      removeReactionSpy.mockResolvedValue(mockMessage);

      const response = await supertest(app)
        .post('/messaging/removeReaction')
        .send({ messageId, emoji, username });

      expect(response.status).toBe(200);
      expect(response.body.reactions).toEqual([]);
    });

    it('should return 400 if username is missing', async () => {
      const messageId = new mongoose.Types.ObjectId().toString();
      const emoji = '👍';

      const response = await supertest(app)
        .post('/messaging/removeReaction')
        .send({ messageId, emoji });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Username is required' });
    });
  });

  describe('POST /messages/:messageId/seen', () => {
    it('should mark message as seen', async () => {
      const messageId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId();

      const mockMessage = createMockMessage({
        _id: new mongoose.Types.ObjectId(messageId),
        seenBy: [userId],
      });

      markMessageAsSeenSpy.mockResolvedValue(mockMessage);

      const response = await supertest(app)
        .post(`/messaging/messages/${messageId}/seen`)
        .send({ userId: userId.toString() });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        seenBy: [userId.toString()],
      });
    });

    it('should return 500 if markMessageAsSeen throws an error', async () => {
      const messageId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId();

      markMessageAsSeenSpy.mockRejectedValue(new Error('Database error'));

      const response = await supertest(app)
        .post(`/messaging/messages/${messageId}/seen`)
        .send({ userId: userId.toString() });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Mark messages as seen is not working: Database error',
      });
    });

    it('should return 500 with success: false if updatedMessage contains a message field', async () => {
      const messageId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId();

      const mockResponse: { error: string } = {
        error: 'Invalid response from markMessageAsSeen',
      };
      markMessageAsSeenSpy.mockResolvedValue(mockResponse);

      const response = await supertest(app)
        .post(`/messaging/messages/${messageId}/seen`)
        .send({ userId: userId.toString() });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: mockResponse.error,
      });
    });
  });

  describe('DELETE /messages/:messageId/delete', () => {
    it('should delete message', async () => {
      const messageId = new mongoose.Types.ObjectId().toString();
      const username = 'user1';

      const mockMessage = createMockMessage({
        _id: new mongoose.Types.ObjectId(messageId),
        deletedAt: new Date(),
      });

      deleteMessageSpy.mockResolvedValue(mockMessage);

      const response = await supertest(app)
        .delete(`/messaging/messages/${messageId}/delete`)
        .send({ username });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Message deleted successfully.');
    });

    it('should return 500 if deleteMessage throws an error', async () => {
      const messageId = new mongoose.Types.ObjectId().toString();
      const username = 'user1';

      deleteMessageSpy.mockRejectedValue(new Error('Database error'));

      const response = await supertest(app)
        .delete(`/messaging/messages/${messageId}/delete`)
        .send({ username });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Error deleting message.',
        error: 'Database error',
      });
    });
  });

  describe('PUT /messages/:messageId/restore', () => {
    it('should restore message', async () => {
      const messageId = new mongoose.Types.ObjectId().toString();

      const mockMessage = createMockMessage({
        _id: new mongoose.Types.ObjectId(messageId),
        deletedAt: new Date(),
      });

      restoreMessageSpy.mockResolvedValue(mockMessage);

      const response = await supertest(app).put(`/messaging/messages/${messageId}/restore`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Message restored successfully.');
    });

    it('should return 500 if restoreMessage throws an error', async () => {
      const messageId = new mongoose.Types.ObjectId().toString();

      restoreMessageSpy.mockRejectedValue(new Error('Database error'));

      const response = await supertest(app).put(`/messaging/messages/${messageId}/restore`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Error restoring message.',
        error: 'Database error',
      });
    });
  });

  describe('POST /uploads', () => {
    it('should save a file message successfully', async () => {
      const fileUrl = 'https://example.com/file.png';
      const username = 'user1';

      const mockMessage = createMockMessage({
        _id: new mongoose.Types.ObjectId(),
        msg: fileUrl,
        msgFrom: username,
        msgDateTime: new Date(),
      });

      saveMessageSpy.mockResolvedValue(mockMessage);

      const response = await supertest(app).post('/messaging/uploads').send({ fileUrl, username });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: {
          ...mockMessage.toObject(),
          _id: mockMessage._id.toString(),
          msgDateTime: mockMessage.msgDateTime.toISOString(),
        },
        fileUrl,
      });
    });

    it('should return 400 if fileUrl or username is missing', async () => {
      const response = await supertest(app).post('/messaging/uploads').send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'fileUrl and username are required' });
    });

    it('should return 500 if saveMessage throws an error', async () => {
      const fileUrl = 'https://example.com/file.png';
      const username = 'user1';

      saveMessageSpy.mockRejectedValue(new Error('Database error'));

      const response = await supertest(app).post('/messaging/uploads').send({ fileUrl, username });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Error saving file message: Database error',
      });
    });

    it('should return 500 if saveMessage returns an error', async () => {
      const fileUrl = 'https://example.com/file.png';
      const username = 'user1';

      const mockErrorResponse = { error: 'Failed to save message' };
      saveMessageSpy.mockResolvedValue(mockErrorResponse);

      const response = await supertest(app).post('/messaging/uploads').send({ fileUrl, username });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: mockErrorResponse.error });
    });
  });

  describe('GET /getReactions/:messageId', () => {
    it('should return 400 if messageId is invalid', async () => {
      const invalidMessageId = 'invalidMessageId';
      const response = await supertest(app).get(`/messaging/getReactions/${invalidMessageId}`);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Cast to ObjectId failed');
    });

    it('should return 200 with reactions if messageId is valid', async () => {
      const messageId = new mongoose.Types.ObjectId().toString();
      const mockReactions = [{ emoji: '👍', userId: new mongoose.Types.ObjectId() }];

      getReactionsSpy.mockResolvedValue(
        mockReactions.map(reaction => ({
          ...reaction,
          userId: reaction.userId,
        })),
      );

      const response = await supertest(app).get(`/messaging/getReactions/${messageId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        mockReactions.map(reaction => ({
          ...reaction,
          userId: reaction.userId.toString(),
        })),
      );
    });
  });
});
