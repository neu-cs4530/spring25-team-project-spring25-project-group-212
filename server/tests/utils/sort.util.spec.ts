import { ObjectId } from 'mongodb';
import {
  sortQuestionsByNewest,
  sortQuestionsByUnanswered,
  sortQuestionsByActive,
  sortQuestionsByMostViews,
  sortQuestionsBySaved,
  sortQuestionsByTrending,
  sortQuestionsByTrendingInCommunity,
} from '../../utils/sort.util';

import { PopulatedDatabaseQuestion } from '../../types/types';

const now = new Date();

const makeQuestion = (overrides = {}): PopulatedDatabaseQuestion => ({
  _id: new ObjectId(),
  askDateTime: now,
  answers: [],
  comments: [],
  views: [],
  upVotes: [],
  downVotes: [],
  tags: [],
  title: '',
  text: '',
  askedBy: '',
  useMarkdown: false,
  anonymous: false,
  ...overrides,
});

describe('sort.util', () => {
  const q1 = makeQuestion({
    askDateTime: new Date('2024-01-01'),
    answers: [],
    views: ['v1'],
    upVotes: [{ username: 'a', timestamp: new Date() }],
    downVotes: [{ username: 'b', timestamp: new Date() }],
    comments: [{ commentDateTime: new Date() }],
  });

  const q2 = makeQuestion({
    askDateTime: new Date('2024-02-01'),
    answers: [{ ansDateTime: new Date(), comments: [] }],
    views: ['v1', 'v2', 'v3'],
    upVotes: [{ username: 'c', timestamp: new Date() }],
    downVotes: [],
    comments: [],
  });

  const q3 = makeQuestion({
    askDateTime: new Date('2024-03-01'),
    answers: [],
    views: ['v1', 'v2'],
    upVotes: [],
    downVotes: [],
    comments: [],
  });

  const questions = [q1, q2, q3];

  it('sortQuestionsByNewest sorts questions by askDateTime descending', () => {
    const sorted = sortQuestionsByNewest(questions);
    expect(sorted.map(q => q._id)).toEqual([q3._id, q2._id, q1._id]);
  });

  it('sortQuestionsByUnanswered filters to only unanswered questions and sorts them', () => {
    const sorted = sortQuestionsByUnanswered(questions);
    expect(sorted.every(q => q.answers.length === 0)).toBe(true);
    expect(sorted.map(q => q._id)).toEqual([q3._id, q1._id]);
  });

  it('sortQuestionsByMostViews sorts by views length, then by askDateTime', () => {
    const sorted = sortQuestionsByMostViews(questions);
    expect(sorted.map(q => q.views.length)).toEqual([3, 2, 1]);
  });

  it('sortQuestionsBySaved filters to only saved questions by current user', () => {
    const savedId = new ObjectId();
    const qWithSave = makeQuestion({
      _id: savedId,
      askDateTime: new Date('2024-04-01'),
    });

    const result = sortQuestionsBySaved([q1, q2, qWithSave], [savedId.toString()]);

    expect(result.length).toBe(1);
    expect(result[0]._id.toString()).toBe(savedId.toString());
  });

  it('sortQuestionsByTrending ranks questions based on weighted recent activity', () => {
    const baseTime = Date.now();
    const recent = (offset = 0) => new Date(baseTime - offset);

    const qLow = makeQuestion({
      askDateTime: new Date('2024-01-01'),
      comments: [{ commentDateTime: recent(1000) }],
      answers: [],
      upVotes: [],
      downVotes: [],
    });

    const qMid = makeQuestion({
      askDateTime: new Date('2024-01-02'),
      comments: [{ commentDateTime: recent(1000) }, { commentDateTime: recent(2000) }],
      answers: [{ ansDateTime: recent(1000), comments: [] }],
      upVotes: [{ username: 'u', timestamp: recent(1000) }],
      downVotes: [],
    });

    const qHigh = makeQuestion({
      askDateTime: new Date('2024-01-03'),
      comments: [
        { commentDateTime: recent(1000) },
        { commentDateTime: recent(2000) },
        { commentDateTime: recent(3000) },
      ],
      answers: [
        { ansDateTime: recent(1000), comments: [] },
        { ansDateTime: recent(2000), comments: [] },
      ],
      upVotes: [
        { username: 'a', timestamp: recent(1000) },
        { username: 'b', timestamp: recent(2000) },
      ],
      downVotes: [
        { username: 'x', timestamp: recent(1000) },
        { username: 'y', timestamp: recent(2000) },
      ],
    });

    const sorted = sortQuestionsByTrending([qLow, qMid, qHigh]);

    // This is an example of how the scoring might work:
    // qHigh score = 3*2 + 2*3 + 2*1.5 - (2-1) = 6 + 6 + 3 - 1 = 14
    // qMid score = 2*2 + 1*3 + 1*1.5 - (0-1) = 4 + 3 + 1.5 - 0 = 8.5
    // qLow score = 1*2 = 2

    expect(sorted.map(q => q._id)).toEqual([qHigh._id, qMid._id, qLow._id]);
  });

  it('sortQuestionsByTrendingInCommunity ranks questions by weighted activity in given community', () => {
    const baseTime = Date.now();
    const recent = (offset = 0) => new Date(baseTime - offset);

    const qLow = makeQuestion({
      askDateTime: new Date('2024-01-01'),
      comments: [{ commentDateTime: recent(1000) }],
      answers: [],
      upVotes: [],
      downVotes: [],
    });

    const qMid = makeQuestion({
      askDateTime: new Date('2024-01-02'),
      comments: [{ commentDateTime: recent(1000) }, { commentDateTime: recent(2000) }],
      answers: [{ ansDateTime: recent(1000), comments: [] }],
      upVotes: [{ username: 'u', timestamp: recent(1000) }],
      downVotes: [],
    });

    const qHigh = makeQuestion({
      askDateTime: new Date('2024-01-03'),
      comments: [
        { commentDateTime: recent(1000) },
        { commentDateTime: recent(2000) },
        { commentDateTime: recent(3000) },
      ],
      answers: [
        { ansDateTime: recent(1000), comments: [] },
        { ansDateTime: recent(2000), comments: [] },
      ],
      upVotes: [
        { username: 'a', timestamp: recent(1000) },
        { username: 'b', timestamp: recent(2000) },
      ],
      downVotes: [
        { username: 'x', timestamp: recent(1000) },
        { username: 'y', timestamp: recent(2000) },
      ],
    });

    const sorted = sortQuestionsByTrendingInCommunity([qLow, qMid, qHigh], 'community-id');

    // This is an example of how the scoring might work:
    // qHigh score = 3*2 + 2*3 + 2*1.5 - (2-1) = 6 + 6 + 3 - 1 = 14
    // qMid score = 2*2 + 1*3 + 1*1.5 - (0-1) = 4 + 3 + 1.5 - 0 = 8.5
    // qLow score = 1*2 = 2

    expect(sorted.map(q => q._id)).toEqual([qHigh._id, qMid._id, qLow._id]);
  });

  it('sortQuestionsByActive prioritizes questions with recent answers', () => {
    const sorted = sortQuestionsByActive(questions);
    expect(sorted[0]._id).toBe(q2._id);
  });

  it('sortQuestionsByActive sorts by more recent answer first', () => {
    const base = new Date();

    const qOld = makeQuestion({
      askDateTime: new Date('2024-01-01'),
      answers: [{ ansDateTime: new Date(base.getTime() - 100000), comments: [] }],
    });

    const qNew = makeQuestion({
      askDateTime: new Date('2024-01-02'),
      answers: [{ ansDateTime: new Date(base.getTime()), comments: [] }],
    });

    const sorted = sortQuestionsByActive([qOld, qNew]);

    expect(sorted[0]._id).toEqual(qNew._id);
    expect(sorted[1]._id).toEqual(qOld._id);
  });
  it('sortQuestionsByActive returns -1 when adate > bdate', () => {
    const now2 = new Date();
    const recent = new Date(now2.getTime());
    const older = new Date(now2.getTime() - 10000);

    const recentAnswerQ = makeQuestion({
      askDateTime: new Date('2024-01-01'),
      answers: [{ ansDateTime: recent, comments: [] }],
    });

    const olderAnswerQ = makeQuestion({
      askDateTime: new Date('2024-01-02'),
      answers: [{ ansDateTime: older, comments: [] }],
    });

    const sorted = sortQuestionsByActive([recentAnswerQ, olderAnswerQ]);
    expect(sorted[0]._id).toEqual(recentAnswerQ._id);
  });

  it('sortQuestionsByActive returns 0 when adate equals bdate', () => {
    const sameTime = new Date('2025-01-01T00:00:00Z');

    const qA = makeQuestion({
      askDateTime: new Date('2024-01-01'),
      answers: [{ ansDateTime: sameTime, comments: [] }],
    });

    const qB = makeQuestion({
      askDateTime: new Date('2024-01-02'),
      answers: [{ ansDateTime: sameTime, comments: [] }],
    });

    const result = sortQuestionsByActive([qA, qB]);

    expect(result.map(q => q._id)).toEqual([qB._id, qA._id]);
  });
  it('sortQuestionsByNewest returns 0 when askDateTime values are equal', () => {
    const sameDate = new Date('2024-05-01');

    const qA = makeQuestion({
      askDateTime: sameDate,
    });

    const qB = makeQuestion({
      askDateTime: sameDate,
    });

    const result = sortQuestionsByNewest([qA, qB]);

    expect(result.map(q => q._id)).toEqual([qA._id, qB._id]);
  });
});
