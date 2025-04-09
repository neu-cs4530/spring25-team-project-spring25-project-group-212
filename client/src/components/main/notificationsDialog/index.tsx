import { Box, Button, Flex, Heading, Spinner, Text, VStack } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../../../hooks/useNotifications';
import { clearUserNotifications } from '../../../services/notificationService';
import useUserContext from '../../../hooks/useUserContext';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { notifications, loading, error, refetchNotifications } = useNotifications();

  const handleNotificationClick = (questionId: string) => {
    navigate(`/question/${questionId}`);
  };

  const handleClearNotifications = async () => {
    try {
      if (!user?.username) return;
      await clearUserNotifications(user.username);
      refetchNotifications();
    } catch (err) {
      throw new Error(
        `Failed to clear notifications: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
    }
  };

  if (loading) {
    return (
      <Box mt={5} pt={4} borderTop='1px solid' borderColor='gray.200'>
        <Flex justify='space-between' align='center' mb={3}>
          <Heading size='md'>Notifications</Heading>
        </Flex>
        <VStack align='start'>
          <Spinner size='sm' />
          <Text>Loading notifications...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={5} pt={4} borderTop='1px solid' borderColor='gray.200'>
        <Flex justify='space-between' align='center' mb={3}>
          <Heading size='md'>Notifications</Heading>
        </Flex>
        <Text color='red.500'>Error: {error}</Text>
      </Box>
    );
  }

  return (
    <Box borderTop='1px solid' borderColor='gray.200'>
      <Flex justifyContent='space-between' alignItems='center'>
        <Heading size='md' ml='3'>
          Notifications
        </Heading>
        <Button
          size='sm'
          variant='ghost'
          colorScheme='gray'
          onClick={handleClearNotifications}
          disabled={notifications.length === 0}>
          Clear
        </Button>
      </Flex>
      <Box maxH='30vh' overflowY='auto'>
        {notifications.length === 0 ? (
          <Flex justify='center'>
            <Box p={4} borderWidth='1px' borderRadius='md'>
              <Text>No notifications</Text>
            </Box>
          </Flex>
        ) : (
          <Box display='flex' flexDirection='column' gap='8px'>
            {notifications.map(notification => (
              <Box
                key={notification._id.toString()}
                p={3}
                mx={1}
                borderWidth='1px'
                borderRadius='md'
                bg={!notification.read ? 'blue.50' : 'white'}
                borderColor={!notification.read ? 'blue.200' : 'gray.100'}
                cursor='pointer'
                _hover={{
                  bg: !notification.read ? 'blue.100' : 'gray.50',
                  borderColor: 'blue.300',
                }}
                onClick={() => handleNotificationClick(notification.questionId._id.toString())}
                tabIndex={0}
                role='button'
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleNotificationClick(notification.questionId._id.toString());
                  }
                }}>
                <Text fontSize='sm'>
                  <strong>{notification.answeredBy}</strong> answered your question &quot;
                  {notification.questionId.title}&quot;
                </Text>
                <Text fontSize='xs' color='gray.500' mt={1}>
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </Text>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Notifications;
