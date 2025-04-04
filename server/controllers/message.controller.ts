import express, { Response, Request } from 'express';
import { FakeSOSocket, AddMessageRequest, Message } from '../types/types';
import {
  saveMessage,
  getMessages,
  addReactionToMessage,
  removeReactionFromMessage,
  getReactions,
  markMessageAsSeen,
  deleteMessage,
  restoreMessage,
} from '../services/message.service';

const messageController = (socket: FakeSOSocket) => {
  const router = express.Router();
  const typingUsers: Set<string> = new Set();

  /**
   * Checks if the provided message request contains the required fields.
   *
   * @param req The request object containing the message data.
   *
   * @returns `true` if the request is valid, otherwise `false`.
   */
  const isRequestValid = (req: AddMessageRequest): boolean =>
    req.body.messageToAdd !== null && req.body.messageToAdd !== undefined;

  /**
   * Validates the Message object to ensure it contains the required fields.
   *
   * @param message The message to validate.
   *
   * @returns `true` if the message is valid, otherwise `false`.
   */
  const isMessageValid = (message: Omit<Message, 'type'>): boolean =>
    message.msg !== undefined &&
    message.msg !== '' &&
    message.msgFrom !== undefined &&
    message.msgFrom !== '' &&
    message.msgDateTime !== undefined &&
    message.msgDateTime !== null;

  /**
   * Handles adding a new message. The message is first validated and then saved.
   * If the message is invalid or saving fails, the HTTP response status is updated.
   *
   * @param req The AddMessageRequest object containing the message and chat data.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const addMessageRoute = async (req: AddMessageRequest, res: Response): Promise<void> => {
    if (!isRequestValid(req)) {
      res.status(400).send('Invalid request');
      return;
    }

    const { messageToAdd: msg } = req.body;

    if (!isMessageValid(msg)) {
      res.status(400).send('Invalid message body');
      return;
    }

    try {
      const msgFromDb = await saveMessage({ ...msg, type: 'global' });

      if ('error' in msgFromDb) {
        throw new Error(msgFromDb.error);
      }

      socket.emit('messageUpdate', { msg: msgFromDb });

      res.json(msgFromDb);
    } catch (err: unknown) {
      res.status(500).send(`Error when adding a message: ${(err as Error).message}`);
    }
  };

  /**
   * Fetch all global messages in ascending order of their date and time.
   * @param req The request object.
   * @param res The HTTP response object used to send back the messages.
   * @returns A Promise that resolves to void.
   */
  const getMessagesRoute = async (_: Request, res: Response): Promise<void> => {
    const messages = await getMessages();
    res.json(messages);
  };

  const addReaction = async (req: Request, res: Response) => {
    const { messageId, emoji, username } = req.body;

    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    const result = await addReactionToMessage(messageId, username, emoji, socket);
    res.json(result);
  };

  const removeReaction = async (req: Request, res: Response) => {
    const { messageId, emoji, username } = req.body;

    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    const result = await removeReactionFromMessage(messageId, username, emoji, socket);
    res.json(result);
  };

  const getReactionsRoute = async (req: Request, res: Response) => {
    const { messageId } = req.params;

    if (!messageId) {
      res.status(400).json({ error: 'Message ID is required' });
      return;
    }
    const reactions = await getReactions(messageId);
    res.json(reactions);
  };
  socket.on('connection', clientSocket => {
    clientSocket.on('userTyping', (username: string) => {
      typingUsers.add(username);
      clientSocket.broadcast.emit('typingUpdate', Array.from(typingUsers));
    });

    clientSocket.on('userStoppedTyping', (username: string) => {
      typingUsers.delete(username);
      clientSocket.broadcast.emit('typingUpdate', Array.from(typingUsers));
    });

    clientSocket.on('disconnect', () => {});
  });

  const markMessageAsSeenRoute = async (req: Request, res: Response) => {
    const { messageId } = req.params;
    const { userId } = req.body;

    try {
      const updatedMessage = await markMessageAsSeen(messageId, userId, socket);

      if ('message' in updatedMessage && typeof updatedMessage.message === 'string') {
        return res.status(200).json({
          success: false,
          message: updatedMessage.message,
        });
      }

      if (!updatedMessage || !('_id' in updatedMessage) || !('seenBy' in updatedMessage)) {
        return res.status(500).json({
          success: false,
          message: 'Invalid response from markMessageAsSeen',
        });
      }

      socket.to(updatedMessage._id.toString()).emit('readReceiptUpdate', {
        messageId: updatedMessage._id.toString(),
        seenBy: updatedMessage.seenBy.map(id => id.toString()),
        seenAt: new Date().toISOString(),
      });

      return res.status(200).json({ success: true, seenBy: updatedMessage.seenBy });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Mark messages as seen is not working: ${(error as Error).message}`,
      });
    }
  };

  const deleteMessageRoute = async (req: Request, res: Response) => {
    try {
      const { messageId } = req.params;
      const { username } = req.body;
      const result = await deleteMessage(messageId, username, socket);

      return res.json({ message: 'Message deleted successfully.', deletedMessage: result });
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Error deleting message.', error: (error as Error).message });
    }
  };

  const restoreMessageRoute = async (req: Request, res: Response) => {
    try {
      const { messageId } = req.params;
      const result = await restoreMessage(messageId, socket);

      return res.json({ message: 'Message restored successfully.', restoredMessage: result });
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Error restoring message.', error: (error as Error).message });
    }
  };

  // Add appropriate HTTP verbs and their endpoints to the router
  router.post('/addMessage', addMessageRoute);
  router.get('/getMessages', getMessagesRoute);
  router.post('/addReaction', addReaction);
  router.post('/removeReaction', removeReaction);
  router.get('/getReactions/:messageId', getReactionsRoute);
  router.post('/messages/:messageId/seen', markMessageAsSeenRoute);
  router.delete('/messages/:messageId/delete', deleteMessageRoute);
  router.put('/messages/:messageId/restore', restoreMessageRoute);

  return router;
};

export default messageController;
