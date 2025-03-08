// filepath: /Users/kaushikbalantrapu/Documents/Year 3/CS 4530/spring25-team-project-spring25-project-group-212/client/src/hooks/useCommunityPage.ts
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useUserContext from './useUserContext';
import {
  DatabaseCommunity,
  PopulatedDatabaseQuestion,
  DatabaseMessage,
  Message,
  MessageUpdatePayload,
} from '../types/types';
import { getCommunityById } from '../services/communityService';
import { getQuestionsByCommunityId } from '../services/questionService';
import { getChatById, sendMessage } from '../services/chatService';

/**
 * Custom hook to manage the state and logic for the community page.
 *
 * @returns community - The community details.
 * @returns questions - The list of questions in the community.
 * @returns messages - The list of messages in the community chat.
 * @returns newMessage - The new message to be sent.
 * @returns setNewMessage - The function to set the new message.
 * @returns handleSendMessage - The function to handle sending a new message.
 * @returns loading - The loading state.
 * @returns error - The error message, if any.
 */
const useCommunityPage = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const { user, socket } = useUserContext();
  const [community, setCommunity] = useState<DatabaseCommunity | null>(null);
  const [questions, setQuestions] = useState<PopulatedDatabaseQuestion[]>([]);
  const [messages, setMessages] = useState<DatabaseMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const communityData = await getCommunityById(communityId);
        setCommunity(communityData);
      } catch (err) {
        setError('Error fetching community details');
      } finally {
        setLoading(false);
      }
    };

    const fetchQuestions = async () => {
      try {
        const questionsData = await getQuestionsByCommunityId(communityId);
        setQuestions(questionsData);
      } catch (err) {
        setError('Error fetching community questions');
      }
    };

    const fetchMessages = async () => {
      if (community?.groupChatId) {
        const chat = await getChatById(community.groupChatId);
        if (chat) {
          setMessages(chat.messages);
        }
      }
    };

    fetchCommunity();
    fetchQuestions();
    fetchMessages();
  }, [communityId, community?.groupChatId]);

  useEffect(() => {
    const handleMessageUpdate = (data: MessageUpdatePayload) => {
      setMessages(prevMessages => [...prevMessages, data.msg]);
    };

    socket.on('messageUpdate', handleMessageUpdate);

    return () => {
      socket.off('messageUpdate', handleMessageUpdate);
    };
  }, [socket]);

  /**
   * Handles sending a new message.
   *
   * @returns void
   */
  const handleSendMessage = async () => {
    if (newMessage === '') {
      setError('Message cannot be empty');
      return;
    }

    setError('');

    const newMsg: Omit<Message, 'type'> = {
      msg: newMessage,
      msgFrom: user.username,
      msgDateTime: new Date(),
    };

    if (community?.groupChatId) {
      await sendMessage(newMsg, community.groupChatId);
      setNewMessage('');
    }
  };

  return { community, questions, messages, newMessage, setNewMessage, handleSendMessage, loading, error };
};

export default useCommunityPage;