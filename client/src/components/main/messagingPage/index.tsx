import './index.css';
import useMessagingPage from '../../../hooks/useMessagingPage';
import MessageCard from '../messageCard';

/**
 * Represents the MessagingPage component which displays the public chat room.
 * and provides functionality to send and receive messages.
 */
const MessagingPage = () => {
  const {
    messages,
    newMessage,
    handleTyping,
    setNewMessage,
    handleSendMessage,
    typingUsers,
    error,
  } = useMessagingPage();

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1)
      return <p className='typing-indicator'>{typingUsers[0]} is typing...</p>;
    if (typingUsers.length === 2)
      return <p className='typing-indicator'>{typingUsers.join(', ')} are typing...</p>;
    return <p className='typing-indicator'>Many people are typing...</p>;
  };

  return (
    <div className='chat-room'>
      <div className='chat-header'>
        <h2>Chat Room</h2>
      </div>
      <div className='chat-messages'>
        {messages.map(message => (
          <MessageCard key={String(message._id)} message={message} />
        ))}
      </div>
      {renderTypingIndicator()}
      <div className='message-input'>
        <textarea
          className='message-textbox'
          placeholder='Type your message here'
          value={newMessage}
          onChange={handleTyping}
        />
        <div className='message-actions'>
          <button type='button' className='send-button' onClick={handleSendMessage}>
            Send
          </button>
          {error && <span className='error-message'>{error}</span>}
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;
