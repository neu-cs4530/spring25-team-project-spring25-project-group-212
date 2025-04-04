import { PopulatedDatabaseQuestion, SafeDatabaseUser } from '@fake-stack-overflow/shared';
import { useEffect, useState } from 'react';
import { getQuestionsByFilter } from '../services/questionService';
import { getUsers } from '../services/userService';

/**
 * A custom hook to encapsulate all state for the StatisticsPage component.
 */
const useStatisticsPage = () => {
  const [topVotedQuestions, setTopVotedQuestions] = useState<PopulatedDatabaseQuestion[]>([]);
  const [topViewedQuestions, setTopViewedQuestions] = useState<PopulatedDatabaseQuestion[]>([]);

  const [topAskingUsers, setTopAskingUsers] = useState<SafeDatabaseUser[]>([]);
  const [topViewingUsers, setTopViewingUsers] = useState<SafeDatabaseUser[]>([]);
  const [topVotingUsers, setTopVotingUsers] = useState<SafeDatabaseUser[]>([]);
  const [topAnsweringUsers, setTopAnsweringUsers] = useState<SafeDatabaseUser[]>([]);

  const [topViewerCount, setTopViewerCount] = useState(0);
  const [topVoterCount, setTopVoterCount] = useState(0);
  const [topAskerQuestionCount, setTopAskerQuestionCount] = useState(0);
  const [topAnswererAnswerCount, setTopAnswererAnswerCount] = useState(0);
  const [topVotedQuestionVotes, setTopVotedQuestionVotes] = useState(0);
  const [topViewedQuestionViews, setTopViewedQuestionViews] = useState(0);

  useEffect(() => {
    /**
     * Function to fetch the top questions based on the category.
     */
    const topQuestionFinder = async (category: 'voted' | 'viewed') => {
      const questions = await getQuestionsByFilter();
      let bestValue = -Infinity;
      let topQuestions: PopulatedDatabaseQuestion[] = [];

      questions.forEach(question => {
        let currentValue = 0;
        if (category === 'voted') {
          currentValue = question.upVotes.length - question.downVotes.length;
        } else {
          // 'viewed'
          currentValue = question.views.length;
        }

        if (currentValue > bestValue) {
          bestValue = currentValue;
          topQuestions = [question];
        } else if (currentValue === bestValue) {
          topQuestions.push(question);
        }
      });

      if (topQuestions.length > 0) {
        if (category === 'voted') {
          setTopVotedQuestionVotes(bestValue);
        } else {
          setTopViewedQuestionViews(bestValue);
        }
      }

      return topQuestions;
    };

    topQuestionFinder('voted').then(newTopQuestions => {
      setTopVotedQuestions(newTopQuestions);
    });

    topQuestionFinder('viewed').then(newTopQuestions => {
      setTopViewedQuestions(newTopQuestions);
    });
    /**
     * Function to fetch the top users based on the category.
     */
    const topUserFinder = async (category: 'asked' | 'answered' | 'viewed' | 'voted') => {
      const questions = await getQuestionsByFilter();
      const users = await getUsers();

      const userCount = new Map();

      questions.forEach(question => {
        const incrementUserCount = (user: string) => {
          userCount.set(user, (userCount.get(user) || 0) + 1);
        };

        if (category === 'asked') {
          incrementUserCount(question.askedBy);
        } else if (category === 'viewed') {
          question.views.forEach(incrementUserCount);
        } else if (category === 'answered') {
          question.answers.forEach(answer => incrementUserCount(answer.ansBy));
        } else {
          // 'voted' - since upvotes and downvotes are now objects, we must make sure to map to usernames before incrementing
          question.upVotes.map(vote => vote.username).forEach(incrementUserCount);
          question.downVotes.map(vote => vote.username).forEach(incrementUserCount);
        }
      });

      let maxCount = 0;
      let topUsers: SafeDatabaseUser[] = [];
      userCount.forEach((count, username) => {
        if (count > maxCount) {
          maxCount = count;
          topUsers = users.filter(user => user.username === username);
        } else if (count === maxCount) {
          topUsers.push(...users.filter(user => user.username === username));
        }
      });

      if (category === 'asked' && topUsers.length > 0) {
        setTopAskerQuestionCount(maxCount);
      } else if (category === 'answered' && topUsers.length > 0) {
        setTopAnswererAnswerCount(maxCount);
      } else if (category === 'viewed' && topUsers.length > 0) {
        setTopViewerCount(maxCount);
      } else if (category === 'voted' && topUsers.length > 0) {
        setTopVoterCount(maxCount);
      }

      return topUsers;
    };

    topUserFinder('asked').then(newTopAskingUser => {
      setTopAskingUsers(newTopAskingUser);
    });

    topUserFinder('viewed').then(newTopViewingUser => {
      setTopViewingUsers(newTopViewingUser);
    });

    topUserFinder('voted').then(newTopVotingUser => {
      setTopVotingUsers(newTopVotingUser);
    });

    topUserFinder('answered').then(newTopAnsweringUser => {
      setTopAnsweringUsers(newTopAnsweringUser);
    });
  }, []);

  return {
    topVotedQuestions,
    topViewedQuestions,
    topVotedQuestionVotes,
    topViewedQuestionViews,
    topAskingUsers,
    topViewingUsers,
    topVotingUsers,
    topAnsweringUsers,
    topViewerCount,
    topVoterCount,
    topAskerQuestionCount,
    topAnswererAnswerCount,
  };
};

export default useStatisticsPage;
