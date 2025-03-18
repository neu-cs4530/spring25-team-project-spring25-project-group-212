import React, { useEffect } from 'react';
import useCommunityMessagingPage from '../../../hooks/useCommunityMessagingPage';
import QuestionView from '../questionPage/question';
import MessageCard from '../messageCard';
import useCommunityQuestionPage from '../../../hooks/useCommunityQuestionPage';
import CommunityQuestionHeader from './CommunityQuestionHeader';
import useUserContext from '../../../hooks/useUserContext';
import { joinCommunity } from '../../../services/communityService';
import useCommunityNameAboutRules from '../../../hooks/useCommunityNameAboutRules';
import './index.css';

const CommunityPage = () => {
  const { currentCommunity, communityChat, newMessage, setNewMessage, handleSendMessage } =
    useCommunityMessagingPage();

  const { titleText, qlist, setQuestionOrder } = useCommunityQuestionPage();

  const {
    community,
    editMode,
    setEditMode,
    newName,
    setNewName,
    newAbout,
    setNewAbout,
    newRules,
    setNewRules,
    handleEditNameAboutRules,
    canEditNameAboutRules,
  } = useCommunityNameAboutRules();

  const { user } = useUserContext();
  useEffect(() => {
    if (currentCommunity && user) {
      joinCommunity(currentCommunity._id.toString(), user.username);
    }
  }, [currentCommunity, user]);

  if (!currentCommunity || !community) {
    return <div>Community not found</div>;
  }

  return (
    <div id='community-page'>
      {!editMode && (
        <div>
          <strong>Community Name: </strong> {community.name}
          <p>
            <strong>About: </strong>
            {community.about}
          </p>
          <p>
            <strong>Rules: </strong>
            {community.rules}
          </p>
          {canEditNameAboutRules && (
            <button
              className='login-button'
              style={{ marginLeft: '1rem' }}
              onClick={() => {
                setEditMode(true);
                setNewName(community?.name || '');
                setNewAbout(community?.about || '');
                setNewRules(community?.rules || '');
              }}>
              Edit Name, About, and/or Rules
            </button>
          )}
        </div>
      )}

      {editMode && canEditNameAboutRules && (
        <div>
          <input
            className='input-text'
            placeholder='Enter new name...'
            type='text'
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          <input
            className='input-text'
            placeholder='Enter new about...'
            type='text'
            value={newAbout}
            onChange={e => setNewAbout(e.target.value)}
          />
          <input
            className='input-text'
            placeholder='Enter new rules...'
            type='text'
            value={newRules}
            onChange={e => setNewRules(e.target.value)}
          />
          <button
            className='login-button'
            style={{ marginLeft: '1rem' }}
            onClick={handleEditNameAboutRules}>
            Save
          </button>
          <button
            className='delete-button'
            style={{ marginLeft: '1rem' }}
            onClick={() => setEditMode(false)}>
            Cancel
          </button>
        </div>
      )}
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

              {communityChat?.messages && communityChat.messages.length > 0 ? (
                communityChat.messages.map(message => (
                  <MessageCard key={String(message._id)} message={message} />
                ))
              ) : (
                <div>No messages yet.</div>
              )}
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
