import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Center, Box, Text } from '@chakra-ui/react';
import { SafeDatabaseUser } from '@fake-stack-overflow/shared';
import useCommunityInvitesPage from '../../../../hooks/useCommunityInvitesPage';
import UsersListHeader from '../../usersListPage/header';
import '../index.css';
import CommunityNavBar from '../communityNavBar';
import UserStack from '../../usersListPage/userStack';

const CommunityInvitesPage = () => {
  const { userList, setUserFilter, sendUserInvite } = useCommunityInvitesPage();
  const navigate = useNavigate();
  const [showNoUsersMessage, setShowNoUsersMessage] = useState(false);

  const handleUserCardViewClickHandler = (user: SafeDatabaseUser): void => {
    navigate(`/user/${user.username}`);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (userList.length === 0) {
        setShowNoUsersMessage(true);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [userList]);

  return (
    <div>
      {userList.length === 0 ? (
        <Center height='100vh'>
          {showNoUsersMessage ? (
            <Text fontSize='lg' color='gray.500'>
              No users to invite.
            </Text>
          ) : (
            <Spinner size='xl' />
          )}
        </Center>
      ) : (
        <div>
          <CommunityNavBar />
          <Box px={6} py={4}>
            <UsersListHeader userCount={userList.length} setUserFilter={setUserFilter} />
          </Box>
          <div>
            <UserStack
              users={userList}
              handleUserCardViewClickHandler={handleUserCardViewClickHandler}
              handleButtonClick={sendUserInvite}
              buttonText='Invite'
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityInvitesPage;
