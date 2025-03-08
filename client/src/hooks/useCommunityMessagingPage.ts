import React, { useEffect, useState } from 'react';
import { ObjectId } from 'mongodb';
import useUserContext from './useUserContext';
import { DatabaseMessage, Message, MessageUpdatePayload } from '../types/types';
import { getChatById, sendMessage } from '../services/chatService';
import { getCommunityById } from '../services/communityService';

/**
 * Custom hook that handles the logic for the messaging page for the community.
 *
 * @returns messages - The list of messages.
 * @returns newMessage - The new message to be sent.
 * @returns setNewMessage - The function to set the new message.
 * @returns handleSendMessage - The function to handle sending a new message.
 */
const useCommunityMessagingPage = (communityId: string) => {
  const { user, socket } = useUserContext();
  const [chatId, setChatId] = useState<ObjectId | null>(null);
  const [messages, setMessages] = React.useState<DatabaseMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  useEffect(() => {
    const fetchChatId = async () => {
      try {
        const community = await getCommunityById(communityId);
        if (community && community.groupChatId) {
          setChatId(community.groupChatId);
        } else {
          setError('Community not found');
        }
      } catch (err) {
        setError('Community not found');
      }
    };
    fetchChatId();
  }, [communityId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (chatId) {
        const chat = await getChatById(chatId);
        if (chat) {
          setMessages(chat.messages);
        }
      }
    };
    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    const handleMessageUpdate = async (data: MessageUpdatePayload) => {
      setMessages([...messages, data.msg]);
    };

    socket.on('messageUpdate', handleMessageUpdate);

    return () => {
      socket.off('messageUpdate', handleMessageUpdate);
    };
  }, [socket, messages]);

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
    if (chatId) {
      await sendMessage(newMsg, chatId);
      setNewMessage('');
    }
  };

  return { messages, newMessage, setNewMessage, handleSendMessage, error };
};

export default useCommunityMessagingPage;
