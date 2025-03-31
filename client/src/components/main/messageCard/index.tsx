import { useState, useEffect } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import ReactMarkdown from 'react-markdown';
import './index.css';
import { DatabaseMessage, ReactionUpdatePayload, ReadReceiptPayload } from '../../../types/types';
import {
  addReaction,
  getReactions,
  markMessageAsSeen,
  deleteMessage,
  restoreMessage,
} from '../../../services/messageService';
import useUserContext from '../../../hooks/useUserContext';
import { getMetaData } from '../../../tool';

/**
 * MessageCard component displays a single message with its sender and timestamp.
 * Supports rendering markdown content when useMarkdown is enabled.
 *
 * @param message: The message object to display.
 */

const MessageCard = ({ message, totalUsers }: { message: DatabaseMessage; totalUsers: number }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactions, setReactions] = useState<string[]>([]);
  const [seenBy, setSeenBy] = useState<string[]>([]);
  const [delMessage, setDelMessage] = useState<DatabaseMessage>(message);
  const { user: currentUser, socket } = useUserContext();

  useEffect(() => {
    setDelMessage(message);
  }, [message]);

  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const fetchedReactions = await getReactions(message._id.toString());
        setReactions(fetchedReactions.map((r: { emoji: string }) => r.emoji) || []);
      } catch (error) {
        throw Error('Error fetching the reactions');
      }
    };

    fetchReactions();
  }, [message._id]);

  useEffect(() => {
    if (!socket) return () => {};

    const handleSeenUpdate = (payload: ReadReceiptPayload) => {
      if (payload.messageId === message._id.toString()) {
        setSeenBy(payload.seenBy);
      }
    };

    socket.on('readReceiptUpdate', handleSeenUpdate);
    return () => {
      socket.off('readReceiptUpdate', handleSeenUpdate);
    };
  }, [socket, message._id]);

  useEffect(() => {
    const markAsSeen = async () => {
      try {
        await markMessageAsSeen(message._id.toString(), currentUser.username);
      } catch (error) {
        throw Error('Error marking the message as seen');
      }
    };

    markAsSeen();
  }, [message._id, currentUser.username]);

  const handleAddReaction = async (emojiObject: EmojiClickData) => {
    setReactions(prev => [...prev, emojiObject.emoji]);
    setShowEmojiPicker(false);

    await addReaction(message._id.toString(), emojiObject.emoji, message.msgFrom);

    const updatedReactions: { emoji: string }[] = await getReactions(message._id.toString());
    setReactions(updatedReactions.map(r => r.emoji));
  };

  const seenPercentage = (seenBy.length / totalUsers) * 100;
  let readReceipt = '';

  if (seenPercentage === 100) {
    readReceipt = '✔️✔️';
  } else if (seenPercentage > 50) {
    readReceipt = '✔️';
  }

  useEffect(() => {
    if (!socket) return undefined;

    const handleReactionUpdate = (payload: ReactionUpdatePayload) => {
      if (payload.messageId === message._id.toString() && Array.isArray(payload.reactions)) {
        setReactions(payload.reactions?.map(r => r.emoji) || []);
      }
    };

    socket.on('reactionUpdate', handleReactionUpdate);

    return () => {
      socket.off('reactionUpdate', handleReactionUpdate);
    };
  }, [socket, message._id]);

  const handleDeleteMessage = async () => {
    try {
      const updatedMessage = await deleteMessage(message._id.toString(), currentUser.username);
      setDelMessage(updatedMessage.deletedMessage);
    } catch (error) {
      throw Error('Error deleting message');
    }
  };

  const handleRestoreMessage = async () => {
    if (!delMessage.deletedAt) return;

    const elapsedTime = (new Date().getTime() - new Date(delMessage.deletedAt).getTime()) / 60000;
    if (elapsedTime > 15) {
      // eslint-disable-next-line no-alert
      alert('Restoration window expired.');
      return;
    }

    try {
      const updatedMessage = await restoreMessage(delMessage._id.toString());
      setDelMessage(updatedMessage.restoredMessage);
    } catch (error) {
      throw Error('Error restoring message');
    }
  };

  useEffect(() => {
    setDelMessage(delMessage);
  }, [delMessage]);

  let messageContent;
  if (delMessage.deletedAt || message.deletedAt) {
    messageContent = <p className='deleted-message'>Message has been deleted</p>;
  } else if ('useMarkdown' in message && message.useMarkdown) {
    messageContent = <ReactMarkdown>{delMessage.msg}</ReactMarkdown>;
  } else {
    messageContent = <p>{delMessage.msg}</p>;
  }

  return (
    <div className='message'>
      <div className='message-header'>
        <div className='message-sender'>{message.msgFrom}</div>
        <div className='message-time'>{getMetaData(new Date(message.msgDateTime))}</div>
      </div>
      <div className='message-content'>
        <div className='message-body'>{messageContent}</div>
        <div className='message-actions'>
          <div className='reactions-container'>
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😊</button>
            <div className='reactions'>
              {reactions.map((emoji, index) => (
                <span key={index}>{emoji}</span>
              ))}
            </div>
          </div>
          {showEmojiPicker && (
            <div>
              <EmojiPicker onEmojiClick={handleAddReaction} />
            </div>
          )}
        </div>
      </div>
      <div className='message-footer'>
        <div className='delete-buttons'>
          {message.msgFrom === currentUser.username && (
            <>
              {!delMessage.deletedAt ? (
                <button onClick={handleDeleteMessage}>Delete</button>
              ) : (
                <button onClick={handleRestoreMessage}>Restore</button>
              )}
            </>
          )}
        </div>
        <div className='read-receipt'>{readReceipt}</div>
      </div>
    </div>
  );
};

export default MessageCard;
