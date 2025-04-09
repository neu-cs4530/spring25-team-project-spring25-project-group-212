import mongoose from 'mongoose';
import { populateDocument, populateDatabaseCommunity } from '../../utils/database.util';
import QuestionModel from '../../models/questions.model';
import AnswerModel from '../../models/answers.model';
import ChatModel from '../../models/chat.model';
import UserModel from '../../models/users.model';
import * as databaseUtil from '../../utils/database.util';

import {
  PopulatedDatabaseChat,
  PopulatedDatabaseQuestion,
  DatabaseCommunity,
} from '../../types/types';

jest.mock('../../models/questions.model');
jest.mock('../../models/answers.model');
jest.mock('../../models/chat.model');
jest.mock('../../models/messages.model');
jest.mock('../../models/users.model');
jest.mock('../../models/tags.model');
jest.mock('../../models/comments.model');

// Make sure your mocks use ObjectIds correctly:
const chatObjectId = new mongoose.Types.ObjectId('507f191e810c19729de860ea');
const questionObjectId1 = new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6fe');
const questionObjectId2 = new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6ff');
const populateDocumentMock = jest.spyOn(databaseUtil, 'populateDocument');

const mockCommunity: DatabaseCommunity = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test Community',
  about: 'A test community',
  rules: 'Be nice',
  members: ['user1'],
  admins: ['user1'],
  createdBy: 'user1',
  groupChatId: chatObjectId,
  questions: [questionObjectId1, questionObjectId2],
  pendingInvites: [],
  memberHistory: [],
};

const mockPopulatedChat: PopulatedDatabaseChat = {
  _id: chatObjectId,
  messages: [],
  participants: ['user1'],
  name: 'Test Chat',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPopulatedQuestion1: PopulatedDatabaseQuestion = {
  _id: questionObjectId1,
  title: 'Q1 Title',
  text: 'Q1 Text',
  tags: [],
  answers: [],
  askedBy: 'user1',
  askDateTime: new Date(),
  views: [],
  upVotes: [],
  downVotes: [],
  comments: [],
  useMarkdown: false,
  anonymous: false,
};

const mockPopulatedQuestion2: PopulatedDatabaseQuestion = {
  _id: questionObjectId2,
  title: 'Q2 Title',
  text: 'Q2 Text',
  tags: [],
  answers: [],
  askedBy: 'user1',
  askDateTime: new Date(),
  views: [],
  upVotes: [],
  downVotes: [],
  comments: [],
  useMarkdown: false,
  anonymous: false,
};

describe('populateDocument', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and populate a question document', async () => {
    const mockQuestion = {
      _id: 'questionId',
      tags: ['tagId'],
      answers: ['answerId'],
      comments: ['commentId'],
    };
    (QuestionModel.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockQuestion),
    });

    const result = await populateDocument('questionId', 'question');

    expect(QuestionModel.findOne).toHaveBeenCalledWith({ _id: 'questionId' });
    expect(result).toEqual(mockQuestion);
  });

  it('should return an error message if question document is not found', async () => {
    (QuestionModel.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    const questionID = 'invalidQuestionId';
    const result = await populateDocument(questionID, 'question');

    expect(result).toEqual({
      error: `Error when fetching and populating a document: Failed to fetch and populate question with ID: ${
        questionID
      }`,
    });
  });

  it('should return an error message if fetching a question document throws an error', async () => {
    (QuestionModel.findOne as jest.Mock).mockImplementation(() => {
      throw new Error('Database error');
    });

    const result = await populateDocument('questionId', 'question');

    expect(result).toEqual({
      error: 'Error when fetching and populating a document: Database error',
    });
  });

  it('should fetch and populate an answer document', async () => {
    const mockAnswer = {
      _id: 'answerId',
      comments: ['commentId'],
    };
    (AnswerModel.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockAnswer),
    });

    const result = await populateDocument('answerId', 'answer');

    expect(AnswerModel.findOne).toHaveBeenCalledWith({ _id: 'answerId' });
    expect(result).toEqual(mockAnswer);
  });

  it('should return an error message if answer document is not found', async () => {
    (AnswerModel.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    const answerID = 'invalidAnswerId';
    const result = await populateDocument(answerID, 'answer');

    expect(result).toEqual({
      error: `Error when fetching and populating a document: Failed to fetch and populate answer with ID: ${
        answerID
      }`,
    });
  });

  it('should return an error message if fetching an answer document throws an error', async () => {
    (AnswerModel.findOne as jest.Mock).mockImplementation(() => {
      throw new Error('Database error');
    });

    const result = await populateDocument('answerId', 'answer');

    expect(result).toEqual({
      error: 'Error when fetching and populating a document: Database error',
    });
  });

  it('should fetch and populate a chat document', async () => {
    const mockChat = {
      _id: 'chatId',
      messages: [
        {
          _id: 'messageId',
          msg: 'Hello',
          msgFrom: 'user1',
          msgDateTime: new Date(),
          type: 'text',
        },
      ],
      toObject: jest.fn().mockReturnValue({
        _id: 'chatId',
        messages: [
          {
            _id: 'messageId',
            msg: 'Hello',
            msgFrom: 'user1',
            msgDateTime: new Date(),
            type: 'text',
          },
        ],
      }),
    };
    const mockUser = {
      _id: 'userId',
      username: 'user1',
    };
    (ChatModel.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockChat),
    });
    (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

    const result = await populateDocument('chatId', 'chat');

    expect(ChatModel.findOne).toHaveBeenCalledWith({ _id: 'chatId' });
    expect(result).toEqual({
      ...mockChat.toObject(),
      messages: [
        {
          _id: 'messageId',
          msg: 'Hello',
          msgFrom: 'user1',
          msgDateTime: mockChat.messages[0].msgDateTime,
          type: 'text',
          user: {
            _id: 'userId',
            username: 'user1',
          },
          seenBy: [],
          useMarkdown: undefined,
        },
      ],
    });
  });

  it('should return an error message if chat document is not found', async () => {
    (ChatModel.findOne as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    const result = await populateDocument('invalidChatId', 'chat');

    expect(result).toEqual({
      error: 'Error when fetching and populating a document: Chat not found',
    });
  });

  it('should return an error message if fetching a chat document throws an error', async () => {
    (ChatModel.findOne as jest.Mock).mockImplementation(() => {
      throw new Error('Database error');
    });

    const result = await populateDocument('chatId', 'chat');

    expect(result).toEqual({
      error: 'Error when fetching and populating a document: Database error',
    });
  });

  it('should return an error message if type is invalid', async () => {
    const invalidType = 'invalidType' as 'question' | 'answer' | 'chat';
    const result = await populateDocument('someId', invalidType);
    expect(result).toEqual({
      error: 'Error when fetching and populating a document: Invalid type provided.',
    });
  });
});

describe('populateDatabaseCommunity', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should populate chat and all questions successfully', async () => {
    // Spy on the populateDocument function

    // Fake behavior: return the correct objects based on the type
    populateDocumentMock.mockImplementation(
      async (id: string, type: 'question' | 'answer' | 'chat') => {
        if (type === 'chat') return mockPopulatedChat;
        if (type === 'question') {
          if (id === questionObjectId1.toString()) return mockPopulatedQuestion1;
          if (id === questionObjectId2.toString()) return mockPopulatedQuestion2;
        }
        return { error: 'Unknown type' };
      },
    );

    const result = await populateDatabaseCommunity(mockCommunity);

    expect(result.groupChat).toEqual(mockPopulatedChat);
    expect(result.questions).toEqual([mockPopulatedQuestion1, mockPopulatedQuestion2]);
    expect(result._id).toEqual(mockCommunity._id);
  });

  it('should throw an error if populateDocument returns an error for chat', async () => {
    const community: DatabaseCommunity = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test',
      about: 'About',
      rules: 'Rules',
      members: ['user1'],
      admins: ['user1'],
      createdBy: 'user1',
      groupChatId: new mongoose.Types.ObjectId(),
      questions: [],
      pendingInvites: [],
      memberHistory: [],
    };

    jest
      .spyOn(databaseUtil, 'populateDocument')
      .mockImplementationOnce(async () => ({ error: 'Chat not found' }));

    await expect(populateDatabaseCommunity(community)).rejects.toThrow(
      'populateDatabaseCommunity chat: Chat not found',
    );
  });

  it('should throw an error if populateDocument returns an error for a question', async () => {
    const qid = new mongoose.Types.ObjectId();
    const community: DatabaseCommunity = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test',
      about: 'About',
      rules: 'Rules',
      members: ['user1'],
      admins: ['user1'],
      createdBy: 'user1',
      groupChatId: new mongoose.Types.ObjectId(),
      questions: [qid],
      pendingInvites: [],
      memberHistory: [],
    };

    // First call for chat succeeds
    const chatMock = {
      _id: new mongoose.Types.ObjectId(),
      messages: [],
      participants: ['user1'],
      name: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const populateMock = jest.spyOn(databaseUtil, 'populateDocument');
    populateMock
      .mockImplementationOnce(async () => chatMock) // chat
      .mockImplementationOnce(async () => ({ error: 'Question not found' })); // question

    await expect(populateDatabaseCommunity(community)).rejects.toThrow(
      'populateDatabaseCommunity question: Question not found',
    );
  });
});
