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

/**
 * Adds a reaction (emoji) to a message and notifies clients via socket.
 * @param messageId - ID of the message to react to.
 * @param username - Username of the user reacting.
 * @param emoji - Emoji reaction to add.
 * @param socket - Socket instance used to emit reaction updates.
 * @returns The updated message or an error object.
 */
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

    const alreadyReacted = (existingMessage.reactions ?? []).some(
      reaction => reaction.emoji === emoji && reaction.userId.toString() === user._id.toString(),
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

/**
 * Removes a user's emoji reaction from a message and notifies clients via socket.
 * @param messageId - ID of the message.
 * @param username - Username of the user removing their reaction.
 * @param emoji - Emoji to remove.
 * @param socket - Socket instance used to emit reaction updates.
 * @returns The updated message or an error object.
 */
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

/**
 * Retrieves all reactions for a given message.
 * @param messageId - ID of the message to fetch reactions for.
 * @returns An array of reactions or an error object.
 */
export const getReactions = async (messageId: string) => {
  try {
    const message = await MessageModel.findById(messageId)
      .populate('reactions.userId', 'username')
      .lean();

    if (!message) {
      throw new Error('Message not found');
    }

    return message.reactions;
  } catch (error) {
    return { error: `Error fetching reactions: ${(error as Error).message}` };
  }
};

/**
 * Marks a message as seen by a user and emits a read receipt update.
 * @param messageId - ID of the message being marked as seen.
 * @param userId - ID of the user who saw the message.
 * @param socket - Socket instance used to emit the read receipt.
 * @returns The updated message or an error object.
 */
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

/**
 * Deletes a message by marking it as deleted and emits a socket event.
 * Only the original sender is allowed to delete the message.
 * @param messageId - ID of the message to delete.
 * @param username - Username of the user attempting to delete the message.
 * @param socket - Socket instance used to emit deletion updates.
 * @returns The updated (deleted) message or an error object.
 */
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

/**
 * Restores a deleted message if within a 15-minute window and emits an update via socket.
 * @param messageId - ID of the message to restore.
 * @param socket - Socket instance used to emit restoration updates.
 * @returns The restored message or an error object.
 */
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
