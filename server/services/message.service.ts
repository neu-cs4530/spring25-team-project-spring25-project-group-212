import MessageModel from '../models/messages.model';
import UserModel from '../models/users.model';
import {
  DatabaseMessage,
  DatabaseUser,
  FakeSOSocket,
  Message,
  MessageResponse,
} from '../types/types';

/**
 * Saves a new message to the database.
 * @param {Message} message - The message to save
 * @returns {Promise<MessageResponse>} - The saved message or an error message
 */
export const saveMessage = async (message: Message): Promise<MessageResponse> => {
  try {
    const user: DatabaseUser | null = await UserModel.findOne({ username: message.msgFrom });

    if (!user) {
      throw new Error('Message sender is invalid or does not exist.');
    }

    const result: DatabaseMessage = await MessageModel.create(message);
    return result;
  } catch (error) {
    return { error: `Error when saving a message: ${(error as Error).message}` };
  }
};

/**
 * Retrieves all global messages from the database, sorted by date in ascending order.
 * @returns {Promise<DatabaseMessage[]>} - An array of messages or an empty array if error occurs.
 */
export const getMessages = async (): Promise<DatabaseMessage[]> => {
  try {
    const messages: DatabaseMessage[] = await MessageModel.find({ type: 'global' })
      .populate('msgFrom', 'username')
      .populate('reactions.userId', 'username')
      .populate('deletedAt', 'deletedMessage')
      .lean();

    messages.sort((a, b) => a.msgDateTime.getTime() - b.msgDateTime.getTime());
    return messages;
  } catch (error) {
    return [];
  }
};

export const addReactionToMessage = async (
  messageId: string,
  username: string,
  emoji: string,
  socket: FakeSOSocket,
) => {
  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      throw new Error('User not found');
    }

    const userId = user._id;
    const existingMessage = await MessageModel.findById(messageId);

    if (!existingMessage) {
      throw new Error('Message not found');
    }

    existingMessage.reactions = existingMessage.reactions || [];
    const alreadyReacted = existingMessage.reactions.some(
      reaction => reaction.emoji === emoji && reaction.userId.toString() === userId.toString(),
    );

    if (alreadyReacted) {
      return { message: 'Reaction already exists' };
    }

    const updatedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      { $push: { reactions: { emoji, userId } } },
      { new: true },
    );

    if (!updatedMessage) {
      throw new Error('Message not found');
    }

    const updatedReactions =
      updatedMessage.reactions?.map(reaction => ({
        emoji: reaction.emoji,
        userId: reaction.userId.toString(),
      })) || [];

    socket.emit('reactionUpdate', {
      messageId,
      reactions: updatedReactions,
    });

    return updatedMessage;
  } catch (error) {
    return { error: `Error adding reaction: ${(error as Error).message}` };
  }
};

export const removeReactionFromMessage = async (
  messageId: string,
  username: string,
  emoji: string,
  socket: FakeSOSocket,
) => {
  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      throw new Error('User not found');
    }

    const userId = user._id;
    const updatedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      { $pull: { reactions: { emoji, userId } } },
      { new: true },
    );

    if (!updatedMessage) {
      throw new Error('Message not found');
    }

    socket.emit('reactionUpdate', {
      messageId,
      reactions:
        updatedMessage.reactions?.map(reaction => ({
          emoji: reaction.emoji,
          userId: reaction.userId.toString(),
        })) || [],
    });

    return updatedMessage;
  } catch (error) {
    return { error: `Error removing reaction: ${error}` };
  }
};

export const getReactions = async (messageId: string) => {
  try {
    const message = await MessageModel.findById(messageId)
      .populate('reactions.userId', 'username')
      .lean();

    if (!message) {
      throw new Error('Message not found');
    }

    return message.reactions || [];
  } catch (error) {
    return { error: `Error fetching reactions: ${(error as Error).message}` };
  }
};

export const markMessageAsSeen = async (
  messageId: string,
  userId: string,
  socket: FakeSOSocket,
) => {
  try {
    const message = await MessageModel.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    const updatedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      { $addToSet: { seenBy: userId } },
      { new: true },
    );

    if (!updatedMessage) {
      throw new Error('Message not found after update');
    }

    socket.emit('readReceiptUpdate', {
      messageId,
      seenBy: updatedMessage.seenBy.map(id => id.toString()),
      seenAt: new Date().toISOString(),
    });

    return updatedMessage;
  } catch (error) {
    return { error: `Error marking message as seen: ${(error as Error).message}` };
  }
};

export const deleteMessage = async (messageId: string, username: string, socket: FakeSOSocket) => {
  try {
    const message = await MessageModel.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }
    if (message.msgFrom !== username) {
      throw new Error('You can only delete your own messages');
    }

    const updatedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      {
        deletedAt: new Date(),
        deletedMessage: message.msg,
        msg: 'Message has been deleted',
      },
      { new: true },
    );

    socket.emit('messageDeleted', { messageId, deletedMessage: updatedMessage?.msg });

    return updatedMessage;
  } catch (error) {
    return { error: `Error deleting message: ${(error as Error).message}` };
  }
};

export const restoreMessage = async (messageId: string, socket: FakeSOSocket) => {
  try {
    const message = await MessageModel.findById(messageId);

    if (!message || !message.deletedAt) {
      throw new Error('Message not found or not deleted');
    }

    const elapsedTime = (new Date().getTime() - new Date(message.deletedAt).getTime()) / 60000;
    if (elapsedTime > 15) {
      throw new Error('Restoration window expired');
    }

    const updatedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      {
        msg: message.deletedMessage || '',
        deletedMessage: null,
        deletedAt: null,
      },
      { new: true },
    );

    if (!updatedMessage) {
      throw new Error('Message not found after update');
    }

    socket.emit('messageRestored', { updatedMessage });

    return updatedMessage;
  } catch (error) {
    return { error: `Error restoring message: ${(error as Error).message}` };
  }
};
