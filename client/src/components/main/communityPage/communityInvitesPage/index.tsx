import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Spinner, Center, Box, Text } from '@chakra-ui/react';
import { SafeDatabaseUser } from '@fake-stack-overflow/shared';
import useCommunityInvitesPage from '../../../../hooks/useCommunityInvitesPage';
import UsersListHeader from '../../usersListPage/header';
import '../index.css';
import CommunityNavBar from '../communityNavBar';
import UserStack from '../../usersListPage/userStack';
import useUserContext from '../../../../hooks/useUserContext';

const CommunityInvitesPage = () => {
  const { userList, setUserFilter, sendUserInvite, currentCommunity } = useCommunityInvitesPage();
  const navigate = useNavigate();
  const [showNoUsersMessage, setShowNoUsersMessage] = useState(false);
  const { user: currentUser, socket } = useUserContext();

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

  useEffect(() => {
    if (!currentCommunity) {
      return;
    }
    socket.emit('onlineUser', currentCommunity?._id.toString(), currentUser.username);
  }, [currentCommunity, socket, currentUser.username]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isPreview = searchParams.get('preview') === 'true';

  return (
    <div>
      {!isPreview ? (
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
      ) : (
        <div>
          <CommunityNavBar />
          <strong>Join the community to send invites to your friends!</strong>
        </div>
      )}
    </div>
  );
};

export default CommunityInvitesPage;
