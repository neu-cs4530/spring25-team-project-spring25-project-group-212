import { ObjectId } from 'mongodb';
import QuestionModel from '../../models/questions.model';
import {
  filterQuestionsBySearch,
  filterQuestionsByAskedBy,
  getQuestionsByOrder,
  fetchAndIncrementQuestionViewsById,
  saveQuestion,
  addVoteToQuestion,
  getQuestionsBySaved,
} from '../../services/question.service';
import { DatabaseQuestion, PopulatedDatabaseQuestion, Question } from '../../types/types';
import {
  QUESTIONS,
  tag1,
  tag2,
  ans1,
  ans2,
  ans3,
  ans4,
  POPULATED_QUESTIONS,
} from '../mockData.models';
import UserModel from '../../models/users.model';
import * as sortUtils from '../../utils/sort.util';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Question model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('filterQuestionsBySearch', () => {
    test('filter questions with empty search string should return all questions', () => {
      const result = filterQuestionsBySearch(POPULATED_QUESTIONS, '');

      expect(result.length).toEqual(POPULATED_QUESTIONS.length);
    });

    test('filter questions with empty list of questions should return empty list', () => {
      const result = filterQuestionsBySearch([], 'react');

      expect(result.length).toEqual(0);
    });

    test('filter questions with empty questions and empty string should return empty list', () => {
      const result = filterQuestionsBySearch([], '');

      expect(result.length).toEqual(0);
    });

    test('filter question by one tag', () => {
      const result = filterQuestionsBySearch(POPULATED_QUESTIONS, '[android]');

      expect(result.length).toEqual(1);
      expect(result[0]._id.toString()).toEqual('65e9b58910afe6e94fc6e6dc');
    });

    test('filter question by multiple tags', () => {
      const result = filterQuestionsBySearch(POPULATED_QUESTIONS, '[android] [react]');

      expect(result.length).toEqual(2);
      expect(result[0]._id.toString()).toEqual('65e9b58910afe6e94fc6e6dc');
      expect(result[1]._id.toString()).toEqual('65e9b5a995b6c7045a30d823');
    });

    test('filter question by one user', () => {
      const result = filterQuestionsByAskedBy(POPULATED_QUESTIONS, 'q_by4');

      expect(result.length).toEqual(1);
      expect(result[0]._id.toString()).toEqual('65e9b716ff0e892116b2de09');
    });

    test('filter question by tag and then by user', () => {
      let result = filterQuestionsBySearch(POPULATED_QUESTIONS, '[javascript]');
      result = filterQuestionsByAskedBy(result, 'q_by2');

      expect(result.length).toEqual(1);
      expect(result[0]._id.toString()).toEqual('65e9b5a995b6c7045a30d823');
    });

    test('filter question by one keyword', () => {
      const result = filterQuestionsBySearch(POPULATED_QUESTIONS, 'website');

      expect(result.length).toEqual(1);
      expect(result[0]._id.toString()).toEqual('65e9b5a995b6c7045a30d823');
    });

    test('filter question by tag and keyword', () => {
      const result = filterQuestionsBySearch(POPULATED_QUESTIONS, 'website [android]');

      expect(result.length).toEqual(2);
      expect(result[0]._id.toString()).toEqual('65e9b58910afe6e94fc6e6dc');
      expect(result[1]._id.toString()).toEqual('65e9b5a995b6c7045a30d823');
    });
  });

  describe('getQuestionsByOrder', () => {
    test('get active questions, newest questions sorted by most recently answered 1', async () => {
      mockingoose(QuestionModel).toReturn(POPULATED_QUESTIONS.slice(0, 3), 'find');
      QuestionModel.schema.path('answers', Object);
      QuestionModel.schema.path('tags', Object);
      QuestionModel.schema.path('comments', Object);

      const result = await getQuestionsByOrder('active');

      expect(result.length).toEqual(3);
      expect(result[0]._id.toString()).toEqual('65e9b5a995b6c7045a30d823');
      expect(result[1]._id.toString()).toEqual('65e9b58910afe6e94fc6e6dc');
      expect(result[2]._id.toString()).toEqual('65e9b9b44c052f0a08ecade0');
    });

    test('should return questions sorted by trending', async () => {
      const sortSpy = jest.spyOn(sortUtils, 'sortQuestionsByTrending');
      sortSpy.mockImplementation(qs => qs.reverse()); // fake sort logic for test

      mockingoose(QuestionModel).toReturn(POPULATED_QUESTIONS, 'find');
      QuestionModel.schema.path('answers', Object);
      QuestionModel.schema.path('tags', Object);
      QuestionModel.schema.path('comments', Object);

      const result = await getQuestionsByOrder('trending');

      expect(sortSpy).toHaveBeenCalledTimes(1);
      expect(sortSpy).toHaveBeenCalledWith(expect.any(Array));

      // ✅ Compare serialized versions to avoid Mongoose internal fields
      expect(JSON.parse(JSON.stringify(result))).toEqual(
        JSON.parse(JSON.stringify([...POPULATED_QUESTIONS].reverse())),
      );

      sortSpy.mockRestore();
    });

    test('getQuestionsByOrder with "saved" should return an empty array', async () => {
      const result = await getQuestionsByOrder('saved');
      expect(result).toEqual([]);
    });

    test('get active questions, newest questions sorted by most recently answered 2', async () => {
      const questions = [
        {
          _id: '65e9b716ff0e892116b2de01',
          answers: [ans1, ans3], // 18, 19 => 19
          askDateTime: new Date('2023-11-20T09:24:00'),
        },
        {
          _id: '65e9b716ff0e892116b2de02',
          answers: [ans1, ans2, ans3, ans4], // 18, 20, 19, 19 => 20
          askDateTime: new Date('2023-11-20T09:24:00'),
        },
        {
          _id: '65e9b716ff0e892116b2de03',
          answers: [ans1], // 18 => 18
          askDateTime: new Date('2023-11-19T09:24:00'),
        },
        {
          _id: '65e9b716ff0e892116b2de04',
          answers: [ans4], // 19 => 19
          askDateTime: new Date('2023-11-21T09:24:00'),
        },
        {
          _id: '65e9b716ff0e892116b2de05',
          answers: [],
          askDateTime: new Date('2023-11-19T10:24:00'),
        },
      ];
      mockingoose(QuestionModel).toReturn(questions, 'find');
      QuestionModel.schema.path('answers', Object);
      QuestionModel.schema.path('tags', Object);
      QuestionModel.schema.path('comments', Object);

      const result = await getQuestionsByOrder('active');

      expect(result.length).toEqual(5);
      expect(result[0]._id.toString()).toEqual('65e9b716ff0e892116b2de02');
      expect(result[1]._id.toString()).toEqual('65e9b716ff0e892116b2de04');
      expect(result[2]._id.toString()).toEqual('65e9b716ff0e892116b2de01');
      expect(result[3]._id.toString()).toEqual('65e9b716ff0e892116b2de03');
      expect(result[4]._id.toString()).toEqual('65e9b716ff0e892116b2de05');
    });

    test('get newest unanswered questions', async () => {
      mockingoose(QuestionModel).toReturn(POPULATED_QUESTIONS, 'find');

      const result = await getQuestionsByOrder('unanswered');

      expect(result.length).toEqual(2);
      expect(result[0]._id.toString()).toEqual('65e9b716ff0e892116b2de09');
      expect(result[1]._id.toString()).toEqual('65e9b9b44c052f0a08ecade0');
    });

    test('get newest questions', async () => {
      const questions = [
        {
          _id: '65e9b716ff0e892116b2de01',
          askDateTime: new Date('2023-11-20T09:24:00'),
        },
        {
          _id: '65e9b716ff0e892116b2de04',
          askDateTime: new Date('2023-11-21T09:24:00'),
        },
        {
          _id: '65e9b716ff0e892116b2de05',
          askDateTime: new Date('2023-11-19T10:24:00'),
        },
      ];
      mockingoose(QuestionModel).toReturn(questions, 'find');

      const result = await getQuestionsByOrder('newest');

      expect(result.length).toEqual(3);
      expect(result[0]._id.toString()).toEqual('65e9b716ff0e892116b2de04');
      expect(result[1]._id.toString()).toEqual('65e9b716ff0e892116b2de01');
      expect(result[2]._id.toString()).toEqual('65e9b716ff0e892116b2de05');
    });

    test('get newest most viewed questions', async () => {
      mockingoose(QuestionModel).toReturn(POPULATED_QUESTIONS, 'find');

      const result = await getQuestionsByOrder('mostViewed');

      expect(result.length).toEqual(4);
      expect(result[0]._id.toString()).toEqual('65e9b9b44c052f0a08ecade0');
      expect(result[1]._id.toString()).toEqual('65e9b58910afe6e94fc6e6dc');
      expect(result[2]._id.toString()).toEqual('65e9b5a995b6c7045a30d823');
      expect(result[3]._id.toString()).toEqual('65e9b716ff0e892116b2de09');
    });

    test('getQuestionsByOrder should return empty list if find throws an error', async () => {
      mockingoose(QuestionModel).toReturn(new Error('error'), 'find');

      const result = await getQuestionsByOrder('newest');

      expect(result.length).toEqual(0);
    });

    test('getQuestionsByOrder should return empty list if find returns null', async () => {
      mockingoose(QuestionModel).toReturn(null, 'find');

      const result = await getQuestionsByOrder('newest');

      expect(result.length).toEqual(0);
    });
  });

  describe('fetchAndIncrementQuestionViewsById', () => {
    test('fetchAndIncrementQuestionViewsById should return question and add the user to the list of views if new', async () => {
      const question = POPULATED_QUESTIONS.filter(
        q => q._id && q._id.toString() === '65e9b5a995b6c7045a30d823',
      )[0];
      mockingoose(QuestionModel).toReturn(
        { ...question, views: ['question1_user', ...question.views] },
        'findOneAndUpdate',
      );
      QuestionModel.schema.path('answers', Object);

      const result = (await fetchAndIncrementQuestionViewsById(
        '65e9b5a995b6c7045a30d823',
        'question1_user',
      )) as PopulatedDatabaseQuestion;

      expect(result.views.length).toEqual(2);
      expect(result.views).toEqual(['question1_user', 'question2_user']);
      expect(result._id.toString()).toEqual('65e9b5a995b6c7045a30d823');
      expect(result.title).toEqual(question.title);
      expect(result.text).toEqual(question.text);
      expect(result.answers).toEqual(question.answers);
      expect(result.askDateTime).toEqual(question.askDateTime);
    });

    test('fetchAndIncrementQuestionViewsById should return question and not add the user to the list of views if already viewed by them', async () => {
      const question = QUESTIONS.filter(
        q => q._id && q._id.toString() === '65e9b5a995b6c7045a30d823',
      )[0];
      mockingoose(QuestionModel).toReturn(question, 'findOneAndUpdate');
      QuestionModel.schema.path('answers', Object);

      const result = (await fetchAndIncrementQuestionViewsById(
        '65e9b5a995b6c7045a30d823',
        'question2_user',
      )) as PopulatedDatabaseQuestion;

      expect(result.views.length).toEqual(1);
      expect(result.views).toEqual(['question2_user']);
      expect(result._id.toString()).toEqual('65e9b5a995b6c7045a30d823');
      expect(result.title).toEqual(question.title);
      expect(result.text).toEqual(question.text);
      expect(result.answers).toEqual(question.answers);
      expect(result.askDateTime).toEqual(question.askDateTime);
    });

    test('fetchAndIncrementQuestionViewsById should return an error if id does not exist', async () => {
      mockingoose(QuestionModel).toReturn(null, 'findOneAndUpdate');

      const result = await fetchAndIncrementQuestionViewsById(
        '65e9b716ff0e892116b2de01',
        'question1_user',
      );

      expect(result).toEqual({ error: 'Error when fetching and updating a question' });
    });

    test('fetchAndIncrementQuestionViewsById should return an object with error if findOneAndUpdate throws an error', async () => {
      mockingoose(QuestionModel).toReturn(new Error('error'), 'findOneAndUpdate');

      const result = (await fetchAndIncrementQuestionViewsById(
        '65e9b716ff0e892116b2de01',
        'question2_user',
      )) as {
        error: string;
      };

      expect(result.error).toEqual('Error when fetching and updating a question');
    });
  });

  describe('saveQuestion', () => {
    test('saveQuestion should return the saved question', async () => {
      const mockQn = {
        title: 'New Question Title',
        text: 'New Question Text',
        tags: [tag1, tag2],
        askedBy: 'question3_user',
        askDateTime: new Date('2024-06-06'),
        answers: [],
        views: [],
        upVotes: [],
        downVotes: [],
        comments: [],
        useMarkdown: false,
        anonymous: false,
      };

      const result = (await saveQuestion(mockQn)) as DatabaseQuestion;

      expect(result._id).toBeDefined();
      expect(result.title).toEqual(mockQn.title);
      expect(result.text).toEqual(mockQn.text);
      expect(result.tags[0]._id.toString()).toEqual(tag1._id.toString());
      expect(result.tags[1]._id.toString()).toEqual(tag2._id.toString());
      expect(result.askedBy).toEqual(mockQn.askedBy);
      expect(result.askDateTime).toEqual(mockQn.askDateTime);
      expect(result.views).toEqual([]);
      expect(result.answers.length).toEqual(0);
    });
    test('should return error when QuestionModel.create throws', async () => {
      const invalidQuestion = {
        title: null,
      } as unknown as Question;

      // ✅ Correct way to simulate a thrown error
      jest.spyOn(QuestionModel, 'create').mockRejectedValue(new Error('Mock create failure'));

      const result = await saveQuestion(invalidQuestion);

      expect(result).toEqual({ error: 'Error when saving a question' });

      jest.restoreAllMocks(); // Clean up
    });
  });

  describe('addVoteToQuestion', () => {
    const now = new Date();
    test('addVoteToQuestion should upvote a question', async () => {
      const mockQuestion = {
        _id: 'someQuestionId',
        upVotes: [],
        downVotes: [],
      };

      mockingoose(QuestionModel).toReturn(
        {
          ...mockQuestion,
          upVotes: [{ _id: new ObjectId(), username: 'testUser', timestamp: now }],
          downVotes: [],
        },
        'findOneAndUpdate',
      );

      const result = await addVoteToQuestion('someQuestionId', 'testUser', 'upvote');

      expect(result).toEqual({
        msg: 'Question upvoted successfully',
        upVotes: [{ username: 'testUser', timestamp: now }],
        downVotes: [],
      });
    });

    test('If a downvoter upvotes, add them to upvotes and remove them from downvotes', async () => {
      const mockQuestion = {
        _id: 'someQuestionId',
        upVotes: [],
        downVotes: [{ username: 'testUser', timestamp: now }],
      };

      mockingoose(QuestionModel).toReturn(
        {
          ...mockQuestion,
          upVotes: [{ _id: new ObjectId(), username: 'testUser', timestamp: now }],
          downVotes: [],
        },
        'findOneAndUpdate',
      );

      const result = await addVoteToQuestion('someQuestionId', 'testUser', 'upvote');

      expect(result).toEqual({
        msg: 'Question upvoted successfully',
        upVotes: [{ username: 'testUser', timestamp: now }],
        downVotes: [],
      });
    });

    test('should cancel the upvote if already upvoted', async () => {
      const mockQuestion = {
        _id: 'someQuestionId',
        upVotes: [{ username: 'testUser', timestamp: now }],
        downVotes: [],
      };

      mockingoose(QuestionModel).toReturn(
        { ...mockQuestion, upVotes: [], downVotes: [] },
        'findOneAndUpdate',
      );

      const result = await addVoteToQuestion('someQuestionId', 'testUser', 'upvote');

      expect(result).toEqual({
        msg: 'Upvote cancelled successfully',
        upVotes: [],
        downVotes: [],
      });
    });

    test('addVoteToQuestion should return an error if the question is not found', async () => {
      mockingoose(QuestionModel).toReturn(null, 'findById');

      const result = await addVoteToQuestion('nonExistentId', 'testUser', 'upvote');

      expect(result).toEqual({ error: 'Question not found!' });
    });

    test('addVoteToQuestion should return an error when there is an issue with adding an upvote', async () => {
      mockingoose(QuestionModel).toReturn(new Error('Database error'), 'findOneAndUpdate');

      const result = await addVoteToQuestion('someQuestionId', 'testUser', 'upvote');

      expect(result).toEqual({ error: 'Error when adding upvote to question' });
    });

    test('addVoteToQuestion should downvote a question', async () => {
      const mockQuestion = {
        _id: 'someQuestionId',
        upVotes: [],
        downVotes: [],
      };

      mockingoose(QuestionModel).toReturn(
        {
          ...mockQuestion,
          upVotes: [],
          downVotes: [{ _id: new ObjectId(), username: 'testUser', timestamp: now }],
        },
        'findOneAndUpdate',
      );

      const result = await addVoteToQuestion('someQuestionId', 'testUser', 'downvote');

      expect(result).toEqual({
        msg: 'Question downvoted successfully',
        upVotes: [],
        downVotes: [{ username: 'testUser', timestamp: now }],
      });
    });

    test('If an upvoter downvotes, add them to downvotes and remove them from upvotes', async () => {
      const mockQuestion = {
        _id: 'someQuestionId',
        upVotes: [{ username: 'testUser', timestamp: now }],
        downVotes: [],
      };

      mockingoose(QuestionModel).toReturn(
        {
          ...mockQuestion,
          upVotes: [],
          downVotes: [{ _id: new ObjectId(), username: 'testUser', timestamp: now }],
        },
        'findOneAndUpdate',
      );

      const result = await addVoteToQuestion('someQuestionId', 'testUser', 'downvote');

      expect(result).toEqual({
        msg: 'Question downvoted successfully',
        upVotes: [],
        downVotes: [{ username: 'testUser', timestamp: now }],
      });
    });

    test('should cancel the downvote if already downvoted', async () => {
      const mockQuestion = {
        _id: 'someQuestionId',
        upVotes: [],
        downVotes: [{ username: 'testUser', timestamp: now }],
      };

      mockingoose(QuestionModel).toReturn(
        { ...mockQuestion, upVotes: [], downVotes: [] },
        'findOneAndUpdate',
      );

      const result = await addVoteToQuestion('someQuestionId', 'testUser', 'downvote');

      expect(result).toEqual({
        msg: 'Downvote cancelled successfully',
        upVotes: [],
        downVotes: [],
      });
    });

    test('addVoteToQuestion should return an error if the question is not found', async () => {
      mockingoose(QuestionModel).toReturn(null, 'findById');

      const result = await addVoteToQuestion('nonExistentId', 'testUser', 'downvote');

      expect(result).toEqual({ error: 'Question not found!' });
    });

    test('addVoteToQuestion should return an error when there is an issue with adding a downvote', async () => {
      mockingoose(QuestionModel).toReturn(new Error('Database error'), 'findOneAndUpdate');

      const result = await addVoteToQuestion('someQuestionId', 'testUser', 'downvote');

      expect(result).toEqual({ error: 'Error when adding downvote to question' });
    });
    test('should return [] for upVotes and downVotes when they are undefined', async () => {
      const mockQuestion = {
        _id: 'someQuestionId',
        // Simulate undefined votes
        upVotes: undefined,
        downVotes: undefined,
      };

      mockingoose(QuestionModel).toReturn(mockQuestion, 'findOneAndUpdate');

      const result = await addVoteToQuestion('someQuestionId', 'testUser', 'upvote');

      // Verify fallback to empty arrays
      if ('error' in result) throw new Error('Unexpected error');
      expect(result.upVotes).toEqual([]);
      expect(result.downVotes).toEqual([]);
    });
  });

  describe('getQuestionsBySaved', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    test('should return saved questions sorted accordingly', async () => {
      // Mock all questions
      mockingoose(QuestionModel).toReturn(POPULATED_QUESTIONS, 'find');

      // Assume the user has saved two specific questions
      const savedQuestionIds = ['65e9b58910afe6e94fc6e6dc', '65e9b716ff0e892116b2de09'];

      // Mock user
      mockingoose(UserModel).toReturn(
        {
          username: 'testUser',
          savedQuestions: savedQuestionIds,
        },
        'findOne',
      );

      const result = await getQuestionsBySaved('testUser');

      expect(result.length).toBe(2);
      expect(result.map(q => q._id.toString()).sort()).toEqual(savedQuestionIds.sort());
    });

    test('should return empty array if user not found', async () => {
      mockingoose(QuestionModel).toReturn(POPULATED_QUESTIONS, 'find');
      mockingoose(UserModel).toReturn(null, 'findOne');

      const result = await getQuestionsBySaved('nonExistentUser');

      expect(result).toEqual([]);
    });

    test('should return empty array if question fetching fails', async () => {
      mockingoose(QuestionModel).toReturn(new Error('error'), 'find');
      mockingoose(UserModel).toReturn({}, 'findOne');

      const result = await getQuestionsBySaved('testUser');

      expect(result).toEqual([]);
    });
  });
});
