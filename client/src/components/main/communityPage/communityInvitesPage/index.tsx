import { useNavigate } from 'react-router-dom';
import { SafeDatabaseUser } from '@fake-stack-overflow/shared';
import useCommunityInvitesPage from '../../../../hooks/useCommunityInvitesPage';
import UserCardView from '../../usersListPage/userCard';
import UsersListHeader from '../../usersListPage/header';
import '../index.css';
import CommunityNavBar from '../communityNavBar';

const CommunityInvitesPage = () => {
  const { userList, setUserFilter, sendUserInvite } = useCommunityInvitesPage();
  const navigate = useNavigate();
  const handleUserCardViewClickHandler = (user: SafeDatabaseUser): void => {
    navigate(`/user/${user.username}`);
  };

  return (
    <div>
      <CommunityNavBar />
      {userList.length === 0 ? (
        <strong>No Users to Invite</strong>
      ) : (
        <div>
          <UsersListHeader userCount={userList.length} setUserFilter={setUserFilter} />
          <div>
            {userList.map(u => (
              <>
                <UserCardView
                  user={u}
                  handleUserCardViewClickHandler={handleUserCardViewClickHandler}
                  key={u.username}
                />
                <button className='login-button' onClick={() => sendUserInvite(u.username)}>
                  Send Invite
                </button>
              </>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityInvitesPage;
