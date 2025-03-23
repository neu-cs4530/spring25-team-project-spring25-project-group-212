import { useState, useEffect } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import ReactMarkdown from 'react-markdown';
import './index.css';
import { DatabaseMessage, ReactionUpdatePayload, ReadReceiptPayload } from '../../../types/types';
import { addReaction, getReactions, markMessageAsSeen } from '../../../services/messageService';
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
  const { user: currentUser, socket } = useUserContext();

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

  return (
    <div className='message'>
      <div className='message-header'>
        <div className='message-sender'>{message.msgFrom}</div>
        <div className='message-time'>{getMetaData(new Date(message.msgDateTime))}</div>
      </div>
      <div className='message-content'>
        <div className='message-body'>
          {'useMarkdown' in message && message.useMarkdown ? (
            <ReactMarkdown>{message.msg}</ReactMarkdown>
          ) : (
            <p>{message.msg}</p>
          )}
        </div>
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
      <div className='read-receipt'>{readReceipt}</div>
    </div>
  );
};

export default MessageCard;
