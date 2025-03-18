import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useUserContext from './useUserContext';
import {
  ChatUpdatePayload,
  Message,
  PopulatedDatabaseChat,
  PopulatedDatabaseCommunity,
} from '../types/types';
import { sendMessage } from '../services/chatService';
import { getCommunityById } from '../services/communityService';

/**
 * Custom hook that handles the logic for the messaging page for the community.
 *
 * @returns messages - The list of messages.
 * @returns newMessage - The new message to be sent.
 * @returns setNewMessage - The function to set the new message.
 * @returns handleSendMessage - The function to handle sending a new message.
 */
const useCommunityMessagingPage = () => {
  const { id } = useParams();
  const { user, socket } = useUserContext();
  const [currentCommunity, setCurrentCommunity] = useState<PopulatedDatabaseCommunity>();
  const [communityChat, setCommunityChat] = useState<PopulatedDatabaseChat | null>(null);
  const [newMessage, setNewMessage] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  useEffect(() => {
    if (!id) {
      setError('Community not found');
      return;
    }

    const fetchChatId = async () => {
      try {
        const community = await getCommunityById(id);
        if (community && community.groupChat._id) {
          setCurrentCommunity(community);
          setCommunityChat(community.groupChat);
        } else {
          setError('Community not found');
        }
      } catch (err) {
        setError('Community not found');
      }
    };
    fetchChatId();
  }, [id]);

  const handleChatUpdate = (chatUpdate: ChatUpdatePayload) => {
    const { chat, type } = chatUpdate;
    switch (type) {
      case 'newMessage': {
        setCommunityChat(prevChat => {
          if (!prevChat) return chat;

          const existingMessageIds = new Set(prevChat.messages?.map(msg => msg._id));
          const newMessages = chat.messages.filter(msg => !existingMessageIds.has(msg._id));

          return {
            ...prevChat,
            messages: [...(prevChat.messages ?? []), ...newMessages],
          };
        });
        return;
      }
      case 'newParticipant': {
        setCommunityChat(chat);
        return;
      }
      default: {
        setError('Invalid chat update type');
      }
    }
  };

  useEffect(() => {
    if (!communityChat || !socket) return undefined;
    socket.emit('joinChat', String(communityChat._id));

    return () => {
      socket.emit('leaveChat', String(communityChat._id));
    };
  }, [communityChat, socket]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleUpdate = (chatUpdate: ChatUpdatePayload) => {
      handleChatUpdate(chatUpdate);
    };

    socket.on('chatUpdate', handleUpdate);
    return () => {
      socket.off('chatUpdate', handleUpdate);
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
      useMarkdown: false,
    };
    if (communityChat) {
      await sendMessage(newMsg, communityChat._id);
      setNewMessage('');
    }
  };

  return { currentCommunity, communityChat, newMessage, setNewMessage, handleSendMessage, error };
};

export default useCommunityMessagingPage;
