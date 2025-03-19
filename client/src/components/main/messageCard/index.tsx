import React from 'react';
import { useState, useEffect } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import ReactMarkdown from 'react-markdown';
import './index.css';
import { DatabaseMessage, ReactionUpdatePayload } from '../../../types/types';
import { addReaction, getReactions } from '../../../services/messageService';
import useUserContext from '../../../hooks/useUserContext';

/**
 * MessageCard component displays a single message with its sender and timestamp.
 * Supports rendering markdown content when useMarkdown is enabled.
 *
 * @param message: The message object to display.
 */

const MessageCard = ({ message }: { message: DatabaseMessage }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactions, setReactions] = useState<string[]>([]);
  const { socket } = useUserContext();

  // Fetch reactions when the message loads
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const fetchedReactions = await getReactions(message._id.toString());
        setReactions(fetchedReactions.map((r: { emoji: string }) => r.emoji) || []);
      } catch (error) {
        console.error('Error fetching reactions:', error);
      }
    };

    fetchReactions();
  }, [message._id]);

  const handleAddReaction = async (emojiObject: EmojiClickData) => {
    setReactions(prev => [...prev, emojiObject.emoji]); // Optimistic UI update
    setShowEmojiPicker(false);

    await addReaction(message._id.toString(), emojiObject.emoji, message.msgFrom);

    // Fetch updated reactions from DB after adding
    const updatedReactions: { emoji: string }[] = await getReactions(message._id.toString());
    setReactions(updatedReactions.map(r => r.emoji));
  };

  // Listen for reaction updates via socket
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
      <div className='message-text'>
        <p>{message.msg}</p>
      </div>
      <div className='reactions'>
        {reactions.map((emoji, index) => (
          <span key={index}>{emoji}</span>
        ))}
      </div>
      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😊</button>
      {showEmojiPicker && <EmojiPicker onEmojiClick={handleAddReaction} />}
    </div>
  );
};
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
