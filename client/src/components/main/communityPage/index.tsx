import React from 'react';
import useCommunityMessagingPage from '../../../hooks/useCommunityMessagingPage';
import QuestionView from '../questionPage/question';
import MessageCard from '../messageCard';
import useCommunityQuestionPage from '../../../hooks/useCommunityQuestionPage';
import CommunityQuestionHeader from './CommunityQuestionHeader';

const CommunityPage = () => {
  const { currentCommunity, communityChat, newMessage, setNewMessage, handleSendMessage } =
    useCommunityMessagingPage();

  const { titleText, qlist, setQuestionOrder } = useCommunityQuestionPage();

  if (!currentCommunity) {
    return <div>Community not found</div>;
  }

  return (
    <div id='community-page'>
      <h1>{currentCommunity.name}</h1>
      <p>{currentCommunity.about}</p>
      <div id='community-content'>
        <div id='community-questions'>
          <CommunityQuestionHeader
            titleText={titleText}
            qcnt={qlist.length}
            setQuestionOrder={setQuestionOrder}
          />
          <div id='question_list' className='question_list'>
            {qlist.map(q => (
              <QuestionView question={q} key={String(q._id)} />
            ))}
          </div>
          {titleText === 'Search Results' && !qlist.length && (
            <div className='bold_title right_padding'>No Questions Found</div>
          )}
        </div>
        <div className='direct-message-container'>
          <div id='community-chat' className='chat-container'>
            <div className='chat-messages'>
              {communityChat?.messages.map(message => (
                <MessageCard key={String(message._id)} message={message} />
              ))}
            </div>
            <div className='message-input'>
              <input
                className='custom-input'
                type='text'
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder='Type a message...'
              />
              <button className='custom-button' onClick={handleSendMessage}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
