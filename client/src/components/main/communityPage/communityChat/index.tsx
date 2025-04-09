import { useState, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { UploadButton } from 'react-uploader';
import { Spinner, Center, Box, Flex, Input, Button, Text, Badge } from '@chakra-ui/react';
import { Uploader } from 'uploader';
import { useLocation } from 'react-router-dom';
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

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isPreview = searchParams.get('preview') === 'true';

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
      if (community) {
        socket.emit('imageSent', community?._id.toString());
      }
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

  return (
    <>
      <CommunityNavBar />
      {!isPreview ? (
        <>
          <Box p={4}>
            <Box mb={4}>
              <Text fontWeight='bold' mb={2}>
                Online Users:
              </Text>
              <Box as='ul' m={0} p={0} style={{ listStyleType: 'none' }}>
                {onlineUsers.map((username, index) => (
                  <Box as='li' key={index} display='flex' alignItems='center' mb={1}>
                    <Box w='8px' h='8px' bg='green.500' borderRadius='full' mr={2} />
                    {username}
                  </Box>
                ))}
              </Box>
            </Box>

            <Box mb={4}>
              <Flex alignItems='center' gap={2}>
                <Input
                  className='custom-input'
                  type='text'
                  value={chatName}
                  onChange={e => setChatName(e.target.value)}
                  placeholder='Enter new chat name'
                />
                <Button className='custom-button' colorScheme='blue' onClick={handleRenameChat}>
                  Rename
                </Button>
              </Flex>
            </Box>

            <Text>
              <strong>Current Chat Name: </strong>
              <Badge colorScheme='blue'>{chatName}</Badge>
            </Text>
          </Box>

          <Box className='direct-message-container'>
            <Box id='community-chat' className='chat-container'>
              <Box className='chat-messages'>
                {communityChat?.messages && communityChat.messages.length > 0 ? (
                  [...communityChat.messages]
                    .slice()
                    .reverse()
                    .map(message => (
                      <MessageCard
                        key={String(message._id)}
                        message={message}
                        totalUsers={currentCommunity?.members.length || 1}
                      />
                    ))
                ) : (
                  <Box>No messages yet.</Box>
                )}
              </Box>

              {typingUsers.length > 0 && (
                <Box className='typing-indicator'>
                  {typingUsers.length === 1 && `${typingUsers[0]} is typing...`}
                  {typingUsers.length === 2 &&
                    `${typingUsers[0]} and ${typingUsers[1]} are typing...`}
                  {typingUsers.length > 2 && 'Many people are typing...'}
                </Box>
              )}

              <Box className='message-input-container'>
                <Flex className='message-input' gap={2}>
                  <Input
                    className='custom-input'
                    type='text'
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder='Type a message...'
                  />
                  <Button
                    className='emoji-button'
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    😀
                  </Button>
                  <UploadButton
                    uploader={uploader}
                    options={uploaderOptions}
                    onComplete={files => {
                      files.forEach(file => {
                        handleFileUpload(file.fileUrl, user.username);
                      });
                    }}>
                    {({ onClick }) => (
                      <Button className='custom-button' onClick={onClick}>
                        Upload File
                      </Button>
                    )}
                  </UploadButton>
                  <Button className='custom-button' colorScheme='blue' onClick={handleSendMessage}>
                    Send
                  </Button>
                  <Button
                    type='button'
                    className={`markdown-toggle ${useMarkdown ? 'active' : ''}`}
                    onClick={() => setUseMarkdown(!useMarkdown)}
                    title={useMarkdown ? 'Disable Markdown' : 'Enable Markdown'}>
                    MD
                  </Button>
                </Flex>

                {showEmojiPicker && (
                  <Box style={{ height: '300px', overflowY: 'auto' }}>
                    <EmojiPicker onEmojiClick={handleEmojiSelect} />
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </>
      ) : (
        <div>
          <strong>Join the community to send messages!</strong>
        </div>
      )}
    </>
  );
};

export default CommunityChat;
