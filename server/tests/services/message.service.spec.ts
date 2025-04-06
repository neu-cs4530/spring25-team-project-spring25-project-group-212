import { Types } from 'mongoose';
import MessageModel from '../../models/messages.model';
import UserModel from '../../models/users.model';
import {
  getMessages,
  saveMessage,
  addReactionToMessage,
  removeReactionFromMessage,
  getReactions,
  markMessageAsSeen,
  deleteMessage,
  restoreMessage,
} from '../../services/message.service';
import { Message, FakeSOSocket } from '../../types/types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

const fakeSocket = { emit: jest.fn() } as unknown as FakeSOSocket;

describe('message.service', () => {
  const fakeUserId = new Types.ObjectId();
  const fakeMessageId = new Types.ObjectId().toString();

  const baseMessage: Message = {
    msg: 'Test Message',
    msgFrom: 'TestUser',
    msgDateTime: new Date('2025-01-01T10:00:00.000Z'),
    type: 'global',
    useMarkdown: false,
  };

  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  describe('saveMessage', () => {
    it('should create a message successfully if user exists', async () => {
      mockingoose(UserModel).toReturn({ _id: fakeUserId, username: 'TestUser' }, 'findOne');
      mockingoose(MessageModel).toReturn({ _id: new Types.ObjectId(), ...baseMessage }, 'create');

      const result = await saveMessage(baseMessage);
      expect(result).toMatchObject({
        msg: 'Test Message',
        msgFrom: 'TestUser',
      });
    });

    it('should return an error if user does not exist', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      const result = await saveMessage(baseMessage);
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain('Message sender is invalid');
      }
    });

    it('should return an error if message creation fails', async () => {
      mockingoose(UserModel).toReturn({ _id: fakeUserId, username: 'TestUser' }, 'findOne');
      jest.spyOn(MessageModel, 'create').mockRejectedValueOnce(new Error('Create failed'));

      const result = await saveMessage(baseMessage);
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain('Error when saving a message');
      }
    });
  });

  describe('getMessages', () => {
    it('should return all messages, sorted by date ascending', async () => {
      const m1 = { ...baseMessage, msgDateTime: new Date('2024-01-01') };
      const m2 = { ...baseMessage, msgDateTime: new Date('2024-01-02') };
      mockingoose(MessageModel).toReturn([m2, m1], 'find');

      const messages = await getMessages();
      expect(messages[0].msgDateTime).toEqual(new Date('2024-01-01'));
      expect(messages[1].msgDateTime).toEqual(new Date('2024-01-02'));
    });
    it('should return empty array if an error occurs', async () => {
      jest.spyOn(MessageModel, 'find').mockImplementationOnce(() => {
        throw new Error('DB crash');
      });

      const messages = await getMessages();
      expect(messages).toEqual([]);
    });
  });

  describe('addReactionToMessage', () => {
    it('adds a reaction when user and message exist', async () => {
      mockingoose(UserModel).toReturn({ _id: fakeUserId }, 'findOne');
      mockingoose(MessageModel).toReturn({ _id: fakeMessageId, reactions: [] }, 'findOne');
      mockingoose(MessageModel).toReturn(
        {
          _id: fakeMessageId,
          reactions: [{ emoji: '🔥', userId: fakeUserId, _id: new Types.ObjectId() }],
        },
        'findOneAndUpdate',
      );

      const result = await addReactionToMessage(fakeMessageId, 'TestUser', '🔥', fakeSocket);

      expect(fakeSocket.emit).toHaveBeenCalledWith('reactionUpdate', {
        messageId: fakeMessageId,
        reactions: [
          {
            emoji: '🔥',
            userId: fakeUserId.toString(),
          },
        ],
      });
      if ('reactions' in result) {
        expect(result.reactions).toHaveLength(1);
        expect(result.reactions?.[0].emoji).toBe('🔥');
      } else {
        fail('Expected result to contain a "reactions" array');
      }
    });

    it('returns error if message not found after reaction update', async () => {
      mockingoose(UserModel).toReturn({ _id: fakeUserId }, 'findOne');
      mockingoose(MessageModel).toReturn({ _id: fakeMessageId, reactions: [] }, 'findOne');
      mockingoose(MessageModel).toReturn(null, 'findOneAndUpdate');

      const result = await addReactionToMessage(fakeMessageId, 'TestUser', '❤️', fakeSocket);

      if ('error' in result) {
        expect(result.error).toContain('Message not found');
      } else {
        fail('Expected an error object, but got a successful result');
      }
    });

    it('returns error if the user is not found', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      const result = await addReactionToMessage(fakeMessageId, 'UnknownUser', '🔥', fakeSocket);
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain('User not found');
      }
    });

    it('returns error if the message is not found', async () => {
      mockingoose(UserModel).toReturn({ _id: fakeUserId }, 'findOne');
      mockingoose(MessageModel).toReturn(null, 'findOne');

      const result = await addReactionToMessage(fakeMessageId, 'TestUser', '🔥', fakeSocket);
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain('Message not found');
      }
    });

    it('returns a message if user already reacted', async () => {
      mockingoose(UserModel).toReturn({ _id: fakeUserId }, 'findOne');
      mockingoose(MessageModel).toReturn(
        {
          _id: fakeMessageId,
          reactions: [{ emoji: '🔥', userId: fakeUserId }],
        },
        'findOne',
      );

      const result = await addReactionToMessage(fakeMessageId, 'TestUser', '🔥', fakeSocket);
      if ('message' in result) {
        expect(result.message).toBe('Reaction already exists');
      } else {
        fail('Expected a "message" response when reaction is duplicated');
      }
    });
  });

  describe('removeReactionFromMessage', () => {
    it('removes a reaction when user and message exist', async () => {
      mockingoose(UserModel).toReturn({ _id: fakeUserId }, 'findOne');
      const updatedDoc = {
        _id: fakeMessageId,
        reactions: [],
      };
      mockingoose(MessageModel).toReturn(updatedDoc, 'findOneAndUpdate');

      const result = await removeReactionFromMessage(fakeMessageId, 'TestUser', '🔥', fakeSocket);

      expect(fakeSocket.emit).toHaveBeenCalledWith('reactionUpdate', {
        messageId: fakeMessageId,
        reactions: [],
      });
      if ('reactions' in result) {
        expect(result.reactions).toEqual([]);
      } else {
        fail('Expected updatedMessage with empty reactions array');
      }
    });

    it('removes a reaction and emits updated reactions list', async () => {
      const updatedDoc = {
        _id: fakeMessageId,
        reactions: [
          {
            emoji: '🔥',
            userId: new Types.ObjectId('65b0e6f60e613f1f1a4c0f23'),
          },
          {
            emoji: '🎉',
            userId: new Types.ObjectId('65b0e6f60e613f1f1a4c0f99'),
          },
        ],
      };

      mockingoose(UserModel).toReturn({ _id: fakeUserId }, 'findOne');
      mockingoose(MessageModel).toReturn(updatedDoc, 'findOneAndUpdate');

      const result = await removeReactionFromMessage(fakeMessageId, 'TestUser', '🔥', fakeSocket);

      expect(fakeSocket.emit).toHaveBeenCalledWith('reactionUpdate', {
        messageId: fakeMessageId,
        reactions: [
          {
            emoji: '🔥',
            userId: '65b0e6f60e613f1f1a4c0f23',
          },
          {
            emoji: '🎉',
            userId: '65b0e6f60e613f1f1a4c0f99',
          },
        ],
      });

      if ('error' in result) {
        fail(`Unexpected error: ${result.error}`);
      } else {
        expect(result.reactions).toHaveLength(2);
      }
    });

    it('returns error if user not found', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');
      const result = await removeReactionFromMessage(
        fakeMessageId,
        'UnknownUser',
        '🔥',
        fakeSocket,
      );

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain('User not found');
      }
    });

    it('returns error if message not found after update', async () => {
      mockingoose(UserModel).toReturn({ _id: fakeUserId }, 'findOne');
      mockingoose(MessageModel).toReturn(null, 'findOneAndUpdate');

      const result = await removeReactionFromMessage(fakeMessageId, 'TestUser', '🔥', fakeSocket);
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain('Message not found');
      }
    });
  });

  describe('getReactions', () => {
    it('returns the reaction list for a valid message', async () => {
      mockingoose(MessageModel).toReturn(
        {
          _id: fakeMessageId,
          reactions: [
            { emoji: '❤️', userId: fakeUserId },
            { emoji: '🔥', userId: new Types.ObjectId() },
          ],
        },
        'findOne',
      );

      const result = await getReactions(fakeMessageId);
      if (Array.isArray(result)) {
        expect(result.length).toBe(2);
        expect(result[0].emoji).toBe('❤️');
        expect(result[1].emoji).toBe('🔥');
      } else {
        fail('Expected an array of reactions');
      }
    });

    it('returns error if message not found', async () => {
      mockingoose(MessageModel).toReturn(null, 'findOne');

      const result = await getReactions(fakeMessageId);

      expect(result && typeof result === 'object' && 'error' in result).toBe(true);
      if (result && typeof result === 'object' && 'error' in result) {
        expect(result.error).toContain('Message not found');
      } else {
        fail('Expected an error object but got something else');
      }
    });

    it('returns an empty array if the message has no reactions', async () => {
      mockingoose(MessageModel).toReturn({ _id: fakeMessageId, reactions: [] }, 'findOne');

      const result = await getReactions(fakeMessageId);
      if (Array.isArray(result)) {
        expect(result).toEqual([]);
      } else {
        fail('Expected an empty array for no reactions');
      }
    });
  });

  describe('markMessageAsSeen', () => {
    it('marks a message as seen when message exists', async () => {
      mockingoose(MessageModel).toReturn({ _id: fakeMessageId }, 'findOne');
      const updatedDoc = {
        _id: fakeMessageId,
        seenBy: [fakeUserId],
      };
      mockingoose(MessageModel).toReturn(updatedDoc, 'findOneAndUpdate');

      const result = await markMessageAsSeen(fakeMessageId, fakeUserId.toString(), fakeSocket);

      expect(fakeSocket.emit).toHaveBeenCalledWith('readReceiptUpdate', {
        messageId: fakeMessageId,
        seenBy: [fakeUserId.toString()],
        seenAt: expect.any(String),
      });

      if ('seenBy' in result) {
        expect(result.seenBy).toHaveLength(1);
      } else {
        fail('Expected updatedMessage with seenBy array');
      }
    });

    it('returns error if message is not found initially', async () => {
      mockingoose(MessageModel).toReturn(null, 'findOne');
      const result = await markMessageAsSeen(fakeMessageId, fakeUserId.toString(), fakeSocket);

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain('Message not found');
      }
    });

    it('returns error if updated message is not found after update', async () => {
      mockingoose(MessageModel).toReturn({ _id: fakeMessageId }, 'findOne');
      mockingoose(MessageModel).toReturn(null, 'findOneAndUpdate');

      const result = await markMessageAsSeen(fakeMessageId, fakeUserId.toString(), fakeSocket);
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain('Message not found after update');
      }
    });
  });

  describe('deleteMessage', () => {
    it('deletes the message if message exists and user is the sender', async () => {
      const originalDoc = {
        _id: fakeMessageId,
        msg: 'Original message text',
        msgFrom: 'TestUser',
      };
      mockingoose(MessageModel).toReturn(originalDoc, 'findOne');
      const updatedDoc = {
        ...originalDoc,
        msg: 'Message has been deleted',
        deletedMessage: 'Original message text',
        deletedAt: new Date(),
      };
      mockingoose(MessageModel).toReturn(updatedDoc, 'findOneAndUpdate');

      const result = await deleteMessage(fakeMessageId, 'TestUser', fakeSocket);

      expect(fakeSocket.emit).toHaveBeenCalledWith('messageDeleted', {
        messageId: fakeMessageId,
        deletedMessage: 'Message has been deleted',
      });

      expect(result).not.toBeNull();

      if (result && 'deletedAt' in result) {
        expect(result.deletedAt).toBeDefined();
        expect(result.msg).toBe('Message has been deleted');
        expect(result.deletedMessage).toBe('Original message text');
      } else {
        fail('Expected updated doc with deleted fields');
      }
    });

    it('returns error if message not found', async () => {
      mockingoose(MessageModel).toReturn(null, 'findOne');
      const result = await deleteMessage(fakeMessageId, 'TestUser', fakeSocket);

      expect(result).not.toBeNull();
      expect('error' in result!).toBe(true);

      if ('error' in result!) {
        expect(result.error).toContain('Message not found');
      } else {
        fail('Expected an error object, but got a non-error response');
      }
    });

    it('returns error if message is not owned by user', async () => {
      mockingoose(MessageModel).toReturn(
        { _id: fakeMessageId, msg: 'some text', msgFrom: 'AnotherUser' },
        'findOne',
      );

      const result = await deleteMessage(fakeMessageId, 'TestUser', fakeSocket);

      expect(result).not.toBeNull();
      expect('error' in result!).toBe(true);

      if ('error' in result!) {
        expect(result.error).toContain('You can only delete your own messages');
      } else {
        fail('Expected an error response, but got something else');
      }
    });
  });
  describe('restoreMessage', () => {
    it('restores a recently deleted message within 15 minutes', async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60000);
      mockingoose(MessageModel).toReturn(
        {
          _id: fakeMessageId,
          msg: 'Message has been deleted',
          deletedMessage: 'Original text',
          deletedAt: fiveMinutesAgo,
        },
        'findOne',
      );

      const updatedDoc = {
        _id: fakeMessageId,
        msg: 'Original text',
        deletedMessage: null,
        deletedAt: null,
        reactions: [],
        seenBy: [],
        useMarkdown: false,
      };
      mockingoose(MessageModel).toReturn(updatedDoc, 'findOneAndUpdate');

      const result = await restoreMessage(fakeMessageId, fakeSocket);

      const emitMock = fakeSocket.emit as jest.Mock;

      expect(emitMock.mock.calls.length).toBe(1);

      const [actualEvent, actualPayload] = emitMock.mock.calls[0];

      expect(actualEvent).toBe('messageRestored');

      expect(actualPayload.updatedMessage).toMatchObject({
        msg: 'Original text',
        deletedMessage: null,
        deletedAt: null,
      });

      expect(result).toMatchObject({
        msg: 'Original text',
        deletedMessage: null,
        deletedAt: null,
      });
    });

    it('returns error if message not found or not deleted', async () => {
      mockingoose(MessageModel).toReturn({ _id: fakeMessageId, deletedAt: null }, 'findOne');

      const result = await restoreMessage(fakeMessageId, fakeSocket);
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain('Message not found or not deleted');
      }
    });

    it('returns error if restoration window is expired', async () => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60000);
      const doc = {
        _id: fakeMessageId,
        msg: 'deleted text placeholder',
        deletedMessage: 'Original text',
        deletedAt: thirtyMinutesAgo,
      };
      mockingoose(MessageModel).toReturn(doc, 'findOne');

      const result = await restoreMessage(fakeMessageId, fakeSocket);
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain('Restoration window expired');
      }
    });

    it('returns error if message cannot be found after update', async () => {
      mockingoose(MessageModel).toReturn(
        {
          _id: fakeMessageId,
          msg: 'deleted text placeholder',
          deletedMessage: 'Original text',
          deletedAt: new Date(),
        },
        'findOne',
      );
      mockingoose(MessageModel).toReturn(null, 'findOneAndUpdate');

      const result = await restoreMessage(fakeMessageId, fakeSocket);
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain('Message not found after update');
      }
    });
  });
});
