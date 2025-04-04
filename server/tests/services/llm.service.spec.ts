import axios from 'axios';
import assignCommunityFromLLM from '../../services/llm.service';
import { Question, Community, Chat } from '../../types/types';

describe('assignCommunityFromLLM', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  const sampleQuestion: Question = {
    title: 'How to fix CORS error in React app?',
    text: 'I am getting a CORS error when I try to fetch data from my Express backend...',
    tags: [],
    askedBy: 'testUser',
    askDateTime: new Date(),
    answers: [],
    views: [],
    upVotes: [],
    downVotes: [],
    comments: [],
    useMarkdown: false,
    anonymous: false,
  };

  const sampleQuestion2: Question = {
    title: 'Why is my Python list index out of range?',
    text: 'I have a loop that tries to access list[i+1], but I get "IndexError: list index out of range". How can I fix this?',
    tags: [],
    askedBy: 'pythonDev123',
    askDateTime: new Date(),
    answers: [],
    views: [],
    upVotes: [],
    downVotes: [],
    comments: [],
    useMarkdown: true,
    anonymous: false,
  };

  const sampleUncategorizedQuestion: Question = {
    title: 'What’s your favorite keyboard?',
    text: 'I’m thinking of getting a new keyboard. Any suggestions?',
    tags: [],
    askedBy: 'hardwareFan88',
    askDateTime: new Date(),
    answers: [],
    views: [],
    upVotes: [],
    downVotes: [],
    comments: [],
    useMarkdown: false,
    anonymous: false,
  };

  const sampleCommunities: Community[] = [
    {
      name: 'React',
      about: 'Questions about React.js',
      rules: 'Be respectful and use descriptive titles.',
      members: ['user1', 'user2'],
      admins: ['admin1'],
      createdBy: 'admin1',
      groupChat: {} as Chat,
      questions: [],
      pendingInvites: [],
    },
    {
      name: 'Node.js',
      about: 'Server-side JavaScript and backend development using Node.js.',
      rules: 'Use code examples and explain the problem clearly.',
      members: ['user3'],
      admins: ['admin2'],
      createdBy: 'admin2',
      groupChat: {} as Chat,
      questions: [],
      pendingInvites: [],
    },
    {
      name: 'Python',
      about: 'General Python programming questions and discussions.',
      rules: 'No homework help, use proper formatting.',
      members: ['user4'],
      admins: ['admin3'],
      createdBy: 'admin3',
      groupChat: {} as Chat,
      questions: [],
      pendingInvites: [],
    },
  ];

  it('should return React when appropriate', async () => {
    const spy = jest.spyOn(axios, 'post').mockResolvedValue({
      data: {
        candidates: [{ content: { parts: [{ text: 'React' }] } }],
      },
    });

    const result = await assignCommunityFromLLM(sampleQuestion, sampleCommunities);
    expect(result).toBe('React');
    spy.mockRestore();
  });

  it('should return Python when appropriate', async () => {
    const spy = jest.spyOn(axios, 'post').mockResolvedValue({
      data: {
        candidates: [{ content: { parts: [{ text: 'Python' }] } }],
      },
    });

    const result = await assignCommunityFromLLM(sampleQuestion2, sampleCommunities);
    expect(result).toBe('Python');
    spy.mockRestore();
  });

  it('should return "Uncategorized" when LLM selects it', async () => {
    const spy = jest.spyOn(axios, 'post').mockResolvedValue({
      data: {
        candidates: [{ content: { parts: [{ text: 'Uncategorized' }] } }],
      },
    });

    const result = await assignCommunityFromLLM(sampleUncategorizedQuestion, sampleCommunities);
    expect(spy).toHaveBeenCalled();
    expect(result).toBe('Uncategorized');

    spy.mockRestore();
  });

  it('should return "Uncategorized" when API call fails', async () => {
    const spy = jest.spyOn(axios, 'post').mockRejectedValue(new Error('Network error'));

    const result = await assignCommunityFromLLM(sampleQuestion2, sampleCommunities);
    expect(spy).toHaveBeenCalled();
    expect(result).toBe('Uncategorized');

    spy.mockRestore();
  });
});
