import { useNavigate } from 'react-router-dom';
import { Spinner, Center } from '@chakra-ui/react';
import { SafeDatabaseUser } from '@fake-stack-overflow/shared';
import useCommunityInvitesPage from '../../../../hooks/useCommunityInvitesPage';
import UsersListHeader from '../../usersListPage/header';
import '../index.css';
import CommunityNavBar from '../communityNavBar';
import UserStack from '../../usersListPage/userStack';

const CommunityInvitesPage = () => {
  const { userList, setUserFilter, sendUserInvite } = useCommunityInvitesPage();
  const navigate = useNavigate();
  const handleUserCardViewClickHandler = (user: SafeDatabaseUser): void => {
    navigate(`/user/${user.username}`);
  };

  return (
    <div>
      {userList.length === 0 ? (
        <Center height='100vh'>
          <Spinner size='xl' />
        </Center>
      ) : (
        <div>
          <CommunityNavBar />
          <UsersListHeader userCount={userList.length} setUserFilter={setUserFilter} />
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
