import { ObjectId } from 'mongodb';

/**
 * Interface representing a notification being created.
 */
export interface Notification {
  type: 'ANSWER';
  recipient: string;
  questionId: ObjectId;
  answerId: ObjectId;
  answeredBy: string;
  text: string;
}

/**
 * Interface representing a notification in the database.
 */
export interface DatabaseNotification extends Omit<Notification, 'text'> {
  _id: ObjectId;
  createdAt: Date;
  read: boolean;
}

/**
 * Interface representing a notification with populated references.
 */
export interface PopulatedDatabaseNotification
  extends Omit<DatabaseNotification, 'questionId' | 'answerId'> {
  questionId: {
    _id: ObjectId;
    title: string;
  };
  answerId: {
    _id: ObjectId;
    text: string;
  };
}
