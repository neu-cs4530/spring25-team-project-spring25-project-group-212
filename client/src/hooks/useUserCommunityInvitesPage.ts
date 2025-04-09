import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PopulatedDatabaseCommunity } from '@fake-stack-overflow/shared';
import useUserContext from './useUserContext';
import { getCommunities, removeInvite, joinCommunity } from '../services/communityService';

const useUserCommunityInvitesPage = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [communitiesInvitedTo, setCommunitiesInvitedTo] = useState<PopulatedDatabaseCommunity[]>(
    [],
  );

  useEffect(() => {
    if (!user) return;
    const getCommunitiesInvitedTo = async () => {
      const allCommunities = await getCommunities();
      const filtered = (allCommunities || []).filter(
        c => Array.isArray(c.pendingInvites) && c.pendingInvites.includes(user.username),
      );
      setCommunitiesInvitedTo(filtered);
    };

    getCommunitiesInvitedTo();
  }, [user]);

  const handleAcceptInvite = async (communityId: string) => {
    const joinedCommunity = await joinCommunity(communityId, user.username);
    await removeInvite(communityId, user.username);
    setCommunitiesInvitedTo(
      communitiesInvitedTo.filter(c => c._id.toString() !== joinedCommunity._id.toString()),
    );
    navigate(`/community/${communityId}`);
  };

  const handleDeclineInvite = async (communityId: string) => {
    setCommunitiesInvitedTo(communitiesInvitedTo.filter(c => c._id.toString() !== communityId));
    await removeInvite(communityId, user.username);
  };

  return { handleAcceptInvite, handleDeclineInvite, communitiesInvitedTo };
};

export default useUserCommunityInvitesPage;
