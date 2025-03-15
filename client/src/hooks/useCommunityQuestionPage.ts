import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useUserContext from './useUserContext';
import {
  AnswerUpdatePayload,
  CommunityUpdatePayload,
  OrderType,
  PopulatedDatabaseQuestion,
} from '../types/types';
import { getQuestionsForCommunity } from '../services/communityService';

/**
 * Custom hook for managing the question page state, filtering, and real-time updates.
 *
 * @returns titleText - The current title of the question page
 * @returns qlist - The list of questions to display
 * @returns setQuestionOrder - Function to set the sorting order of questions (e.g., newest, oldest).
 */
const useCommunityQuestionPage = () => {
  const { socket } = useUserContext();
  const { communityId } = useParams();
  const [searchParams] = useSearchParams();
  const [titleText, setTitleText] = useState<string>('Community Questions');
  const [search, setSearch] = useState<string>('');
  const [questionOrder, setQuestionOrder] = useState<OrderType>('newest');
  const [qlist, setQlist] = useState<PopulatedDatabaseQuestion[]>([]);

  useEffect(() => {
    let pageTitle = 'Community Questions';
    let searchString = '';

    const searchQuery = searchParams.get('search');
    const tagQuery = searchParams.get('tag');

    if (searchQuery) {
      pageTitle = 'Search Results';
      searchString = searchQuery;
    } else if (tagQuery) {
      pageTitle = tagQuery;
      searchString = `[${tagQuery}]`;
    }

    setTitleText(pageTitle);
    setSearch(searchString);
  }, [searchParams]);

  useEffect(() => {
    /**
     * Function to fetch questions based on the filter and update the question list.
     */
    const fetchData = async () => {
      try {
        if (communityId) {
          const res = await getQuestionsForCommunity(communityId);
          setQlist(res || []);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    };

    const handleCommunityUpdate = (payload: CommunityUpdatePayload) => {
      const { community, type } = payload;
      if (type === 'updated') {
        setQlist(community.questions);
      }
    };

    /**
     * Function to handle question updates from the socket.
     *
     * @param question - the updated question object.
     */
    const handleQuestionUpdate = (question: PopulatedDatabaseQuestion) => {
      setQlist(prevQlist => {
        const questionExists = prevQlist.some(q => q._id === question._id);

        if (questionExists) {
          // Update the existing question
          return prevQlist.map(q => (q._id === question._id ? question : q));
        }

        return [question, ...prevQlist];
      });
    };

    /**
     * Function to handle answer updates from the socket.
     *
     * @param qid - The question ID.
     * @param answer - The answer object.
     */
    const handleAnswerUpdate = ({ qid, answer }: AnswerUpdatePayload) => {
      setQlist(prevQlist =>
        prevQlist.map(q => (q._id === qid ? { ...q, answers: [...q.answers, answer] } : q)),
      );
    };

    /**
     * Function to handle views updates from the socket.
     *
     * @param question - The updated question object.
     */
    const handleViewsUpdate = (question: PopulatedDatabaseQuestion) => {
      setQlist(prevQlist => prevQlist.map(q => (q._id === question._id ? question : q)));
    };

    fetchData();

    socket.on('communityUpdate', handleCommunityUpdate);
    socket.on('questionUpdate', handleQuestionUpdate);
    socket.on('answerUpdate', handleAnswerUpdate);
    socket.on('viewsUpdate', handleViewsUpdate);

    return () => {
      socket.off('communityUpdate', handleCommunityUpdate);
      socket.off('questionUpdate', handleQuestionUpdate);
      socket.off('answerUpdate', handleAnswerUpdate);
      socket.off('viewsUpdate', handleViewsUpdate);
    };
  }, [communityId, questionOrder, search, socket]);

  return { titleText, qlist, setQuestionOrder };
};

export default useCommunityQuestionPage;
