import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PopulatedDatabaseQuestion, SafeDatabaseUser } from '@fake-stack-overflow/shared';
import { getCommunityById, getQuestionsForCommunity } from '../services/communityService';
import { getUsers } from '../services/userService';

const useCommunityStatisticsPage = () => {
  const { id } = useParams();
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

  const [questionData, setQuestionData] = useState<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      tension: number;
    }>;
  }>({
    labels: [],
    datasets: [
      {
        label: 'Number of Questions',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  });

  const [memberData, setMemberData] = useState<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      tension: number;
    }>;
  }>({
    labels: [],
    datasets: [
      {
        label: 'Number of Members',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  });

  useEffect(() => {
    /**
     * Function to fetch the top questions based on the category.
     */
    const topQuestionFinder = async (category: 'voted' | 'viewed') => {
      if (!id) {
        return [];
      }
      const questions = await getQuestionsForCommunity(id);
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
      if (!id) {
        return [];
      }
      const questions = await getQuestionsForCommunity(id);
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
          // 'voted'
          question.upVotes.forEach(incrementUserCount);
          question.downVotes.forEach(incrementUserCount);
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
  }, [id]);

  useEffect(() => {
    const setNoData = () => {
      setQuestionData({
        labels: [],
        datasets: [
          {
            label: 'Number of Questions',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
        ],
      });
    };
    const loadQuestionData = async (): Promise<void> => {
      if (!id) {
        setNoData();
        return;
      }
      try {
        const questions = await getQuestionsForCommunity(id);
        const questionCounts = questions.reduce((acc: { [key: string]: number }, question) => {
          const date = new Date(question.askDateTime);
          const dateString = date.toDateString();
          acc[dateString] = (acc[dateString] || 0) + 1;
          return acc;
        }, {});

        const labels = Object.keys(questionCounts).sort();
        const counts = labels.map(label => questionCounts[label]);

        setQuestionData({
          labels,
          datasets: [
            {
              ...questionData.datasets[0],
              data: counts,
            },
          ],
        });
      } catch (error) {
        setNoData();
      }
    };

    loadQuestionData();
  }, [id, questionData.datasets]);

  useEffect(() => {
    const setNoData = () => {
      setMemberData({
        labels: [],
        datasets: [
          {
            label: 'Number of Questions',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
        ],
      });
    };
    const loadMemberData = async () => {
      if (!id) {
        setNoData();
        return;
      }
      try {
        const community = await getCommunityById(id);
        const labels = community.memberHistory.map(entry => new Date(entry.date).toDateString());
        const counts = community.memberHistory.map(entry => entry.count);
        setMemberData({
          labels,
          datasets: [
            {
              ...memberData.datasets[0],
              data: counts,
            },
          ],
        });
      } catch (error) {
        setNoData();
      }
    };

    loadMemberData();
  }, [id, memberData.datasets]);

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
    questionData,
    memberData,
  };
};

export default useCommunityStatisticsPage;
