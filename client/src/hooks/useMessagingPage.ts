import React, { useEffect } from 'react';
import useUserContext from './useUserContext';
import { DatabaseMessage, Message, MessageUpdatePayload } from '../types/types';
import { addMessage, getMessages } from '../services/messageService';

/**
 * Custom hook that handles the logic for the messaging page.
 *
 * @returns messages - The list of messages.
 * @returns newMessage - The new message to be sent.
 * @returns setNewMessage - The function to set the new message.
 * @returns handleSendMessage - The function to handle sending a new message.
 */
const useMessagingPage = () => {
  const { user, socket } = useUserContext();
  const [messages, setMessages] = React.useState<DatabaseMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const [typingUsers, setTypingUsers] = React.useState<string[]>([]);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    socket.on('typingUpdate', (users: string[]) => {
      setTypingUsers(users);
    });

    return () => {
      socket.off('typingUpdate');
    };
  }, [socket]);

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    socket.emit('userTyping', user.username);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('userStoppedTyping', user.username);
    }, 2000);
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const msgs = await getMessages();
      setMessages(msgs);
    };

    fetchMessages();
  }, []);

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
    socket.emit('userStoppedTyping', user.username);

    const newMsg: Omit<Message, 'type'> = {
      msg: newMessage,
      msgFrom: user.username,
      msgDateTime: new Date(),
    };

    await addMessage(newMsg);

    setNewMessage('');
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    handleTyping,
    handleSendMessage,
    typingUsers,
    error,
  };
};

export default useMessagingPage;
