import api from './config';
import { DatabaseMessage, Message } from '../types/types';

const MESSAGE_API_URL = `${process.env.REACT_APP_SERVER_URL}/messaging`;

/**
 * Interface extending the request body when adding a message, which contains:
 * - messageToAdd - The message being added.
 */
interface AddMessageRequestBody {
  messageToAdd: Omit<Message, 'type'>;
}

/**
 * Adds a new message to a specific chat with the given id.
 *
 * @param messageToAdd - The message object to add to the chat.
 * @throws an error if the request fails or the response status is not 200.
 */
const addMessage = async (messageToAdd: Omit<Message, 'type'>): Promise<DatabaseMessage> => {
  const reqBody: AddMessageRequestBody = {
    messageToAdd,
  };
  const res = await api.post(`${MESSAGE_API_URL}/addMessage`, reqBody);
  if (res.status !== 200) {
    throw new Error('Error while adding a new message to a chat');
  }
  return res.data;
};

/**
 * Function to fetch all messages in ascending order of their date and time.
 * @param user The user to fetch their chat for
 * @throws Error if there is an issue fetching the list of chats.
 */
const getMessages = async (): Promise<DatabaseMessage[]> => {
  const res = await api.get(`${MESSAGE_API_URL}/getMessages`);
  if (res.status !== 200) {
    throw new Error('Error when fetching list of chats for the given user');
  }
  return res.data;
};

/**
 * Adds a reaction to a message.
 *
 * @param messageId - The ID of the message being reacted to.
 * @param emoji - The emoji being added as a reaction.
 * @param username - The username of the person reacting.
 * @throws Error if the request fails or the response status is not 200.
 */
const addReaction = async (messageId: string, emoji: string, username: string) => {
  const res = await api.post(`${MESSAGE_API_URL}/addReaction`, { messageId, emoji, username });

  if (res.status !== 200) {
    throw new Error('Error adding reaction');
  }
  return res.data;
};

const getReactions = async (messageId: string) => {
  const res = await api.get(`${MESSAGE_API_URL}/getReactions/${messageId}`);

  if (res.status !== 200) {
    throw new Error('Error fetching reactions');
  }
  return res.data;
};

/**
 * Marks a message as seen by a user.
 *
 * @param messageId - The ID of the message being marked as seen.
 * @param userId - The ID of the user who saw the message.
 * @throws Error if the request fails or the response status is not 200.
 */
const markMessageAsSeen = async (messageId: string, userId: string) => {
  const res = await api.post(`${MESSAGE_API_URL}/messages/${messageId}/seen`, {
    userId,
  });

  if (res.status !== 200) {
    throw new Error('Error marking message as seen');
  }
  return res.data;
};

const deleteMessage = async (messageId: string, username: string) => {
  const res = await api.delete(`${MESSAGE_API_URL}/messages/${messageId}/delete`, {
    data: { username },
  });

  if (res.status !== 200) {
    throw new Error('Error deleting the message');
  }
  return res.data;
};

const restoreMessage = async (messageId: string) => {
  const res = await api.put(`${MESSAGE_API_URL}/messages/${messageId}/restore`);
  if (res.status !== 200) {
    throw new Error('Error restoring the message');
  }
  return res.data;
};

export {
  addMessage,
  getMessages,
  addReaction,
  getReactions,
  markMessageAsSeen,
  deleteMessage,
  restoreMessage,
};
