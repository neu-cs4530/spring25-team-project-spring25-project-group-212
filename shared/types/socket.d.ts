import { PopulatedDatabaseAnswer } from './answer';
import { PopulatedDatabaseChat } from './chat';
import { DatabaseMessage } from './message';
import { PopulatedDatabaseQuestion, Vote } from './question';
import { SafeDatabaseUser } from './user';
import { BaseMove, GameInstance, GameInstanceID, GameMove, GameState } from './game';
import { PopulatedDatabaseCommunity } from './community';
import { DatabaseNotification } from './notification';

/**
 * Payload for an answer update event.
 * - `qid`: The unique identifier of the question.
 * - `answer`: The updated answer.
 */
export interface AnswerUpdatePayload {
  qid: ObjectId;
  answer: PopulatedDatabaseAnswer;
}

/**
 * Payload for a game state update event.
 * - `gameInstance`: The updated instance of the game.
 */
export interface GameUpdatePayload {
  gameInstance: GameInstance<GameState>;
}

/**
 * Payload for a game operation error event.
 * - `player`: The player ID who caused the error.
 * - `error`: The error message.
 */
export interface GameErrorPayload {
  player: string;
  error: string;
}

/**
 * Payload for a vote update event.
 * - `qid`: The unique identifier of the question.
 * - `upVotes`: An array of usernames who upvoted the question.
 * - `downVotes`: An array of usernames who downvoted the question.
 */
export interface VoteUpdatePayload {
  qid: string;
  upVotes: Vote[];
  downVotes: Vote[];
}

/**
 * Payload for a chat update event.
 * - `chat`: The updated chat object.
 * - `type`: The type of update (`'created'`, `'newMessage'`, or `'newParticipant'`).
 */
export interface ChatUpdatePayload {
  chat: PopulatedDatabaseChat;
  type: 'created' | 'newMessage' | 'newParticipant' | 'renamed';
}

/**
 * Payload for a comment update event.
 * - `result`: The updated question or answer.
 * - `type`: The type of the updated item (`'question'` or `'answer'`).
 */
export interface CommentUpdatePayload {
  result: PopulatedDatabaseQuestion | PopulatedDatabaseAnswer;
  type: 'question' | 'answer';
}

/**
 * Payload for a message update event.
 * - `msg`: The updated message.
 */
export interface MessageUpdatePayload {
  msg: DatabaseMessage;
}

/**
 * Payload for a user update event.
 * - `user`: The updated user object.
 * - `type`: The type of modification (`'created'`, `'deleted'`, or `'updated'`).
 */
export interface UserUpdatePayload {
  user: SafeDatabaseUser;
  type: 'created' | 'deleted' | 'updated';
}

/**
 * Interface representing the payload for a game move operation, which contains:
 * - `gameID`: The ID of the game being played.
 * - `move`: The move being made in the game, defined by `GameMove`.
 */
export interface GameMovePayload {
  gameID: GameInstanceID;
  move: GameMove<BaseMove>;
}

export interface ReactionUpdatePayload {
  messageId: string;
  reactions?: { emoji: string; userId: string }[];
}

export interface ReadReceiptPayload {
  messageId: string;
  seenBy: string[];
  seenAt: string;
}

/**
 * Interface representing the events the client can emit to the server.
 * - `makeMove`: Client can emit a move in the game.
 * - `joinGame`: Client can join a game.
 * - `leaveGame`: Client can leave a game.
 * - `joinChat`: Client can join a chat.
 * - `leaveChat`: Client can leave a chat.
 * - `joinUser`: Client can join a user.
 * - `leaveUser`: Client can leave a user.
 */
export interface ClientToServerEvents {
  makeMove: (move: GameMovePayload) => void;
  joinGame: (gameID: string) => void;
  leaveGame: (gameID: string) => void;
  joinChat: (chatID: string) => void;
  leaveChat: (chatID: string | undefined) => void;
  userTyping: (communityID: string, username: string) => void;
  userStoppedTyping: (communityID: string, username: string) => void;
  joinCommunity: (communityID: string, username: string) => void;
  leaveCommunity: (communityID: string, username: string) => void;
  joinUser: (userId: string) => void;
  leaveUser: (userId: string) => void;
  messageSeen: (payload: ReadReceiptPayload) => void;
  requestUserCount: () => void;
  onlineUser: (communityID: string, username: string) => void;
  imageSent: (communityID: string) => void;
}

/**
 * Interface representing the payload for a community update event.
 * - `community`: The updated community object.
 * - `type`: The type of modification (`'created'`, `'deleted'`, or `'updated'`).
 */
export interface CommunityUpdatePayload {
  community: PopulatedDatabaseCommunity;
  type: 'created' | 'deleted' | 'updated';
}

/**
 * Payload for a notification update event.
 * - `notification`: The updated notification object.
 */
export interface NotificationUpdatePayload {
  notification: DatabaseNotification;
}

/**
 * Payload for a message restored event.
 * - `message`: The restored message.
 */
export interface MessageRestoredPayload {
  updatedMessage?: DatabaseMessage;
}

/**
 * Payload for a message deleted event.
 * - `messageId`: The ID of the deleted message.
 * - `deletedMessage`: The string of the deleted message.
 */
export interface MessageDeletedPayload {
  messageId: string;
  deletedMessage?: string;
}

/**
 * Payload for an online users update event.
 * - `users`: An array of usernames representing the online users.
 */
export interface OnlineUsersUpdatePayload {
  users: string[];
}

/**
 * Interface representing the events the server can emit to the client.
 * - `questionUpdate`: Server sends updated question.
 * - `answerUpdate`: Server sends updated answer.
 * - `viewsUpdate`: Server sends updated views count for a question.
 * - `voteUpdate`: Server sends updated votes for a question.
 * - `commentUpdate`: Server sends updated comment for a question or answer.
 * - `messageUpdate`: Server sends updated message.
 * - `userUpdate`: Server sends updated user status.
 * - `gameUpdate`: Server sends updated game state.
 * - `gameError`: Server sends error message related to game operation.
 * - `chatUpdate`: Server sends updated chat.
 * - `typingUpdate`: Server sends updated typing users.
 * - `communityUpdate`: Server sends updated community.
 * - `notificationUpdate`: Server sends updated notification.
 * - `readReceiptUpdate`: Server sends updated read receipt for a message.
 * - `userCountUpdate`: Server sends updated user count.
 * - `onlineUsersUpdate`: Server sends the list of online users.
 */
export interface ServerToClientEvents {
  questionUpdate: (question: PopulatedDatabaseQuestion) => void;
  answerUpdate: (result: AnswerUpdatePayload) => void;
  viewsUpdate: (question: PopulatedDatabaseQuestion) => void;
  voteUpdate: (vote: VoteUpdatePayload) => void;
  commentUpdate: (comment: CommentUpdatePayload) => void;
  messageUpdate: (message: MessageUpdatePayload) => void;
  messageRestored: (payload: MessageRestoredPayload) => void;
  messageDeleted: (payload: MessageDeletedPayload) => void;
  userUpdate: (user: UserUpdatePayload) => void;
  gameUpdate: (game: GameUpdatePayload) => void;
  gameError: (error: GameErrorPayload) => void;
  chatUpdate: (chat: ChatUpdatePayload) => void;
  reactionUpdate: (payload: ReactionUpdatePayload) => void;
  typingUpdate: (typingUsers: string[]) => void;
  communityUpdate: (community: CommunityUpdatePayload) => void;
  notificationUpdate: (notification: NotificationUpdatePayload) => void;
  readReceiptUpdate: (payload: ReadReceiptPayload) => void;
  userCountUpdate: (count: number) => void;
  onlineUsersUpdate: (payload: OnlineUsersUpdatePayload) => void;
}
