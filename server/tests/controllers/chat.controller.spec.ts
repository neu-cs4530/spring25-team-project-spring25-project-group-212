import mongoose from 'mongoose';
import supertest from 'supertest';
import { Server, type Socket as ServerSocket } from 'socket.io';
import { createServer } from 'http';
import { io as Client, type Socket as ClientSocket } from 'socket.io-client';
import { AddressInfo } from 'net';
import { app } from '../../app';
import * as messageService from '../../services/message.service';
import * as chatService from '../../services/chat.service';
import * as databaseUtil from '../../utils/database.util';
import { DatabaseChat, PopulatedDatabaseChat, Message } from '../../types/types';
import chatController from '../../controllers/chat.controller';

/**
 * Spies on the service functions
 */
const saveChatSpy = jest.spyOn(chatService, 'saveChat');
const saveMessageSpy = jest.spyOn(messageService, 'saveMessage');
const addMessageSpy = jest.spyOn(chatService, 'addMessageToChat');
const getChatSpy = jest.spyOn(chatService, 'getChat');
const addParticipantSpy = jest.spyOn(chatService, 'addParticipantToChat');
const populateDocumentSpy = jest.spyOn(databaseUtil, 'populateDocument');
const getChatsByParticipantsSpy = jest.spyOn(chatService, 'getChatsByParticipants');
const renameChatSpy = jest.spyOn(chatService, 'renameChat');

/**
 * Sample test suite for the /chat endpoints
 */
describe('Chat Controller', () => {
  describe('POST /chat/createChat', () => {
    it('should create a new chat successfully', async () => {
      const validChatPayload = {
        participants: ['user1', 'user2'],
        messages: [{ msg: 'Hello!', msgFrom: 'user1', msgDateTime: new Date('2025-01-01') }],
      };

      const serializedPayload = {
        ...validChatPayload,
        messages: validChatPayload.messages.map(message => ({
          ...message,
          type: 'direct',
          msgDateTime: message.msgDateTime.toISOString(),
        })),
        name: '',
      };

      const chatResponse: DatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        name: '',
        participants: ['user1', 'user2'],
        messages: [new mongoose.Types.ObjectId()],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const populatedChatResponse: PopulatedDatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        name: '',
        participants: ['user1', 'user2'],
        messages: [
          {
            _id: chatResponse.messages[0],
            msg: 'Hello!',
            msgFrom: 'user1',
            msgDateTime: new Date('2025-01-01'),
            user: {
              _id: new mongoose.Types.ObjectId(),
              username: 'user1',
            },
            type: 'direct',
            useMarkdown: false,
            seenBy: [],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      saveChatSpy.mockResolvedValue(chatResponse);
      populateDocumentSpy.mockResolvedValue(populatedChatResponse);

      const response = await supertest(app).post('/chat/createChat').send(validChatPayload);

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        _id: populatedChatResponse._id.toString(),
        name: populatedChatResponse.name || '',
        participants: populatedChatResponse.participants.map(participant => participant.toString()),
        messages: populatedChatResponse.messages.map(message => ({
          ...message,
          _id: message._id.toString(),
          msgDateTime: message.msgDateTime.toISOString(),
          user: {
            ...message.user,
            _id: message.user?._id.toString(),
          },
        })),
        createdAt: populatedChatResponse.createdAt.toISOString(),
        updatedAt: populatedChatResponse.updatedAt.toISOString(),
      });

      expect(saveChatSpy).toHaveBeenCalledWith(serializedPayload);
      expect(populateDocumentSpy).toHaveBeenCalledWith(chatResponse._id.toString(), 'chat');
    });

    it('should return 400 if participants array is invalid', async () => {
      const invalidPayload = {
        participants: [],
        messages: [],
      };

      const response = await supertest(app).post('/chat/createChat').send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid chat creation request');
    });

    it('should return 500 on service error', async () => {
      saveChatSpy.mockResolvedValue({ error: 'Service error' });

      const response = await supertest(app)
        .post('/chat/createChat')
        .send({
          participants: ['user1'],
          messages: [],
        });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error creating a chat: Service error');
    });

    it('should return 500 if populateDocument fails', async () => {
      const validChatPayload = {
        participants: ['user1', 'user2'],
        messages: [{ msg: 'Hey!', msgFrom: 'user1', msgDateTime: new Date('2025-02-01') }],
      };

      const chatResponse: DatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        name: '',
        participants: ['user1', 'user2'],
        messages: [new mongoose.Types.ObjectId()],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      saveChatSpy.mockResolvedValue(chatResponse);
      populateDocumentSpy.mockResolvedValue({ error: 'Population failed' });

      const response = await supertest(app).post('/chat/createChat').send(validChatPayload);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error creating a chat: Population failed');
    });
  });

  describe('POST /chat/:chatId/addMessage', () => {
    it('should add a message to chat successfully', async () => {
      const chatId = new mongoose.Types.ObjectId();
      const messagePayload: Message = {
        msg: 'Hello!',
        msgFrom: 'user1',
        msgDateTime: new Date('2025-01-01'),
        type: 'direct',
        useMarkdown: false,
      };

      const serializedPayload = {
        ...messagePayload,
        msgDateTime: messagePayload.msgDateTime.toISOString(),
      };

      const messageResponse = {
        _id: new mongoose.Types.ObjectId(),
        ...messagePayload,
        user: {
          _id: new mongoose.Types.ObjectId(),
          username: 'user1',
        },
        seenBy: [],
      };

      const chatResponse: DatabaseChat = {
        _id: chatId,
        name: '',
        participants: ['user1', 'user2'],
        messages: [messageResponse._id],
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      const populatedChatResponse: PopulatedDatabaseChat = {
        _id: chatId,
        name: '',
        participants: ['user1', 'user2'],
        messages: [messageResponse],
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      saveMessageSpy.mockResolvedValue(messageResponse);
      addMessageSpy.mockResolvedValue(chatResponse);
      populateDocumentSpy.mockResolvedValue(populatedChatResponse);

      const response = await supertest(app).post(`/chat/${chatId}/addMessage`).send(messagePayload);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        _id: populatedChatResponse._id.toString(),
        name: populatedChatResponse.name || '',
        participants: populatedChatResponse.participants.map(participant => participant.toString()),
        messages: populatedChatResponse.messages.map(message => ({
          ...message,
          _id: message._id.toString(),
          msgDateTime: message.msgDateTime.toISOString(),
          user: {
            ...message.user,
            _id: message.user?._id.toString(),
          },
        })),
        createdAt: populatedChatResponse.createdAt.toISOString(),
        updatedAt: populatedChatResponse.updatedAt.toISOString(),
      });

      expect(saveMessageSpy).toHaveBeenCalledWith(serializedPayload);
      expect(addMessageSpy).toHaveBeenCalledWith(chatId.toString(), messageResponse._id.toString());
      expect(populateDocumentSpy).toHaveBeenCalledWith(
        populatedChatResponse._id.toString(),
        'chat',
      );
    });

    it('should return 400 for missing chatId, msg, or msgFrom', async () => {
      const chatId = new mongoose.Types.ObjectId();

      const missingMsg = {
        msgFrom: 'user1',
        msgDateTime: new Date('2025-01-01'),
      };
      const response1 = await supertest(app).post(`/chat/${chatId}/addMessage`).send(missingMsg);
      expect(response1.status).toBe(400);

      const missingFrom = {
        msg: 'Hello!',
        msgDateTime: new Date('2025-01-01'),
      };
      const response2 = await supertest(app).post(`/chat/${chatId}/addMessage`).send(missingFrom);
      expect(response2.status).toBe(400);
    });

    it('should return 500 if addMessageToChat returns an error', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();

      saveMessageSpy.mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        msg: 'Hello',
        msgFrom: 'UserX',
        msgDateTime: new Date(),
        type: 'direct',
        useMarkdown: false,
        seenBy: [],
      });

      addMessageSpy.mockResolvedValue({ error: 'Error updating chat' });

      const response = await supertest(app).post(`/chat/${chatId}/addMessage`).send({
        msg: 'Hello',
        msgFrom: 'UserX',
        msgDateTime: new Date().toISOString(),
      });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error updating chat');
    });

    it('should throw an error if message creation fails and does not return an _id', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const messagePayload: Message = {
        msg: 'Hello',
        msgFrom: 'User1',
        msgDateTime: new Date(),
        type: 'direct',
        useMarkdown: false,
      };

      saveMessageSpy.mockResolvedValue({ error: 'Error saving message' });

      const response = await supertest(app).post(`/chat/${chatId}/addMessage`).send(messagePayload);

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error adding a message to chat: Error saving message');
    });

    it('should throw an error if updatedChat returns an error', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const messagePayload = { msg: 'Hello', msgFrom: 'User1', msgDateTime: new Date() };
      const mockMessage = {
        _id: new mongoose.Types.ObjectId(),
        type: 'direct' as 'direct' | 'global',
        useMarkdown: false,
        seenBy: [],
        ...messagePayload,
      };

      saveMessageSpy.mockResolvedValueOnce(mockMessage);

      addMessageSpy.mockResolvedValueOnce({ error: 'Error updating chat' });

      const response = await supertest(app).post(`/chat/${chatId}/addMessage`).send(messagePayload);

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error adding a message to chat: Error updating chat');
    });

    it('should return 500 if populateDocument returns an error', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const foundChat = {
        _id: new mongoose.Types.ObjectId(),
        participants: ['testUser'],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getChatSpy.mockResolvedValue(foundChat);

      populateDocumentSpy.mockResolvedValue({ error: 'Error populating chat' });

      const response = await supertest(app).get(`/chat/${chatId}`);

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error populating chat');
      expect(getChatSpy).toHaveBeenCalledWith(chatId);
      expect(populateDocumentSpy).toHaveBeenCalledWith(foundChat._id.toString(), 'chat');
    });

    it('should return 500 if createMessage returns an error', async () => {
      saveMessageSpy.mockResolvedValue({ error: 'Service error' });

      const chatId = new mongoose.Types.ObjectId().toString();
      const messagePayload = { msg: 'Hello!', msgFrom: 'user1', msgDateTime: new Date() };

      const response = await supertest(app).post(`/chat/${chatId}/addMessage`).send(messagePayload);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error adding a message to chat: Service error');
    });
  });

  describe('GET /chat/:chatId', () => {
    it('should retrieve a chat by ID', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();

      const mockFoundChat: DatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        participants: ['user1'],
        messages: [new mongoose.Types.ObjectId()],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPopulatedChat: PopulatedDatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        participants: ['user1'],
        messages: [
          {
            _id: new mongoose.Types.ObjectId(),
            msg: 'Hello!',
            msgFrom: 'user1',
            msgDateTime: new Date('2025-01-01T00:00:00Z'),
            user: {
              _id: new mongoose.Types.ObjectId(),
              username: 'user1',
            },
            type: 'direct',
            useMarkdown: false,
            seenBy: [],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getChatSpy.mockResolvedValue(mockFoundChat);
      populateDocumentSpy.mockResolvedValue(mockPopulatedChat);

      const response = await supertest(app).get(`/chat/${chatId}`);

      expect(response.status).toBe(200);
      expect(getChatSpy).toHaveBeenCalledWith(chatId);
      expect(populateDocumentSpy).toHaveBeenCalledWith(mockFoundChat._id.toString(), 'chat');

      expect(response.body).toMatchObject({
        _id: mockPopulatedChat._id.toString(),
        participants: mockPopulatedChat.participants.map(p => p.toString()),
        messages: mockPopulatedChat.messages.map(m => ({
          _id: m._id.toString(),
          msg: m.msg,
          msgFrom: m.msgFrom,
          msgDateTime: m.msgDateTime.toISOString(),
          user: {
            _id: m.user?._id.toString(),
            username: m.user?.username,
          },
        })),
        createdAt: mockPopulatedChat.createdAt.toISOString(),
        updatedAt: mockPopulatedChat.updatedAt.toISOString(),
      });
    });

    it('should return 500 if getChat fails', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      getChatSpy.mockResolvedValue({ error: 'Service error' });

      const response = await supertest(app).get(`/chat/${chatId}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error retrieving chat: Service error');
    });
  });

  describe('POST /chat/:chatId/addParticipant', () => {
    it('should add a participant to an existing chat', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();

      const updatedChat: DatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        participants: ['user1', 'user2'],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const populatedUpdatedChat: PopulatedDatabaseChat = {
        _id: updatedChat._id,
        participants: ['user1', 'user2'],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addParticipantSpy.mockResolvedValue(updatedChat);
      populateDocumentSpy.mockResolvedValue(populatedUpdatedChat);

      const response = await supertest(app)
        .post(`/chat/${chatId}/addParticipant`)
        .send({ username: userId });

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        _id: populatedUpdatedChat._id.toString(),
        participants: populatedUpdatedChat.participants.map(id => id.toString()),
        messages: [],
        createdAt: populatedUpdatedChat.createdAt.toISOString(),
        updatedAt: populatedUpdatedChat.updatedAt.toISOString(),
      });

      expect(addParticipantSpy).toHaveBeenCalledWith(chatId, userId);
    });

    it('should return 400 if userId is missing', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const response = await supertest(app).post(`/chat/${chatId}/addParticipant`).send({});

      expect(response.status).toBe(400);
      expect(response.text).toBe('Missing chatId or userId');
    });

    it('should return 500 if addParticipantToChat fails', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();

      addParticipantSpy.mockResolvedValue({ error: 'Service error' });

      const response = await supertest(app)
        .post(`/chat/${chatId}/addParticipant`)
        .send({ username: userId });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error adding participant to chat: Service error');
    });
  });

  describe('POST /chat/getChatsByUser/:username', () => {
    it('should return 200 with an array of chats', async () => {
      const username = 'user1';

      const chats: DatabaseChat[] = [
        {
          _id: new mongoose.Types.ObjectId(),
          participants: ['user1', 'user2'],
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const populatedChats: PopulatedDatabaseChat[] = [
        {
          _id: chats[0]._id,
          participants: ['user1', 'user2'],
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      getChatsByParticipantsSpy.mockResolvedValueOnce(chats);
      populateDocumentSpy.mockResolvedValueOnce(populatedChats[0]);

      const response = await supertest(app).get(`/chat/getChatsByUser/${username}`);

      expect(getChatsByParticipantsSpy).toHaveBeenCalledWith([username]);
      expect(populateDocumentSpy).toHaveBeenCalledWith(populatedChats[0]._id.toString(), 'chat');
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject([
        {
          _id: populatedChats[0]._id.toString(),
          participants: ['user1', 'user2'],
          messages: [],
          createdAt: populatedChats[0].createdAt.toISOString(),
          updatedAt: populatedChats[0].updatedAt.toISOString(),
        },
      ]);
    });

    it('should return 500 if populateDocument fails for any chat', async () => {
      const username = 'user1';
      const chats: DatabaseChat[] = [
        {
          _id: new mongoose.Types.ObjectId(),
          participants: ['user1', 'user2'],
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      getChatsByParticipantsSpy.mockResolvedValueOnce(chats);
      populateDocumentSpy.mockResolvedValueOnce({ error: 'Service error' });

      const response = await supertest(app).get(`/chat/getChatsByUser/${username}`);

      expect(getChatsByParticipantsSpy).toHaveBeenCalledWith([username]);
      expect(populateDocumentSpy).toHaveBeenCalledWith(chats[0]._id.toString(), 'chat');
      expect(response.status).toBe(500);
      expect(response.text).toBe('Error retrieving chat: Failed populating all retrieved chats');
    });

    it('should return 500 if populateDocument fails', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();

      const updatedChat: DatabaseChat = {
        _id: new mongoose.Types.ObjectId(),
        participants: ['user1', 'user2'],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addParticipantSpy.mockResolvedValue(updatedChat);
      populateDocumentSpy.mockResolvedValue({ error: 'Population failed' });

      const response = await supertest(app)
        .post(`/chat/${chatId}/addParticipant`)
        .send({ username: userId });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error adding participant to chat: Population failed');

      expect(addParticipantSpy).toHaveBeenCalledWith(chatId, userId);
      expect(populateDocumentSpy).toHaveBeenCalledWith(updatedChat._id.toString(), 'chat');
    });
  });

  describe('Socket handlers', () => {
    let io: Server;
    let serverSocket: ServerSocket;
    let clientSocket: ClientSocket;

    beforeAll(done => {
      const httpServer = createServer();
      io = new Server(httpServer);
      chatController(io);

      httpServer.listen(() => {
        const { port } = httpServer.address() as AddressInfo;
        clientSocket = Client(`http://localhost:${port}`);
        io.on('connection', socket => {
          serverSocket = socket;
        });
        clientSocket.on('connect', done);
      });
    });

    afterAll(() => {
      clientSocket.disconnect();
      serverSocket.disconnect();
      io.close();
    });

    it('should join a chat room when "joinChat" event is emitted', done => {
      serverSocket.on('joinChat', arg => {
        expect(io.sockets.adapter.rooms.has('chat123')).toBeTruthy();
        expect(arg).toBe('chat123');
        done();
      });
      clientSocket.emit('joinChat', 'chat123');
    });

    it('should leave a chat room when "leaveChat" event is emitted', done => {
      serverSocket.on('joinChat', arg => {
        expect(io.sockets.adapter.rooms.has('chat123')).toBeTruthy();
        expect(arg).toBe('chat123');
      });
      serverSocket.on('leaveChat', arg => {
        expect(io.sockets.adapter.rooms.has('chat123')).toBeFalsy();
        expect(arg).toBe('chat123');
        done();
      });

      clientSocket.emit('joinChat', 'chat123');
      clientSocket.emit('leaveChat', 'chat123');
    });
  });

  describe('POST /chat/:chatId/rename', () => {
    it('should rename the chat successfully', async () => {
      const chatId = new mongoose.Types.ObjectId();
      const newName = 'Renamed Chat';

      const updatedChat = {
        _id: chatId,
        name: newName,
        participants: ['user1', 'user2'],
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      renameChatSpy.mockResolvedValue(updatedChat);

      const response = await supertest(app).put(`/chat/${chatId}/rename`).send({ newName });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(newName);
      expect(renameChatSpy).toHaveBeenCalledWith(chatId.toString(), newName);
    });

    it('should return 400 if newName is missing', async () => {
      const chatId = new mongoose.Types.ObjectId();

      const response = await supertest(app).put(`/chat/${chatId}/rename`).send({});

      expect(response.status).toBe(400);
      expect(response.text).toBe('Chat name is required');
      expect(renameChatSpy).not.toHaveBeenCalled();
    });

    it('should return 500 if renameChat throws an error', async () => {
      const chatId = new mongoose.Types.ObjectId().toString();
      const newName = 'Exploding Chat';

      renameChatSpy.mockRejectedValue(new Error('Database error'));

      const response = await supertest(app).put(`/chat/${chatId}/rename`).send({ newName });

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error renaming chat: Database error');
    });
  });
});
