import { PopulatedDatabaseCommunity } from '@fake-stack-overflow/shared';
import '../../index.css';

const CommunityInviteCard = ({
  community,
  handleAcceptInvite,
  handleDeclineInvite,
}: {
  community: PopulatedDatabaseCommunity;
  handleAcceptInvite: (communityId: string) => void;
  handleDeclineInvite: (communityId: string) => void;
}) => (
  <div>
    <strong>{community.name}</strong>
    <button className='login-button' onClick={() => handleAcceptInvite(community._id.toString())}>
      Accept Invite
    </button>
    <button className='delete-button' onClick={() => handleDeclineInvite(community._id.toString())}>
      Decline Invite
    </button>
  </div>
);

export default CommunityInviteCard;
