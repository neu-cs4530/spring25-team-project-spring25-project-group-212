import { useEffect, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import useCommunityMessagingPage from '../../../hooks/useCommunityMessagingPage';
import QuestionView from '../questionPage/question';
import MessageCard from '../messageCard';
import useCommunityQuestionPage from '../../../hooks/useCommunityQuestionPage';
import CommunityQuestionHeader from './CommunityQuestionHeader';
import useUserContext from '../../../hooks/useUserContext';
import { joinCommunity } from '../../../services/communityService';
import useCommunityNameAboutRules from '../../../hooks/useCommunityNameAboutRules';
import { renameChat } from '../../../services/chatService';
import './index.css';

const CommunityPage = () => {
  const {
    currentCommunity,
    communityChat,
    newMessage,
    setNewMessage,
    handleSendMessage,
    handleTyping,
    typingUsers,
    useMarkdown,
    setUseMarkdown,
  } = useCommunityMessagingPage();

  const { titleText, qlist, setQuestionOrder } = useCommunityQuestionPage();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
  const [chatName, setChatName] = useState(community?.groupChat?.name || '');

  useEffect(() => {
    if (currentCommunity && user) {
      joinCommunity(currentCommunity._id.toString(), user.username);
    }
  }, [currentCommunity, user]);

  useEffect(() => {
    if (community?.groupChat?.name) {
      setChatName(community.groupChat.name);
    }
  }, [community]);

  const handleEmojiSelect = (emojiObject: { emoji: string }) => {
    setNewMessage(prevMessage => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleRenameChat = async () => {
    if (!community || !community.groupChat?._id || !chatName.trim()) return;

    try {
      await renameChat(community.groupChat._id, chatName);
      setChatName(chatName);
    } catch (error) {
      throw Error('Failed to rename the chat');
    }
  };

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
        <div className='rename-chat'>
          <input
            className='custom-input'
            type='text'
            value={chatName}
            onChange={e => setChatName(e.target.value)}
            placeholder='Enter new chat name'
          />
          <button className='custom-button' onClick={handleRenameChat}>
            Rename
          </button>
        </div>
        <p>
          <strong>Current Chat Name: </strong>
          {chatName}
        </p>

        <div className='direct-message-container'>
          <div id='community-chat' className='chat-container'>
            <div className='chat-messages'>
              {communityChat?.messages && communityChat.messages.length > 0 ? (
                communityChat.messages.map(message => (
                  <MessageCard
                    key={String(message._id)}
                    message={message}
                    totalUsers={currentCommunity?.members.length || 1}
                  />
                ))
              ) : (
                <div>No messages yet.</div>
              )}
            </div>

            {typingUsers.length > 0 && (
              <div className='typing-indicator'>
                {typingUsers.length === 1 && `${typingUsers[0]} is typing...`}
                {typingUsers.length === 2 &&
                  `${typingUsers[0]} and ${typingUsers[1]} are typing...`}
                {typingUsers.length > 2 && 'Many people are typing...'}
              </div>
            )}

            <div className='message-input-container'>
              <div className='message-input'>
                <input
                  className='custom-input'
                  type='text'
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder='Type a message...'
                />
                <button
                  className='emoji-button'
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                  😀
                </button>
                <button className='custom-button' onClick={handleSendMessage}>
                  Send
                </button>
                <button
                  type='button'
                  className={`markdown-toggle ${useMarkdown ? 'active' : ''}`}
                  onClick={() => setUseMarkdown(!useMarkdown)}
                  title={useMarkdown ? 'Disable Markdown' : 'Enable Markdown'}>
                  MD
                </button>
              </div>

              {showEmojiPicker && (
                <div className='emoji-picker-container'>
                  <EmojiPicker onEmojiClick={handleEmojiSelect} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
