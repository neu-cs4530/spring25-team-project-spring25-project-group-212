// filepath: /Users/kaushikbalantrapu/Documents/Year 3/CS 4530/spring25-team-project-spring25-project-group-212/client/src/components/main/communityPage/index.tsx
import React from 'react';
import useCommunityMessagingPage from '../../../hooks/useCommunityMessagingPage';
import QuestionPage from '../questionPage';
import './index.css';

const CommunityPage = () => {
  const {
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    error: messageError,
  } = useCommunityMessagingPage(community?.groupChatId);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!community) {
    return <div>Community not found</div>;
  }

  return (
    <div className='community-page'>
      <h1>{community.name}</h1>
      <p>{community.about}</p>
      <div className='communit y-content'>
        <div className='community-questions'>
          <QuestionPage questions={questions} />
        </div>
        <div className='community-chat'>
          <div className='messages'>
            {messages.map((msg, index) => (
              <div key={index} className='message'>
                <strong>{msg.msgFrom}</strong>: {msg.msg}
              </div>
            ))}
          </div>
          <div className='message-input'>
            <input
              type='text'
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder='Type a message...'
            />
            <button onClick={handleSendMessage}>Send</button>
            {messageError && <div className='error'>{messageError}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;