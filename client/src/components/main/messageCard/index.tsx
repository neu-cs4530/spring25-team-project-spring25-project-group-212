import React from 'react';
import ReactMarkdown from 'react-markdown';
import './index.css';
import { DatabaseMessage } from '../../../types/types';
import { getMetaData } from '../../../tool';

/**
 * MessageCard component displays a single message with its sender and timestamp.
 * Supports rendering markdown content when useMarkdown is enabled.
 *
 * @param message: The message object to display.
 */
const MessageCard = ({ message }: { message: DatabaseMessage }) => (
  <div className='message'>
    <div className='message-header'>
      <div className='message-sender'>{message.msgFrom}</div>
      <div className='message-time'>{getMetaData(new Date(message.msgDateTime))}</div>
    </div>
    <div className='message-body'>
      {'useMarkdown' in message && message.useMarkdown ? (
        <ReactMarkdown>{message.msg}</ReactMarkdown>
      ) : (
        message.msg
      )}
    </div>
  </div>
);

export default MessageCard;
