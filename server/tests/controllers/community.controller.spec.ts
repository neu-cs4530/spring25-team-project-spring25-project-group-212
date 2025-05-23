import { ObjectId } from 'mongodb';
import supertest from 'supertest';
import mongoose from 'mongoose';
import * as util from '../../services/community.service';
import { app } from '../../app';
import { Community, PopulatedDatabaseChat } from '../../types/types';
import * as databaseUtil from '../../utils/database.util';
import { POPULATED_QUESTIONS } from '../mockData.models';
import { T2_DESC, T3_DESC } from '../../data/posts_strings';

const saveCommunitySpy = jest.spyOn(util, 'saveCommunity');
const getCommunityByIdSpy = jest.spyOn(util, 'getCommunityById');
const populateDatabaseCommunitySpy = jest.spyOn(databaseUtil, 'populateDatabaseCommunity');
const getAllCommunitiesSpy = jest.spyOn(util, 'getAllCommunities');
const getQuestionsForCommunitySpy = jest.spyOn(util, 'getQuestionsForCommunity');
const saveQuestionToCommunitySpy = jest.spyOn(util, 'saveQuestionToCommunity');
const joinCommunityServiceSpy = jest.spyOn(util, 'joinCommunityService');
const updateCommunitySpy = jest.spyOn(util, 'updateCommunity');

const now = new Date();

const populatedChatResponse: PopulatedDatabaseChat = {
  _id: new mongoose.Types.ObjectId(),
  name: '',
  participants: ['user1'],
  messages: [],
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

  describe('GET /getAll', () => {
    it('should return all communities in the DB', async () => {
      getAllCommunitiesSpy.mockResolvedValueOnce([savedCommunity]);
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
      const res = await supertest(app).get('/community/getAll');
      expect(res.status).toEqual(200);
      expect(res.body).toEqual([populatedSavedCommunityWithUpdatedGroupChat]);
    });

    it('should return 500 error if error when retrieving all communities from DB', async () => {
      getAllCommunitiesSpy.mockResolvedValueOnce({ error: 'error getting all communities' });
      const res = await supertest(app).get('/community/getAll');
      expect(res.status).toEqual(500);
    });

    it('should return 500 error if error when populating all communities', async () => {
      getAllCommunitiesSpy.mockResolvedValueOnce([savedCommunity]);
      populateDatabaseCommunitySpy.mockRejectedValueOnce(new Error());
      const res = await supertest(app).get('/community/getAll');
      expect(res.status).toEqual(500);
    });
  });

  describe('GET /getQuestions', () => {
    it('should return all questions associated with that community', async () => {
      const tag2 = {
        _id: new ObjectId('65e9a5c2b26199dbcc3e6dc8').toString(),
        name: 'javascript',
        description: T2_DESC,
      };

      const tag3 = {
        _id: new ObjectId('65e9b4b1766fca9451cba653').toString(),
        name: 'android',
        description: T3_DESC,
      };
      getQuestionsForCommunitySpy.mockResolvedValueOnce([POPULATED_QUESTIONS[0]]);
      const ans1IsoString = {
        _id: new ObjectId('65e9b58910afe6e94fc6e6dc').toString(),
        text: 'ans1',
        ansBy: 'ansBy1',
        ansDateTime: new Date('2023-11-18T09:24:00').toISOString(),
        comments: [],
        useMarkdown: false,
      };

      const ans2IsoString = {
        _id: new ObjectId('65e9b58910afe6e94fc6e6dd').toString(),
        text: 'ans2',
        ansBy: 'ansBy2',
        ansDateTime: new Date('2023-11-20T09:24:00').toISOString(),
        comments: [],
        useMarkdown: false,
      };

      const populatedQuestion0WithIsoStrings = {
        _id: new ObjectId('65e9b58910afe6e94fc6e6dc').toString(),
        title: 'Quick question about storage on android',
        text: 'I would like to know the best way to go about storing an array on an android phone so that even when the app/activity ended the data remains',
        tags: [tag3, tag2],
        answers: [
          { ...ans1IsoString, comments: [] },
          { ...ans2IsoString, comments: [] },
        ],
        askedBy: 'q_by1',
        askDateTime: new Date('2023-11-16T09:24:00').toISOString(),
        views: ['question1_user', 'question2_user'],
        upVotes: [],
        downVotes: [],
        comments: [],
        useMarkdown: false,
        anonymous: false,
      };
      const res = await supertest(app).get(
        `/community/getQuestions/${populatedSavedCommunity._id.toString()}`,
      );
      expect(res.status).toEqual(200);
      expect(res.body).toEqual([populatedQuestion0WithIsoStrings]);
    });

    it('should return a 500 error if all questions associated with that community could not be found', async () => {
      getQuestionsForCommunitySpy.mockRejectedValueOnce(new Error());
      const res = await supertest(app).get(
        `/community/getQuestions/${populatedSavedCommunity._id.toString()}`,
      );
      expect(res.status).toEqual(500);
    });
  });

  describe('POST /addQuestionToCommunity', () => {
    it('should return the updated community with the question added when successful', async () => {
      const tag2 = {
        _id: new ObjectId('65e9a5c2b26199dbcc3e6dc8').toString(),
        name: 'javascript',
        description: T2_DESC,
      };

      const tag3 = {
        _id: new ObjectId('65e9b4b1766fca9451cba653').toString(),
        name: 'android',
        description: T3_DESC,
      };
      getQuestionsForCommunitySpy.mockResolvedValueOnce([POPULATED_QUESTIONS[0]]);
      const ans1IsoString = {
        _id: new ObjectId('65e9b58910afe6e94fc6e6dc').toString(),
        text: 'ans1',
        ansBy: 'ansBy1',
        ansDateTime: new Date('2023-11-18T09:24:00').toISOString(),
        comments: [],
        useMarkdown: false,
      };

      const ans2IsoString = {
        _id: new ObjectId('65e9b58910afe6e94fc6e6dd').toString(),
        text: 'ans2',
        ansBy: 'ansBy2',
        ansDateTime: new Date('2023-11-20T09:24:00').toISOString(),
        comments: [],
        useMarkdown: false,
      };

      const populatedQuestion0WithIsoStrings = {
        _id: new ObjectId('65e9b58910afe6e94fc6e6dc').toString(),
        title: 'Quick question about storage on android',
        text: 'I would like to know the best way to go about storing an array on an android phone so that even when the app/activity ended the data remains',
        tags: [tag3, tag2],
        answers: [
          { ...ans1IsoString, comments: [] },
          { ...ans2IsoString, comments: [] },
        ],
        askedBy: 'q_by1',
        askDateTime: new Date('2023-11-16T09:24:00').toISOString(),
        views: ['question1_user', 'question2_user'],
        upVotes: [],
        downVotes: [],
        comments: [],
        useMarkdown: false,
        anonymous: false,
      };

      const savedCommunityWithAddedQuestion = {
        _id: savedCommunity._id,
        name: 'C++',
        about: 'about',
        rules: 'rules',
        members: ['user1'],
        admins: ['user1'],
        createdBy: 'user1',
        groupChatId: savedCommunity.groupChatId,
        questions: [new ObjectId(populatedQuestion0WithIsoStrings._id)],
        pendingInvites: [],
        memberHistory: [{ _id: savedCommunity.memberHistory[0]._id, date: now, count: 1 }],
      };

      const populatedSavedCommunityWithAddedQuestionIso = {
        ...populatedSavedCommunity,
        _id: populatedSavedCommunity._id.toString(),
        questions: [populatedQuestion0WithIsoStrings],
        groupChat: {
          ...populatedChatResponse,
          _id: populatedChatResponse._id.toString(),
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
        memberHistory: [
          {
            ...populatedSavedCommunity.memberHistory[0],
            _id: populatedSavedCommunity.memberHistory[0]._id.toString(),
            date: now.toISOString(),
          },
        ],
      };

      const populatedSavedCommunityWithAddedQuestion = {
        ...populatedSavedCommunity,
        questions: [POPULATED_QUESTIONS[0]],
      };

      saveQuestionToCommunitySpy.mockResolvedValueOnce(savedCommunityWithAddedQuestion);
      populateDatabaseCommunitySpy.mockResolvedValueOnce(populatedSavedCommunityWithAddedQuestion);

      const res = await supertest(app)
        .post(
          `/community/addQuestionToCommunity/${populatedSavedCommunityWithAddedQuestion._id.toString()}`,
        )
        .send(populatedQuestion0WithIsoStrings._id);

      expect(res.status).toEqual(200);
      expect(res.body).toEqual(populatedSavedCommunityWithAddedQuestionIso);
    });

    it('should return a 500 error ', async () => {
      saveQuestionToCommunitySpy.mockResolvedValueOnce({
        error: 'error saving question to community',
      });

      const res = await supertest(app)
        .post('/community/addQuestionToCommunity/someCommunityId')
        .send('someQuestionId');

      expect(res.status).toEqual(500);
    });
  });

  describe('POST /join', () => {
    const savedCommunityWithUser2 = {
      _id: savedCommunity._id,
      name: 'C++',
      about: 'about',
      rules: 'rules',
      members: ['user1', 'user2'],
      admins: ['user1'],
      createdBy: 'user1',
      groupChatId: new ObjectId(),
      questions: [],
      pendingInvites: [],
      memberHistory: [{ _id: new ObjectId(), date: now, count: 1 }],
    };

    const populatedSavedCommunityWithUser2 = {
      _id: populatedSavedCommunity._id,
      name: 'C++',
      about: 'about',
      rules: 'rules',
      members: ['user1', 'user2'],
      admins: ['user1'],
      createdBy: 'user1',
      groupChat: populatedChatResponse,
      questions: [],
      pendingInvites: [],
      memberHistory: [{ _id: new ObjectId(), date: now, count: 1 }],
    };
    it('should successfully join user into community when given correct args', async () => {
      joinCommunityServiceSpy.mockResolvedValueOnce(savedCommunity);
      updateCommunitySpy.mockResolvedValueOnce(savedCommunityWithUser2);
      populateDatabaseCommunitySpy.mockResolvedValueOnce(populatedSavedCommunityWithUser2);
      const res = await supertest(app)
        .post(`/community/join/${populatedSavedCommunityWithUser2._id.toString()}`)
        .send('user2');
      expect(res.status).toEqual(200);
    });

    it('should return 500 error when joinCommunityService fails', async () => {
      joinCommunityServiceSpy.mockRejectedValueOnce({ error: 'error joining user to community' });
      const res = await supertest(app)
        .post(`/community/join/${populatedSavedCommunityWithUser2._id.toString()}`)
        .send('user2');
      expect(res.status).toEqual(500);
    });

    it('should return 500 error when updateCommunity fails', async () => {
      joinCommunityServiceSpy.mockResolvedValueOnce(savedCommunity);
      updateCommunitySpy.mockRejectedValueOnce({ error: 'error updating community' });
      const res = await supertest(app)
        .post(`/community/join/${populatedSavedCommunityWithUser2._id.toString()}`)
        .send('user2');
      expect(res.status).toEqual(500);
    });

    it('should return 500 error when populateDatabaseCommunity throws an error', async () => {
      joinCommunityServiceSpy.mockResolvedValueOnce(savedCommunity);
      updateCommunitySpy.mockResolvedValueOnce(savedCommunityWithUser2);
      populateDatabaseCommunitySpy.mockRejectedValueOnce(new Error());
      const res = await supertest(app)
        .post(`/community/join/${populatedSavedCommunityWithUser2._id.toString()}`)
        .send('user2');
      expect(res.status).toEqual(500);
    });
    it('should return 500 error when joinCommunityService returns an error object', async () => {
      joinCommunityServiceSpy.mockResolvedValueOnce({ error: 'error joining user to community' });

      const res = await supertest(app)
        .post(`/community/join/${populatedSavedCommunityWithUser2._id.toString()}`)
        .send('user2');

      expect(res.status).toEqual(500);
      expect(res.text).toContain('error joining user to community');
    });
    it('should return 500 error when updateCommunity returns an error object', async () => {
      joinCommunityServiceSpy.mockResolvedValueOnce(savedCommunity);
      updateCommunitySpy.mockResolvedValueOnce({ error: 'error updating community' });

      const res = await supertest(app)
        .post(`/community/join/${populatedSavedCommunityWithUser2._id.toString()}`)
        .send('user2');

      expect(res.status).toEqual(500);
      expect(res.text).toContain('error updating community');
    });
  });

  describe('PATCH /updateCommunityNameAboutRules', () => {
    const savedCommunityWithUpdatedNameAboutRules = {
      _id: new ObjectId(),
      name: 'C++2',
      about: 'about2',
      rules: 'rules2',
      members: ['user1'],
      admins: ['user1'],
      createdBy: 'user1',
      groupChatId: new ObjectId(),
      questions: [],
      pendingInvites: [],
      memberHistory: [{ _id: new ObjectId(), date: now, count: 1 }],
    };

    const populatedSavedCommunityWithUpdatedNameAboutRules = {
      _id: new ObjectId(),
      name: 'C++2',
      about: 'about2',
      rules: 'rules2',
      members: ['user1'],
      admins: ['user1'],
      createdBy: 'user1',
      groupChat: populatedChatResponse,
      questions: [],
      pendingInvites: [],
      memberHistory: [{ _id: new ObjectId(), date: now, count: 1 }],
    };

    const populatedSavedCommunityWithUpdatedNameAboutRulesIso = {
      _id: populatedSavedCommunityWithUpdatedNameAboutRules._id.toString(),
      name: 'C++2',
      about: 'about2',
      rules: 'rules2',
      members: ['user1'],
      admins: ['user1'],
      createdBy: 'user1',
      groupChat: {
        ...populatedChatResponse,
        _id: populatedChatResponse._id.toString(),
        createdAt: populatedChatResponse.createdAt.toISOString(),
        updatedAt: populatedChatResponse.updatedAt.toISOString(),
      },
      questions: [],
      pendingInvites: [],
      memberHistory: [
        {
          _id: populatedSavedCommunityWithUpdatedNameAboutRules.memberHistory[0]._id.toString(),
          date: now.toISOString(),
          count: 1,
        },
      ],
    };
    it('should successfully update name, about, and rules given correct args', async () => {
      updateCommunitySpy.mockResolvedValueOnce(savedCommunityWithUpdatedNameAboutRules);
      populateDatabaseCommunitySpy.mockResolvedValueOnce(
        populatedSavedCommunityWithUpdatedNameAboutRules,
      );

      const res = await supertest(app)
        .patch(
          `/community/updateCommunityNameAboutRules/${savedCommunityWithUpdatedNameAboutRules._id.toString()}`,
        )
        .send({ name: 'C++2', about: 'about2', rules: 'rules2' });

      expect(res.status).toEqual(200);
      expect(res.body).toEqual(populatedSavedCommunityWithUpdatedNameAboutRulesIso);
    });

    it('should return 400 error if update body is invalid', async () => {
      const res = await supertest(app)
        .patch(
          `/community/updateCommunityNameAboutRules/${savedCommunityWithUpdatedNameAboutRules._id.toString()}`,
        )
        .send({ about: 'about2', rules: 'rules2' });
      expect(res.status).toEqual(400);
    });

    it('should return 500 error if updateCommunity fails', async () => {
      updateCommunitySpy.mockResolvedValueOnce({ error: 'error updating community' });
      const res = await supertest(app)
        .patch(
          `/community/updateCommunityNameAboutRules/${savedCommunityWithUpdatedNameAboutRules._id.toString()}`,
        )
        .send({ name: 'C++2', about: 'about2', rules: 'rules2' });
      expect(res.status).toEqual(500);
    });
  });

  describe('PATCH /inviteUserToCommunity', () => {
    const communityId = new mongoose.Types.ObjectId();
    const username = 'newUser';

    const updatedCommunity = {
      ...savedCommunity,
      pendingInvites: [username],
    };

    const populatedUpdatedCommunity = {
      _id: communityId,
      name: 'C++',
      about: 'about',
      rules: 'rules',
      members: ['user1'],
      admins: ['user1'],
      createdBy: 'user1',
      groupChat: {
        _id: populatedChatResponse._id,
        name: '',
        participants: ['user1'],
        messages: [],
        createdAt: populatedChatResponse.createdAt,
        updatedAt: populatedChatResponse.updatedAt,
      },
      questions: [],
      pendingInvites: [username],
      memberHistory: savedCommunity.memberHistory,
    };

    const populatedUpdatedCommunityIso = {
      ...populatedUpdatedCommunity,
      _id: populatedUpdatedCommunity._id.toString(),
      groupChat: {
        ...populatedUpdatedCommunity.groupChat,
        _id: populatedUpdatedCommunity.groupChat._id.toString(),
        createdAt: populatedUpdatedCommunity.groupChat.createdAt.toISOString(),
        updatedAt: populatedUpdatedCommunity.groupChat.updatedAt.toISOString(),
      },
      memberHistory: populatedUpdatedCommunity.memberHistory.map(entry => ({
        ...entry,
        _id: entry._id.toString(),
        date: entry.date.toISOString(),
      })),
    };

    it('should successfully invite a user to the community', async () => {
      getCommunityByIdSpy.mockResolvedValueOnce(savedCommunity);
      updateCommunitySpy.mockResolvedValueOnce(updatedCommunity);
      populateDatabaseCommunitySpy.mockResolvedValueOnce(populatedUpdatedCommunity);

      const res = await supertest(app)
        .patch(`/community/inviteUserToCommunity/${communityId.toString()}`)
        .send({ username });

      expect(res.status).toEqual(200);
      expect(res.body).toEqual(populatedUpdatedCommunityIso);
    });

    it('should return 500 if user is already a member', async () => {
      getCommunityByIdSpy.mockResolvedValueOnce({
        ...savedCommunity,
        members: ['user1', username],
      });

      const res = await supertest(app)
        .patch(`/community/inviteUserToCommunity/${communityId.toString()}`)
        .send({ username });

      expect(res.status).toEqual(500);
      expect(res.text).toContain('User already in community');
    });

    it('should return 500 if user is already invited', async () => {
      getCommunityByIdSpy.mockResolvedValueOnce({
        ...savedCommunity,
        pendingInvites: [username],
      });

      const res = await supertest(app)
        .patch(`/community/inviteUserToCommunity/${communityId.toString()}`)
        .send({ username });

      expect(res.status).toEqual(500);
      expect(res.text).toContain('User already invited to community');
    });

    it('should return 500 if getCommunityById fails', async () => {
      getCommunityByIdSpy.mockResolvedValueOnce({ error: 'get failed' });

      const res = await supertest(app)
        .patch(`/community/inviteUserToCommunity/${communityId.toString()}`)
        .send({ username });

      expect(res.status).toEqual(500);
      expect(res.text).toContain('get failed');
    });

    it('should return 500 if updateCommunity fails', async () => {
      getCommunityByIdSpy.mockResolvedValueOnce(savedCommunity);
      updateCommunitySpy.mockResolvedValueOnce({ error: 'update failed' });

      const res = await supertest(app)
        .patch(`/community/inviteUserToCommunity/${communityId.toString()}`)
        .send({ username });

      expect(res.status).toEqual(500);
      expect(res.text).toContain('Error updating community');
    });

    it('should return 500 if populateDatabaseCommunity throws error', async () => {
      getCommunityByIdSpy.mockResolvedValueOnce(savedCommunity);
      updateCommunitySpy.mockResolvedValueOnce(updatedCommunity);
      populateDatabaseCommunitySpy.mockRejectedValueOnce(new Error('populating failed'));

      const res = await supertest(app)
        .patch(`/community/inviteUserToCommunity/${communityId.toString()}`)
        .send({ username });

      expect(res.status).toEqual(500);
      expect(res.text).toContain('populating failed');
    });
  });

  describe('GET /onlineUsers/:id', () => {
    it('should return the list of online users for a valid community ID', async () => {
      const communityID = savedCommunity._id.toString();
      const mockOnlineUsers = ['user1', 'user2'];

      jest.spyOn(util, 'getOnlineUsers').mockReturnValueOnce(mockOnlineUsers);

      const response = await supertest(app).get(`/community/onlineUsers/${communityID}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ onlineUsers: mockOnlineUsers });
    });

    it('should return 500 if an error occurs while retrieving online users', async () => {
      const communityID = savedCommunity._id.toString();

      jest.spyOn(util, 'getOnlineUsers').mockImplementationOnce(() => {
        throw new Error('Error retrieving online users');
      });

      const response = await supertest(app).get(`/community/onlineUsers/${communityID}`);
      expect(response.status).toEqual(500);
      expect(response.text).toContain('Error while retrieving online users');
    });
  });

  describe('PATCH /removeInvite', () => {
    const communityId = new mongoose.Types.ObjectId();
    const username = 'userToRemove';

    const savedCommunityWithInvite = {
      _id: communityId,
      name: 'C++',
      about: 'about',
      rules: 'rules',
      members: ['user1'],
      admins: ['user1'],
      createdBy: 'user1',
      groupChatId: new mongoose.Types.ObjectId(),
      questions: [],
      pendingInvites: [username, 'otherUser'],
      memberHistory: [{ _id: new mongoose.Types.ObjectId(), date: now, count: 1 }],
    };

    const updatedCommunity = {
      ...savedCommunityWithInvite,
      pendingInvites: ['otherUser'], // removed username
    };

    const populatedUpdatedCommunity = {
      ...populatedSavedCommunity,
      pendingInvites: ['otherUser'],
      _id: communityId,
    };

    const populatedUpdatedCommunityIso = {
      ...populatedUpdatedCommunity,
      _id: populatedUpdatedCommunity._id.toString(),
      groupChat: {
        ...populatedUpdatedCommunity.groupChat,
        _id: populatedUpdatedCommunity.groupChat._id.toString(),
        createdAt: populatedUpdatedCommunity.groupChat.createdAt.toISOString(),
        updatedAt: populatedUpdatedCommunity.groupChat.updatedAt.toISOString(),
      },
      memberHistory: populatedUpdatedCommunity.memberHistory.map(entry => ({
        _id: entry._id.toString(),
        date: entry.date.toISOString(),
        count: entry.count,
      })),
    };

    it('should remove the user from pendingInvites', async () => {
      getCommunityByIdSpy.mockResolvedValueOnce(savedCommunityWithInvite);
      updateCommunitySpy.mockResolvedValueOnce(updatedCommunity);
      populateDatabaseCommunitySpy.mockResolvedValueOnce(populatedUpdatedCommunity);

      const res = await supertest(app)
        .patch(`/community/removeInvite/${communityId.toString()}`)
        .send({ username });

      expect(res.status).toEqual(200);
      expect(res.body).toEqual(populatedUpdatedCommunityIso);
    });

    it('should return 500 if user is not in pendingInvites', async () => {
      getCommunityByIdSpy.mockResolvedValueOnce({
        ...savedCommunityWithInvite,
        pendingInvites: ['otherUser'],
      });

      const res = await supertest(app)
        .patch(`/community/removeInvite/${communityId.toString()}`)
        .send({ username });

      expect(res.status).toEqual(500);
      expect(res.text).toContain('No pending invites for this user');
    });

    it('should return 500 if getCommunityById fails', async () => {
      getCommunityByIdSpy.mockResolvedValueOnce({ error: 'could not find community' });

      const res = await supertest(app)
        .patch(`/community/removeInvite/${communityId.toString()}`)
        .send({ username });

      expect(res.status).toEqual(500);
      expect(res.text).toContain('could not find community');
    });

    it('should return 500 if updateCommunity fails', async () => {
      getCommunityByIdSpy.mockResolvedValueOnce(savedCommunityWithInvite);
      updateCommunitySpy.mockResolvedValueOnce({ error: 'update failed' });

      const res = await supertest(app)
        .patch(`/community/removeInvite/${communityId.toString()}`)
        .send({ username });

      expect(res.status).toEqual(500);
      expect(res.text).toContain('Error updating community');
    });

    it('should return 500 if populateDatabaseCommunity throws error', async () => {
      getCommunityByIdSpy.mockResolvedValueOnce(savedCommunityWithInvite);
      updateCommunitySpy.mockResolvedValueOnce(updatedCommunity);
      populateDatabaseCommunitySpy.mockRejectedValueOnce(new Error('populating failed'));

      const res = await supertest(app)
        .patch(`/community/removeInvite/${communityId.toString()}`)
        .send({ username });

      expect(res.status).toEqual(500);
      expect(res.text).toContain('populating failed');
    });
  });
});
