import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useUserContext from './useUserContext';
import {
  ChatUpdatePayload,
  Message,
  PopulatedDatabaseChat,
  PopulatedDatabaseCommunity,
  DatabaseMessage,
} from '../types/types';
import { sendMessage } from '../services/chatService';
import { getCommunityById } from '../services/communityService';
import { markMessageAsSeen } from '../services/messageService';

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
  const [messages, setMessages] = React.useState<DatabaseMessage[]>([]);
  const [communityChat, setCommunityChat] = React.useState<PopulatedDatabaseChat | null>(null);
  const [newMessage, setNewMessage] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const [typingUsers, setTypingUsers] = React.useState<string[]>([]);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [useMarkdown, setUseMarkdown] = React.useState<boolean>(false);

  useEffect(() => {
    socket.on('typingUpdate', (users: string[]) => {
      setTypingUsers(users);
    });

    return () => {
      socket.off('typingUpdate');
    };
  }, [socket]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    if (currentCommunity) {
      socket.emit('userTyping', currentCommunity?._id.toString(), user.username);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (currentCommunity) {
        socket.emit('userStoppedTyping', currentCommunity?._id.toString(), user.username);
      }
    }, 2000);
  };

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
          setMessages(community.groupChat.messages ?? []);
        } else {
          setError('Community not found');
        }
      } catch (err) {
        setError('Community not found');
      }
    };
    fetchChatId();
  }, [id]);

  useEffect(() => {
    if (!communityChat || !socket) return undefined;
    socket.emit('joinChat', String(communityChat._id));

    return () => {
      socket.emit('leaveChat', String(communityChat._id));
    };
  }, [communityChat, socket]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleChatUpdate = (chatUpdate: ChatUpdatePayload) => {
      const { chat, type } = chatUpdate;
      switch (type) {
        case 'newMessage': {
          setCommunityChat(prevChat => {
            if (!prevChat) return chat;

            const existingMessageIds = new Set(prevChat.messages?.map(msg => msg._id));
            const newMessages = chat.messages.filter(msg => !existingMessageIds.has(msg._id));

            const updatedMessages = [...(prevChat.messages ?? []), ...newMessages];
            setMessages(updatedMessages);

            return {
              ...prevChat,
              messages: updatedMessages,
            };
          });

          chat.messages.forEach(async msg => {
            await markMessageAsSeen(msg._id.toString(), user._id.toString());
            socket.emit('messageSeen', {
              messageId: msg._id.toString(),
              seenBy: [user._id.toString()],
              seenAt: new Date().toISOString(),
            });
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

    socket.on('chatUpdate', handleChatUpdate);
    return () => {
      socket.off('chatUpdate', handleChatUpdate);
    };
  }, [socket, user._id]);

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
    if (currentCommunity) {
      socket.emit('userStoppedTyping', currentCommunity?._id.toString(), user.username);
    }

    const newMsg: Omit<Message, 'type'> = {
      msg: newMessage,
      msgFrom: user.username,
      msgDateTime: new Date(),
      useMarkdown,
    };

    if (communityChat) {
      await sendMessage(newMsg, communityChat._id);

      setNewMessage('');
    }
  };

  return {
    messages,
    handleTyping,
    typingUsers,
    currentCommunity,
    communityChat,
    newMessage,
    setNewMessage,
    handleSendMessage,
    error,
    useMarkdown,
    setUseMarkdown,
  };
};

export default useCommunityMessagingPage;
