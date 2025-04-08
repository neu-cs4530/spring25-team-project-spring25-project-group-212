import { ObjectId } from 'mongodb';
import supertest from 'supertest';
import mongoose from 'mongoose';
import * as util from '../../services/community.service';
import { app } from '../../app';
import {
  Community,
  CreateCommunityRequest,
  DatabaseChat,
  PopulatedDatabaseChat,
  PopulatedDatabaseCommunity,
} from '../../types/types';
import * as databaseUtil from '../../utils/database.util';

const saveCommunitySpy = jest.spyOn(util, 'saveCommunity');
const getCommunityByIdSpy = jest.spyOn(util, 'getCommunityById');
const populateDatabaseCommunitySpy = jest.spyOn(databaseUtil, 'populateDatabaseCommunity');
// jest.mock('../../controllers/community.controller', () => ({
//   ...jest.requireActual('../../controllers/community.controller'),
//   populateDatabaseCommunity: jest.fn(),
// }));
const now = new Date();

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
  participants: ['user1'],
  messages: [],
  createdAt: now,
  updatedAt: now,
};

const populatedChatResponse2: PopulatedDatabaseChat = {
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
  createdAt: now,
  updatedAt: now,
};

const savedCommunity = {
  _id: new ObjectId(),
  name: 'C++',
  about: 'about',
  rules: 'rules',
  members: ['user1'],
  admins: ['user1'],
  createdBy: 'user1',
  groupChatId: new ObjectId(),
  questions: [],
  pendingInvites: [],
  memberHistory: [{ _id: new ObjectId(), date: now, count: 1 }],
};

const savedCommunity2 = {
  _id: new ObjectId(),
  name: 'Java',
  about: 'about2',
  rules: 'rules2',
  members: ['user2'],
  admins: ['user2'],
  createdBy: 'user2',
  groupChatId: new ObjectId(),
  questions: [],
  pendingInvites: [],
  memberHistory: [{ _id: new ObjectId(), date: now, count: 1 }],
};

const populatedSavedCommunity = {
  _id: new ObjectId(),
  name: 'C++',
  about: 'about',
  rules: 'rules',
  members: ['user1'],
  admins: ['user1'],
  createdBy: 'user1',
  groupChat: populatedChatResponse,
  questions: [],
  pendingInvites: [],
  memberHistory: [{ _id: new ObjectId(), date: now, count: 1 }],
};

describe('Test communityController', () => {
  describe('POST /create', () => {
    it('should create a new community given the correct args', async () => {
      const mockReqBodyCommunity: Omit<Community, 'groupChat' | 'questions'> = {
        name: 'C++',
        about: 'about',
        rules: 'rules',
        members: ['user1'],
        admins: ['user1'],
        pendingInvites: [],
        createdBy: 'user1',
        memberHistory: [],
      };

      const mockReqBody = {
        community: mockReqBodyCommunity,
      };

      const populatedChatResponseWithIsoString = {
        _id: populatedChatResponse._id.toString(),
        name: '',
        participants: ['user1'],
        messages: [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      const memberHistoryWithIsoString = [
        {
          _id: populatedSavedCommunity.memberHistory[0]._id.toString(),
          date: now.toISOString(),
          count: 1,
        },
      ];

      const populatedSavedCommunityWithUpdatedGroupChat = {
        ...populatedSavedCommunity,
        _id: populatedSavedCommunity._id.toString(),
        groupChat: populatedChatResponseWithIsoString,
        memberHistory: memberHistoryWithIsoString,
      };

      saveCommunitySpy.mockResolvedValueOnce({ ...savedCommunity });
      populateDatabaseCommunitySpy.mockResolvedValueOnce(populatedSavedCommunity);
      const response = await supertest(app).post('/community/create').send(mockReqBody);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(populatedSavedCommunityWithUpdatedGroupChat);
    });

    it('should return 400 for a request missing body', async () => {
      const response = await supertest(app).post('/community/create');
      expect(response.status).toEqual(400);
    });

    it('should return 400 for a request missing community', async () => {
      const response = await supertest(app)
        .post('/community/create')
        .send({ something: 'something' });
      expect(response.status).toEqual(400);
    });

    it('should return 400 for a request missing name', async () => {
      const mockReqBodyCommunity = {
        about: 'about',
        rules: 'rules',
        members: ['user1'],
        admins: ['user1'],
        pendingInvites: [],
        createdBy: 'user1',
        memberHistory: [],
      };

      const mockReqBody = {
        community: mockReqBodyCommunity,
      };
      const response = await supertest(app).post('/community/create').send(mockReqBody);
      expect(response.status).toEqual(400);
    });

    it('should return 400 for a request missing name (blank)', async () => {
      const mockReqBodyCommunity = {
        name: '',
        about: 'about',
        rules: 'rules',
        members: ['user1'],
        admins: ['user1'],
        pendingInvites: [],
        createdBy: 'user1',
        memberHistory: [],
      };

      const mockReqBody = {
        community: mockReqBodyCommunity,
      };
      const response = await supertest(app).post('/community/create').send(mockReqBody);
      expect(response.status).toEqual(400);
    });

    it('should return 400 for a request missing about', async () => {
      const mockReqBodyCommunity = {
        name: 'C++',
        rules: 'rules',
        members: ['user1'],
        admins: ['user1'],
        pendingInvites: [],
        createdBy: 'user1',
        memberHistory: [],
      };

      const mockReqBody = {
        community: mockReqBodyCommunity,
      };
      const response = await supertest(app).post('/community/create').send(mockReqBody);
      expect(response.status).toEqual(400);
    });

    it('should return 400 for a request missing about (blank)', async () => {
      const mockReqBodyCommunity = {
        name: 'C++',
        about: '',
        rules: 'rules',
        members: ['user1'],
        admins: ['user1'],
        pendingInvites: [],
        createdBy: 'user1',
        memberHistory: [],
      };

      const mockReqBody = {
        community: mockReqBodyCommunity,
      };
      const response = await supertest(app).post('/community/create').send(mockReqBody);
      expect(response.status).toEqual(400);
    });

    it('should return 400 for a request missing rules', async () => {
      const mockReqBodyCommunity = {
        name: 'C++',
        about: 'about',
        members: ['user1'],
        admins: ['user1'],
        pendingInvites: [],
        createdBy: 'user1',
        memberHistory: [],
      };

      const mockReqBody = {
        community: mockReqBodyCommunity,
      };
      const response = await supertest(app).post('/community/create').send(mockReqBody);
      expect(response.status).toEqual(400);
    });

    it('should return 400 for a request missing rules (blank)', async () => {
      const mockReqBodyCommunity = {
        name: 'C++',
        about: 'about',
        rules: '',
        members: ['user1'],
        admins: ['user1'],
        pendingInvites: [],
        createdBy: 'user1',
        memberHistory: [],
      };

      const mockReqBody = {
        community: mockReqBodyCommunity,
      };
      const response = await supertest(app).post('/community/create').send(mockReqBody);
      expect(response.status).toEqual(400);
    });

    it('should return 400 for a request missing members', async () => {
      const mockReqBodyCommunity = {
        name: 'C++',
        about: 'about',
        rules: 'rules',
        admins: ['user1'],
        pendingInvites: [],
        createdBy: 'user1',
        memberHistory: [],
      };

      const mockReqBody = {
        community: mockReqBodyCommunity,
      };
      const response = await supertest(app).post('/community/create').send(mockReqBody);
      expect(response.status).toEqual(400);
    });

    it('should return 400 for a request where members is not array', async () => {
      const mockReqBodyCommunity = {
        name: 'C++',
        about: 'about',
        rules: 'rules',
        members: 'user1',
        admins: ['user1'],
        pendingInvites: [],
        createdBy: 'user1',
        memberHistory: [],
      };

      const mockReqBody = {
        community: mockReqBodyCommunity,
      };
      const response = await supertest(app).post('/community/create').send(mockReqBody);
      expect(response.status).toEqual(400);
    });

    it('should return 400 for a request missing createdBy', async () => {
      const mockReqBodyCommunity = {
        name: 'C++',
        about: 'about',
        rules: 'rules',
        members: ['user1'],
        admins: ['user1'],
        pendingInvites: [],
        memberHistory: [],
      };

      const mockReqBody = {
        community: mockReqBodyCommunity,
      };
      const response = await supertest(app).post('/community/create').send(mockReqBody);
      expect(response.status).toEqual(400);
    });

    it('should return 400 for a request missing createdBy (blank)', async () => {
      const mockReqBodyCommunity = {
        name: 'C++',
        about: 'about',
        rules: 'rules',
        members: ['user1'],
        admins: ['user1'],
        pendingInvites: [],
        createdBy: '',
        memberHistory: [],
      };

      const mockReqBody = {
        community: mockReqBodyCommunity,
      };
      const response = await supertest(app).post('/community/create').send(mockReqBody);
      expect(response.status).toEqual(400);
    });

    it('should return 500 error when error creating community in db', async () => {
      const mockReqBodyCommunity: Omit<Community, 'groupChat' | 'questions'> = {
        name: 'C++',
        about: 'about',
        rules: 'rules',
        members: ['user1'],
        admins: ['user1'],
        pendingInvites: [],
        createdBy: 'user1',
        memberHistory: [],
      };

      const mockReqBody = {
        community: mockReqBodyCommunity,
      };

      saveCommunitySpy.mockResolvedValueOnce({ error: 'error creating community' });
      // populateDatabaseCommunitySpy.mockResolvedValueOnce(populatedSavedCommunity);
      const response = await supertest(app).post('/community/create').send(mockReqBody);
      expect(response.status).toEqual(500);
    });
  });

  describe('GET /getCommunity', () => {
    it('should return the community given the correct args', async () => {
      getCommunityByIdSpy.mockResolvedValueOnce(savedCommunity);
      populateDatabaseCommunitySpy.mockResolvedValueOnce(populatedSavedCommunity);
      const populatedChatResponseWithIsoString = {
        _id: populatedChatResponse._id.toString(),
        name: '',
        participants: ['user1'],
        messages: [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      const memberHistoryWithIsoString = [
        {
          _id: populatedSavedCommunity.memberHistory[0]._id.toString(),
          date: now.toISOString(),
          count: 1,
        },
      ];

      const populatedSavedCommunityWithUpdatedGroupChat = {
        ...populatedSavedCommunity,
        _id: populatedSavedCommunity._id.toString(),
        groupChat: populatedChatResponseWithIsoString,
        memberHistory: memberHistoryWithIsoString,
      };
      const res = await supertest(app).get(
        `/community/getCommunity/${savedCommunity._id.toString()}`,
      );
      expect(res.status).toEqual(200);
      expect(res.body).toEqual(populatedSavedCommunityWithUpdatedGroupChat);
    });

    it('should return 500 error if error getting community by ID from DB', async () => {
      const mockReqBodyCommunity: Omit<Community, 'groupChat' | 'questions'> = {
        name: 'C++',
        about: 'about',
        rules: 'rules',
        members: ['user1'],
        admins: ['user1'],
        pendingInvites: [],
        createdBy: 'user1',
        memberHistory: [],
      };

      const mockReqBody = {
        community: mockReqBodyCommunity,
      };

      getCommunityByIdSpy.mockResolvedValueOnce({ error: 'error getting community' });
      const response = await supertest(app)
        .get(`/community/getCommunity/${savedCommunity._id.toString()}`)
        .send(mockReqBody);
      expect(response.status).toEqual(500);
    });

    it('should return 500 error if error populating community', async () => {
      getCommunityByIdSpy.mockResolvedValueOnce(savedCommunity);
      populateDatabaseCommunitySpy.mockRejectedValueOnce(new Error());
      const res = await supertest(app).get(
        `/community/getCommunity/${savedCommunity._id.toString()}`,
      );
      expect(res.status).toEqual(500);
    });
  });
});
