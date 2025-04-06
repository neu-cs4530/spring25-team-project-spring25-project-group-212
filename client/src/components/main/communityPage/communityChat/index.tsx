import { useState, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { UploadButton } from 'react-uploader';
import { Spinner, Center } from '@chakra-ui/react';
import { Uploader } from 'uploader';
import useCommunityMessagingPage from '../../../../hooks/useCommunityMessagingPage';
import MessageCard from '../../messageCard';
import useUserContext from '../../../../hooks/useUserContext';
import { getOnlineUsersForCommunity, joinCommunity } from '../../../../services/communityService';
import useCommunityNameAboutRules from '../../../../hooks/useCommunityNameAboutRules';
import { renameChat } from '../../../../services/chatService';
import '../index.css';
import { uploadFile } from '../../../../services/messageService';
import CommunityNavBar from '../communityNavBar';

const uploader = Uploader({ apiKey: 'public_223k28T4HR7pgyJRnMLX4QntHQxQ' });
const uploaderOptions = {
  multi: false,
  styles: {
    colors: {
      primary: '#4A90E2',
    },
  },
};

const CommunityChat = () => {
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

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const { community } = useCommunityNameAboutRules();

  const { user, socket } = useUserContext();

  const [chatName, setChatName] = useState(community?.groupChat?.name || '');

  useEffect(() => {
    if (!currentCommunity || !user || !socket) return undefined;

    const userHasJoinedCommunity = currentCommunity.members.includes(user.username);

    if (userHasJoinedCommunity) {
      socket.emit('joinCommunity', currentCommunity._id.toString(), user.username);
      joinCommunity(currentCommunity._id.toString(), user.username);
    }

    return () => {
      if (userHasJoinedCommunity) {
        socket.emit('leaveCommunity', currentCommunity._id.toString(), user.username);
      }
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
    return (
      <Center height='100vh'>
        <Spinner size='xl' />
      </Center>
    );
  }
  const userHasJoinedCommunity = currentCommunity.members.includes(user.username);

  return (
    <>
      <CommunityNavBar />
      {userHasJoinedCommunity && (
        <>
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
        </>
      )}
    </>
  );
};

export default CommunityChat;
