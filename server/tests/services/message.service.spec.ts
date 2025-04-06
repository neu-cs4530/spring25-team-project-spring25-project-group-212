import mongoose, { Types } from 'mongoose';
import MessageModel from '../../models/messages.model';
import UserModel from '../../models/users.model';
import { getMessages, saveMessage, addReactionToMessage } from '../../services/message.service';
import { Message, FakeSOSocket } from '../../types/types';

const fakeSocket = { emit: jest.fn() } as unknown as FakeSOSocket;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

const message1: Message = {
  msg: 'Hello',
  msgFrom: 'User1',
  msgDateTime: new Date('2024-06-04'),
  type: 'global',
  useMarkdown: false,
};

const message2: Message = {
  msg: 'Hi',
  msgFrom: 'User2',
  msgDateTime: new Date('2024-06-05'),
  type: 'global',
  useMarkdown: false,
};

describe('Message model', () => {
  jest.mock('../../models/users.model');
  jest.mock('../../models/messages.model');
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  describe('saveMessage', () => {
    const mockMessage: Message = {
      msg: 'Hey!',
      msgFrom: 'userX',
      msgDateTime: new Date('2025-01-01T10:00:00.000Z'),
      type: 'direct',
      useMarkdown: false,
    };

    it('should create a message successfully if user exists', async () => {
      mockingoose(UserModel).toReturn(
        { _id: new mongoose.Types.ObjectId(), username: 'userX' },
        'findOne',
      );

      const mockCreatedMsg = {
        _id: new mongoose.Types.ObjectId(),
        ...mockMessage,
      };
      mockingoose(MessageModel).toReturn(mockCreatedMsg, 'create');

      const result = await saveMessage(mockMessage);

      expect(result).toMatchObject({
        msg: 'Hey!',
        msgFrom: 'userX',
        msgDateTime: new Date('2025-01-01T10:00:00.000Z'),
        type: 'direct',
      });
    });

    it('should return an error if user does not exist', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      const result = await saveMessage(mockMessage);
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Message sender is invalid');
      }
    });

    it('should return an error if message creation fails', async () => {
      mockingoose(UserModel).toReturn({ _id: 'someUserId' }, 'findOne');
      jest.spyOn(MessageModel, 'create').mockRejectedValueOnce(new Error('Create failed'));

      const result = await saveMessage(mockMessage);
      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toContain('Error when saving a message');
      }
    });
  });

  describe('getMessages', () => {
    it('should return all messages, sorted by date', async () => {
      mockingoose(MessageModel).toReturn([message2, message1], 'find');

      const messages = await getMessages();

      expect(messages).toMatchObject([message1, message2]);
    });
  });
  describe('addReactionToMessage', () => {
    const fakeUserId = new Types.ObjectId();
    const fakeMessageId = new Types.ObjectId().toString();

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

      const result = await addReactionToMessage(fakeMessageId, 'user1', '🔥', fakeSocket);

      if ('reactions' in result) {
        const { reactions } = result;
        expect(reactions).toEqual(
          expect.arrayContaining([expect.objectContaining({ emoji: '🔥', userId: fakeUserId })]),
        );
      } else {
        fail(`Expected result to contain 'reactions', but got: ${JSON.stringify(result)}`);
      }
    });
  });
});
