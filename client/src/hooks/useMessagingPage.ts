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
 * @returns useMarkdown - The state indicating whether to use markdown.
 * @returns setUseMarkdown - The function to set the use markdown state.
 */
const useMessagingPage = () => {
  const { user, socket } = useUserContext();
  const [messages, setMessages] = React.useState<DatabaseMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const [useMarkdown, setUseMarkdown] = React.useState<boolean>(false);
  const [totalUsers, setTotalUsers] = React.useState<number>(0);

  useEffect(() => {
    const handleUserCountUpdate = (count: number) => {
      setTotalUsers(count);
    };

    socket.on('userCountUpdate', handleUserCountUpdate);

    return () => {
      socket.off('userCountUpdate', handleUserCountUpdate);
    };
  }, [socket]);

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

    const newMsg: Omit<Message, 'type'> = {
      msg: newMessage,
      msgFrom: user.username,
      msgDateTime: new Date(),
      useMarkdown,
    };

    await addMessage(newMsg);

    setNewMessage('');
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    error,
    useMarkdown,
    setUseMarkdown,
    totalUsers,
  };
};

export default useMessagingPage;
