import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import CommunityModel from '../../models/community.model';
import {
  addOnlineUser,
  getAllCommunities,
  getCommunityById,
  getOnlineUsers,
  getQuestionsForCommunity,
  joinCommunityService,
  removeOnlineUser,
  saveCommunity,
  saveQuestionToCommunity,
  updateCommunity,
} from '../../services/community.service';
import { QUESTIONS, POPULATED_QUESTIONS } from '../mockData.models';
import { Community, DatabaseChat, PopulatedDatabaseChat } from '../../types/types';
import ChatModel from '../../models/chat.model';
import QuestionModel from '../../models/questions.model';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

const now = new Date();

const chatResponse: DatabaseChat = {
  _id: new mongoose.Types.ObjectId(),
  name: '',
  participants: ['user1', 'user2', 'user3'],
  messages: [new mongoose.Types.ObjectId()],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const populatedChatResponse: PopulatedDatabaseChat = {
  _id: new mongoose.Types.ObjectId(),
  name: '',
  participants: ['user1', 'user2', 'user5'],
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

const partialCommunity: Omit<Community, 'questions' | 'groupChat'> = {
  name: 'C++',
  about: 'about',
  rules: 'rules',
  members: ['user1', 'user2'],
  admins: ['user1'],
  createdBy: 'user1',
  pendingInvites: [],
  memberHistory: [{ date: now, count: 4 }],
};

const savedCommunity = {
  _id: new ObjectId(),
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

const savedCommunity2 = {
  _id: new ObjectId(),
  name: 'Java',
  about: 'about2',
  rules: 'rules2',
  members: ['user3', 'user4'],
  admins: ['user3'],
  createdBy: 'user3',
  groupChatId: new ObjectId(),
  questions: [],
  pendingInvites: [],
  memberHistory: [{ _id: new ObjectId(), date: now, count: 1 }],
};

const savedCommunity3 = {
  _id: new ObjectId(),
  name: 'Java',
  about: 'about2',
  rules: 'rules2',
  members: ['user3', 'user4'],
  admins: ['user3'],
  createdBy: 'user3',
  groupChatId: new ObjectId(),
  questions: [new ObjectId('65e9b58910afe6e94fc6e6dc')],
  pendingInvites: [],
  memberHistory: [{ _id: new ObjectId(), date: now, count: 1 }],
};

const onlineUsers: Record<string, Set<string>> = {};

describe('Community model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveCommunity', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the saved community', async () => {
      mockingoose(CommunityModel).toReturn(savedCommunity, 'create');
      const res = await saveCommunity(partialCommunity);

      if ('error' in res) {
        fail('Saving community failed when it should not have');
      }

      expect(res._id).toBeDefined();
      expect(res.name).toEqual(savedCommunity.name);
      expect(res.about).toEqual(savedCommunity.about);
      expect(res.rules).toEqual(savedCommunity.rules);
      expect(res.members).toEqual(savedCommunity.members);
      expect(res.admins).toEqual(savedCommunity.admins);
      expect(res.createdBy).toEqual(savedCommunity.createdBy);
      expect(res.pendingInvites).toEqual(savedCommunity.pendingInvites);
      expect(res.groupChatId).toBeDefined();
      expect(res.questions.length).toEqual(0);
      expect(res.memberHistory.length).toEqual(1);
      expect(res.memberHistory[0].date).toEqual(expect.any(Date));
      expect(res.memberHistory[0].count).toEqual(1);
    });

    it('should throw an error if chat cannot be created successfully (error thrown)', async () => {
      jest.spyOn(ChatModel, 'create').mockRejectedValueOnce(() => new Error('Error creating chat'));
      const saveError = await saveCommunity(partialCommunity);
      expect('error' in saveError).toBe(true);
    });

    it('should throw an error if community cannot be created successfully (error thrown)', async () => {
      jest
        .spyOn(CommunityModel, 'create')
        .mockRejectedValueOnce(() => new Error('Error creating community'));
      const saveError = await saveCommunity(partialCommunity);
      expect('error' in saveError).toBe(true);
    });
  });
});

describe('getCommunityById', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the matching community', async () => {
    mockingoose(CommunityModel).toReturn(savedCommunity, 'findOne');
    const res = await getCommunityById(savedCommunity._id.toString());

    if ('error' in res) {
      fail('Getting community by ID failed when it should not have');
    }

    expect(res._id.toString()).toBeDefined();
    expect(res.name).toEqual(savedCommunity.name);
    expect(res.about).toEqual(savedCommunity.about);
    expect(res.rules).toEqual(savedCommunity.rules);
    expect(res.members).toEqual(savedCommunity.members);
    expect(res.admins).toEqual(savedCommunity.admins);
    expect(res.createdBy).toEqual(savedCommunity.createdBy);
    expect(res.pendingInvites).toEqual(savedCommunity.pendingInvites);
    expect(res.groupChatId).toBeDefined();
    expect(res.questions.length).toEqual(0);
    expect(res.memberHistory.length).toEqual(1);
    expect(res.memberHistory[0].date).toEqual(expect.any(Date));
    expect(res.memberHistory[0].count).toEqual(1);
  });

  it('should throw an error if community could not be found (null)', async () => {
    mockingoose(CommunityModel).toReturn(null, 'findOne');
    const res = await getCommunityById('id');
    expect('error' in res).toBe(true);
  });

  it('should throw an error if community could not be found (null)', async () => {
    jest.spyOn(CommunityModel, 'findOne').mockRejectedValueOnce(new Error());
    const res = await getCommunityById(savedCommunity._id.toString());
    expect('error' in res).toBe(true);
  });
});

describe('getAllCommunities', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the list of communities', async () => {
    mockingoose(CommunityModel).toReturn([savedCommunity, savedCommunity2], 'find');
    const res = await getAllCommunities();
    if ('error' in res) {
      fail('Getting all communities failed when it should not have');
    }

    expect(res.length).toEqual(2);
    expect(res).toEqual([savedCommunity, savedCommunity2]);
  });

  it('should return any empty array if community could not be found (null)', async () => {
    mockingoose(CommunityModel).toReturn(null, 'find');

    const res = await getAllCommunities();
    expect(res).toEqual([]);
  });
});

describe('getQuestionsForCommunity', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return all questions that are associated with that community', async () => {
    mockingoose(CommunityModel).toReturn(savedCommunity3, 'findOne');
    mockingoose(QuestionModel).toReturn([POPULATED_QUESTIONS[0]], 'find');

    const res = await getQuestionsForCommunity(savedCommunity3._id.toString());
    if ('error' in res) {
      fail('Getting questions for community failed when it should not have');
    }
    expect(res.length).toBe(1);
    expect(res[0]._id.toString()).toEqual(POPULATED_QUESTIONS[0]._id.toString());
    expect(res[0].title).toEqual(POPULATED_QUESTIONS[0].title);
    expect(res[0].text).toEqual(POPULATED_QUESTIONS[0].text);
  });

  it('should return an empty array if the community is not found', async () => {
    mockingoose(CommunityModel).toReturn(null, 'findOne');
    const res = await getQuestionsForCommunity('invalidCommunityId');
    expect(res).toEqual([]);
  });

  it('should return an empty array if no questions are found', async () => {
    mockingoose(CommunityModel).toReturn(savedCommunity3, 'findOne');
    mockingoose(QuestionModel).toReturn([], 'find');
    const res = await getQuestionsForCommunity(savedCommunity3._id.toString());
    expect(res).toEqual([]);
  });
});

describe('saveQuestionToCommunity', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });
  it('should save question to community successfully', async () => {
    mockingoose(QuestionModel).toReturn(QUESTIONS[0], 'findOne');

    const updatedCommunity = {
      ...savedCommunity,
      questions: [QUESTIONS[0]._id],
    };
    mockingoose(CommunityModel).toReturn(updatedCommunity, 'findOneAndUpdate');
    const res = await saveQuestionToCommunity(
      savedCommunity._id.toString(),
      QUESTIONS[0]._id.toString(),
    );

    if ('error' in res) {
      fail('saveQuestionToCommunity failed when it should not have');
    }
    expect(res).toBeDefined();
    expect(res.questions.length).toEqual(1);
    expect(res.questions[0]._id.toString()).toEqual(QUESTIONS[0]._id.toString());
  });

  it('should return an error if the question is not found', async () => {
    mockingoose(QuestionModel).toReturn(null, 'findOne');

    const result = await saveQuestionToCommunity(
      savedCommunity._id.toString(),
      QUESTIONS[0]._id.toString(),
    );
    expect('error' in result).toEqual(true);
  });

  it('should return an error if the community is not found', async () => {
    mockingoose(QuestionModel).toReturn(QUESTIONS[0], 'findOne');
    mockingoose(CommunityModel).toReturn(null, 'findOneAndUpdate');

    const result = await saveQuestionToCommunity(
      savedCommunity._id.toString(),
      QUESTIONS[0]._id.toString(),
    );
    expect('error' in result).toEqual(true);
  });

  it('should return an error if an exception occurs', async () => {
    jest.spyOn(QuestionModel, 'findById').mockRejectedValueOnce(new Error('Database error'));

    const res = await saveQuestionToCommunity(
      savedCommunity._id.toString(),
      QUESTIONS[0]._id.toString(),
    );

    expect('error' in res).toEqual(true);
  });
});

describe('joinCommunityService', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should add the user to the community and update the chat participants', async () => {
    const updatedCommunity = {
      ...savedCommunity,
      members: [...savedCommunity.members, 'user5'],
    };
    mockingoose(CommunityModel).toReturn(updatedCommunity, 'findOneAndUpdate');
    mockingoose(ChatModel).toReturn(populatedChatResponse, 'updateOne');

    const res = await joinCommunityService(savedCommunity._id.toString(), 'user5');
    if ('error' in res) {
      fail('Joining community failed when it should not have');
    }

    expect(res.members).toEqual(['user1', 'user2', 'user5']);
  });

  it('should return an error if the community is not found', async () => {
    mockingoose(CommunityModel).toReturn(null, 'findOneAndUpdate');

    const res = await joinCommunityService(savedCommunity._id.toString(), 'user5');

    expect('error' in res).toEqual(true);
  });

  it('should return an error if the chat update fails', async () => {
    const updatedCommunity = {
      ...savedCommunity,
      members: [...savedCommunity.members, 'user5'],
    };
    mockingoose(CommunityModel).toReturn(updatedCommunity, 'findOneAndUpdate');
    mockingoose(ChatModel).toReturn(null, 'updateOne');

    const res = await joinCommunityService(savedCommunity._id.toString(), 'user5');

    expect('error' in res).toEqual(true);
  });

  it('should return an error if an exception occurs', async () => {
    jest
      .spyOn(CommunityModel, 'findOneAndUpdate')
      .mockRejectedValueOnce(new Error('Database error'));

    const res = await joinCommunityService(savedCommunity._id.toString(), 'user5');
    expect('error' in res).toEqual(true);
  });
});

describe('updateCommunity', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should update the community and return the updated version', async () => {
    const updatedCommunity = {
      ...savedCommunity,
      name: 'C++2',
      about: 'new about',
    };

    mockingoose(CommunityModel).toReturn(updatedCommunity, 'findOneAndUpdate');
    const updates = {
      name: 'C++2',
      about: 'new about',
    };

    const res = await updateCommunity(savedCommunity._id.toString(), updates);
    if ('error' in res) {
      fail('Updating community failed when it should not have');
    }
    expect(res._id.toString()).toEqual(updatedCommunity._id.toString());
    expect(res.name).toEqual('C++2');
    expect(res.about).toEqual('new about');
  });

  it('should return an error if the community is not found', async () => {
    mockingoose(CommunityModel).toReturn(null, 'findOneAndUpdate');
    const updates = {
      name: 'C++2',
    };

    const res = await updateCommunity(savedCommunity._id.toString(), updates);
    expect('error' in res).toEqual(true);
  });

  it('should return an error if an exception occurs', async () => {
    // Mock CommunityModel.findOneAndUpdate to throw an error
    jest
      .spyOn(CommunityModel, 'findOneAndUpdate')
      .mockRejectedValueOnce(new Error('Database error'));

    const updates = {
      name: 'Updated Community Name',
    };

    const res = await updateCommunity(savedCommunity._id.toString(), updates);
    expect('error' in res).toEqual(true);
  });
});

describe('Online Users Management', () => {
  beforeEach(() => {
    // Reset the onlineUsers object before each test
    Object.keys(onlineUsers).forEach(key => delete onlineUsers[key]);
  });

  it('should add a user to the online users set for a community', () => {
    const communityID = 'community1';
    const username = 'user1';

    addOnlineUser(communityID, username);

    const result = getOnlineUsers(communityID);
    expect(result).toEqual([username]);
  });

  it('should not add the same user twice to the online users set', () => {
    const communityID = 'community1';
    const username = 'user1';

    addOnlineUser(communityID, username);
    addOnlineUser(communityID, username); // Add the same user again

    const result = getOnlineUsers(communityID);
    expect(result).toEqual([username]); // Ensure the user is not duplicated
  });

  it('should remove a user from the online users set for a community', () => {
    const communityID = 'community1';
    const username = 'user1';

    addOnlineUser(communityID, username);
    removeOnlineUser(communityID, username);

    const result = getOnlineUsers(communityID);
    expect(result).toEqual([]); // Ensure the user is removed
  });

  it('should delete the community entry if the last user is removed', () => {
    const communityID = 'community1';
    const username = 'user1';

    addOnlineUser(communityID, username);
    removeOnlineUser(communityID, username);

    expect(onlineUsers[communityID]).toBeUndefined(); // Ensure the community entry is deleted
  });

  it('should return an empty array if there are no online users for a community', () => {
    const communityID = 'community1';

    const result = getOnlineUsers(communityID);
    expect(result).toEqual([]); // Ensure an empty array is returned
  });

  it('should handle multiple users in a community', () => {
    const communityID = 'community1';
    const user1 = 'user1';
    const user2 = 'user2';

    addOnlineUser(communityID, user1);
    addOnlineUser(communityID, user2);

    const result = getOnlineUsers(communityID);
    expect(result).toEqual(expect.arrayContaining([user1, user2])); // Ensure both users are present
  });
});
