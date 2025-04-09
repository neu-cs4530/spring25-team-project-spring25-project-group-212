import { ObjectId } from 'mongodb';
import * as communityService from '../../services/community.service';
import * as llmService from '../../services/llm.service';
import QuestionModel from '../../models/questions.model';
import llmController from '../../controllers/llm.controller';

const getAllCommunitiesSpy = jest.spyOn(communityService, 'getAllCommunities');
const saveQuestionToCommunitySpy = jest.spyOn(communityService, 'saveQuestionToCommunity');
const assignCommunityFromLLMSpy = jest.spyOn(llmService, 'default');
const findSpy = jest.spyOn(QuestionModel, 'find');

describe('POST /llm/assignCommunity', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockCommunities = [
    {
      _id: new ObjectId(),
      name: 'React',
      about: 'React stuff',
      rules: '',
      members: [],
      admins: [],
      createdBy: 'admin1',
      groupChatId: new ObjectId(),
      questions: [],
      pendingInvites: [],
      memberHistory: [],
    },
  ];

  const mockQuestion = {
    _id: new ObjectId(),
    title: 'How to use useEffect?',
    text: 'Having trouble with dependencies...',
    tags: [],
    askedBy: 'dev123',
    askDateTime: new Date(),
    answers: [],
    views: [],
    upVotes: [],
    downVotes: [],
    comments: [],
    useMarkdown: false,
    anonymous: false,
  };

  it('should assign a question to the correct community', async () => {
    getAllCommunitiesSpy.mockResolvedValue(mockCommunities);
    findSpy.mockResolvedValue([mockQuestion]);
    assignCommunityFromLLMSpy.mockResolvedValue('React');
    saveQuestionToCommunitySpy.mockResolvedValue({
      _id: new ObjectId(),
      name: 'React',
      about: 'React stuff',
      rules: '',
      members: [],
      admins: [],
      createdBy: 'admin1',
      groupChatId: new ObjectId(),
      questions: [],
      pendingInvites: [],
      memberHistory: [],
    });

    await llmController().runLLMCommunityTagging();

    expect(getAllCommunitiesSpy).toHaveBeenCalled();
    expect(findSpy).toHaveBeenCalledWith({
      _id: { $nin: expect.any(Array) },
    });
    expect(assignCommunityFromLLMSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: mockQuestion.title }),
      expect.any(Array),
    );
    expect(saveQuestionToCommunitySpy).toHaveBeenCalledWith(
      mockCommunities[0]._id.toString(),
      mockQuestion._id.toString(),
    );
  });

  it('should not assign question if LLM returns "Uncategorized"', async () => {
    getAllCommunitiesSpy.mockResolvedValue(mockCommunities);
    findSpy.mockResolvedValue([mockQuestion]);
    assignCommunityFromLLMSpy.mockResolvedValue('Uncategorized');

    await llmController().runLLMCommunityTagging();

    expect(saveQuestionToCommunitySpy).not.toHaveBeenCalled();
  });

  it('should not assign question if LLM returns unknown community', async () => {
    getAllCommunitiesSpy.mockResolvedValue(mockCommunities);
    findSpy.mockResolvedValue([mockQuestion]);
    assignCommunityFromLLMSpy.mockResolvedValue('UnknownCommunity');

    await llmController().runLLMCommunityTagging();

    expect(saveQuestionToCommunitySpy).not.toHaveBeenCalled();
  });

  it('should throw if getAllCommunities returns error', async () => {
    getAllCommunitiesSpy.mockResolvedValue({ error: 'Database failure' });

    await expect(llmController().runLLMCommunityTagging()).rejects.toThrow(
      'Failed to retrieve communities',
    );
  });

  it('should do nothing if all questions are already assigned', async () => {
    const assignedQuestion = {
      ...mockQuestion,
      _id: new ObjectId(),
    };
    getAllCommunitiesSpy.mockResolvedValue([
      { ...mockCommunities[0], questions: [assignedQuestion._id] },
    ]);
    findSpy.mockResolvedValue([]); // No unassigned questions

    await llmController().runLLMCommunityTagging();

    expect(assignCommunityFromLLMSpy).not.toHaveBeenCalled();
    expect(saveQuestionToCommunitySpy).not.toHaveBeenCalled();
  });
});
