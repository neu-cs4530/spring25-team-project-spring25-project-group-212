import mongoose from 'mongoose';
import supertest from 'supertest';
import { ObjectId } from 'mongodb';
import { app } from '../../app';
import * as communityService from '../../services/community.service';
import * as llmService from '../../services/llm.service';
import QuestionModel from '../../models/questions.model';
import { Chat, Community, DatabaseQuestion } from '../../types/types';

const getAllCommunitiesSpy = jest.spyOn(communityService, 'getAllCommunities');
const saveQuestionToCommunitySpy = jest.spyOn(communityService, 'saveQuestionToCommunity');
const assignCommunityFromLLMSpy = jest.spyOn(llmService, 'default');
const findSpy = jest.spyOn(QuestionModel, 'find');

describe('POST /llm/assignCommunity', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should assign a question to the correct community', async () => {
    const questionId = new mongoose.Types.ObjectId();
    const communityId = new mongoose.Types.ObjectId();

    const mockQuestion: DatabaseQuestion = {
      _id: questionId,
      title: 'Why is my React component not rendering?',
      text: 'I am building a React app and my component is not showing up.',
      tags: [],
      askedBy: 'test-user',
      askDateTime: new Date(),
      answers: [],
      views: [],
      upVotes: [],
      downVotes: [],
      comments: [],
      useMarkdown: false,
      anonymous: false,
    };

    const mockCommunity: Community = {
      name: 'React',
      about: 'React development and debugging',
      rules: 'No spam',
      members: [],
      admins: [],
      createdBy: 'adminUser',
      groupChat: {} as Chat,
      questions: [],
      pendingInvites: [],
      memberHistory: [
        {
          date: new Date(),
          count: 0,
        },
      ],
    };
    const mockGroupChatId = new ObjectId();
    getAllCommunitiesSpy.mockResolvedValue([
      {
        ...mockCommunity,
        _id: communityId,
        groupChatId: mockGroupChatId,
        questions: [],
      },
    ]);
    findSpy.mockResolvedValue([mockQuestion]);

    assignCommunityFromLLMSpy.mockResolvedValue('React');

    saveQuestionToCommunitySpy.mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      name: 'React',
      about: 'React development and debugging',
      rules: 'Be respectful',
      members: [],
      admins: [],
      createdBy: 'adminUser',
      groupChatId: new mongoose.Types.ObjectId(),
      questions: [new mongoose.Types.ObjectId()],
      pendingInvites: [],
      memberHistory: [
        {
          date: new Date(),
          count: 0,
        },
      ],
    });

    const response = await supertest(app).post('/llm/assignCommunity');
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe(
      'Unassigned questions have been reviewed for community assignment.',
    );
    expect(getAllCommunitiesSpy).toHaveBeenCalled();
    expect(findSpy).toHaveBeenCalled();
    expect(assignCommunityFromLLMSpy).toHaveBeenCalledWith(
      mockQuestion,
      expect.arrayContaining([expect.objectContaining({ name: 'React' })]),
    );

    expect(saveQuestionToCommunitySpy).toHaveBeenCalledWith(
      communityId.toString(),
      questionId.toString(),
    );
  });

  it('should return 500 if community fetch fails', async () => {
    getAllCommunitiesSpy.mockResolvedValue({ error: 'Could not fetch communities' });

    const response = await supertest(app).post('/llm/assignCommunity');

    expect(response.status).toBe(500);
    expect(response.body.error).toMatch(/Failed to retrieve communities/);
  });

  it('should skip questions already in communities', async () => {
    const questionId = new mongoose.Types.ObjectId();
    const communityId = new mongoose.Types.ObjectId();

    const mockCommunityWithQuestion = {
      _id: communityId,
      name: 'React',
      about: 'React related',
      rules: 'None',
      members: [],
      admins: [],
      createdBy: 'admin',
      groupChatId: new ObjectId(),
      questions: [questionId],
      pendingInvites: [],
      memberHistory: [
        {
          date: new Date(),
          count: 0,
        },
      ],
    };

    getAllCommunitiesSpy.mockResolvedValue([mockCommunityWithQuestion]);

    findSpy.mockResolvedValue([]);

    const response = await supertest(app).post('/llm/assignCommunity');

    expect(response.status).toBe(200);
    expect(findSpy).toHaveBeenCalledWith({
      _id: { $nin: [questionId.toString()] },
    });
    expect(assignCommunityFromLLMSpy).not.toHaveBeenCalled();
    expect(saveQuestionToCommunitySpy).not.toHaveBeenCalled();
  });

  it('should handle assigning multiple questions', async () => {
    const communityId = new mongoose.Types.ObjectId();
    const questionIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

    const mockQuestions: DatabaseQuestion[] = questionIds.map((qid, i) => ({
      _id: qid,
      title: `Title ${i}`,
      text: `Text ${i}`,
      tags: [],
      askedBy: 'user',
      askDateTime: new Date(),
      answers: [],
      views: [],
      upVotes: [],
      downVotes: [],
      comments: [],
      useMarkdown: false,
      anonymous: false,
    }));

    getAllCommunitiesSpy.mockResolvedValue([
      {
        _id: communityId,
        name: 'React',
        about: 'React things',
        rules: 'None',
        members: [],
        admins: [],
        createdBy: 'admin',
        groupChatId: new ObjectId(),
        questions: [],
        pendingInvites: [],
        memberHistory: [
          {
            date: new Date(),
            count: 0,
          },
        ],
      },
    ]);

    findSpy.mockResolvedValue(mockQuestions);

    assignCommunityFromLLMSpy.mockResolvedValue('React');

    saveQuestionToCommunitySpy.mockResolvedValue({
      _id: communityId,
      name: 'React',
      about: '',
      rules: '',
      members: [],
      admins: [],
      createdBy: 'admin',
      groupChatId: new ObjectId(),
      questions: questionIds,
      pendingInvites: [],
      memberHistory: [
        {
          date: new Date(),
          count: 0,
        },
      ],
    });

    const response = await supertest(app).post('/llm/assignCommunity');

    expect(response.status).toBe(200);
    expect(assignCommunityFromLLMSpy).toHaveBeenCalledTimes(2);
    expect(saveQuestionToCommunitySpy).toHaveBeenCalledTimes(2);
  });
});
