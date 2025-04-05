import { useEffect, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { UploadButton } from 'react-uploader';
import { Uploader } from 'uploader';
import useCommunityMessagingPage from '../../../hooks/useCommunityMessagingPage';
import QuestionView from '../questionPage/question';
import MessageCard from '../messageCard';
import useCommunityQuestionPage from '../../../hooks/useCommunityQuestionPage';
import CommunityQuestionHeader from './CommunityQuestionHeader';
import useUserContext from '../../../hooks/useUserContext';
import { getOnlineUsersForCommunity, joinCommunity } from '../../../services/communityService';
import useCommunityNameAboutRules from '../../../hooks/useCommunityNameAboutRules';
import { renameChat } from '../../../services/chatService';
import './index.css';
import useCommunityTabsHeader from '../../../hooks/useCommunityTabsHeader';
import { uploadFile } from '../../../services/messageService';
import CommunityNavBar from './communityNavBar';

const uploader = Uploader({ apiKey: 'public_223k28T4HR7pgyJRnMLX4QntHQxQ' });
const uploaderOptions = {
  multi: false,
  styles: {
    colors: {
      primary: '#4A90E2',
    },
  },
};

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
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

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

  const { handleBulletinBoardTabClick, handleInvitesTabClick, handleStatisticsClick } =
    useCommunityTabsHeader();
  const { user, socket } = useUserContext();

  const [chatName, setChatName] = useState(community?.groupChat?.name || '');

  useEffect(() => {
    if (!currentCommunity || !user || !socket) return undefined;

    socket.emit('joinCommunity', currentCommunity._id.toString(), user.username);
    joinCommunity(currentCommunity._id.toString(), user.username);

    return () => {
      socket.emit('leaveCommunity', currentCommunity._id.toString(), user.username);
    };
  }, [currentCommunity, user, socket]);

  useEffect(() => {
    if (community?.groupChat?.name) {
      setChatName(community.groupChat.name);
    }
  }, [community]);

  useEffect(() => {
    if (!socket || !currentCommunity) {
      return undefined;
    }

    const updateOnlineUsers = async () => {
      const data = await getOnlineUsersForCommunity(currentCommunity._id.toString());
      setOnlineUsers(data.onlineUsers);
    };

    socket.on('onlineUsersUpdate', updateOnlineUsers);
    return () => {
      socket.off('onlineUsersUpdate', updateOnlineUsers);
    };
  }, [socket, currentCommunity]);

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

  const handleFileUpload = async (url: string, username: string) => {
    try {
      const res = await uploadFile({ fileUrl: url, username });
      setNewMessage(prev => `${prev}${res}`);
    } catch (err) {
      throw Error('Error uploading file message');
    }
  };

  if (!currentCommunity || !community) {
    return <div>Loading...</div>;
  }

  return (
    <div id='community-page'>
      <CommunityNavBar />
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
        <div id='community-questions' style={{ marginBottom: 20 }}>
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

        <div className='online-users'>
          <strong>Online Users:</strong>
          <ul>
            {onlineUsers.map((username, index) => (
              <li key={index}>{username}</li>
            ))}
          </ul>
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
                <UploadButton
                  uploader={uploader}
                  options={uploaderOptions}
                  onComplete={files => {
                    files.forEach(file => {
                      handleFileUpload(file.fileUrl, user.username);
                    });
                  }}>
                  {({ onClick }) => (
                    <button className='custom-button' onClick={onClick}>
                      Upload File
                    </button>
                  )}
                </UploadButton>
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
                <div style={{ height: '300px', overflowY: 'auto' }}>
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
