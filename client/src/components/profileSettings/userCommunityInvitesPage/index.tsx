import useUserCommunityInvitesPage from '../../../hooks/useUserCommunityInvitesPage';
import '../index.css';
import CommunityInviteCard from './communityInviteCard';

const UserCommunityInvitesPage = () => {
  const { communitiesInvitedTo, handleAcceptInvite, handleDeclineInvite } =
    useUserCommunityInvitesPage();

  return (
    <div>
      {communitiesInvitedTo.length === 0 ? (
        <div>No Invites</div>
      ) : (
        <div>
          {communitiesInvitedTo.map(c => (
            <CommunityInviteCard
              key={c._id.toString()}
              handleAcceptInvite={handleAcceptInvite}
              handleDeclineInvite={handleDeclineInvite}
              community={c}></CommunityInviteCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserCommunityInvitesPage;
