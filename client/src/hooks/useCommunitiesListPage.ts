import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PopulatedDatabaseCommunity } from '@fake-stack-overflow/shared';
import { getCommunities } from '../services/communityService';
import useUserContext from './useUserContext';

const useCommunitiesListPage = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<PopulatedDatabaseCommunity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user, socket } = useUserContext();

  const sortCommunitiesBy = async (category: 'members' | 'content') => {
    try {
      const communitiesList = await getCommunities();
      let communitiesListSorted;
      if (category === 'members') {
        communitiesListSorted = communitiesList.sort((a, b) => b.members.length - a.members.length);
      } else {
        // content
        communitiesListSorted = communitiesList.sort((a, b) => {
          const countContentA =
            a.questions.length +
            a.questions.reduce((sum, current) => sum + current.answers.length, 0);
          const countContentB =
            b.questions.length +
            b.questions.reduce((sum, current) => sum + current.answers.length, 0);
          return countContentB - countContentA;
        });
      }
      setCommunities(communitiesListSorted);
    } catch (sortCommunitiesByError) {
      setError(`Error fetching communities: ${sortCommunitiesByError}`);
    }
  };

  const handleJoin = (communityId: string) => {
    if (user && socket) {
      socket.emit('joinCommunity', communityId, user.username);
    }
    navigate(`/community/${communityId}`);
  };

  const handlePreviewCommunity = (communityId: string) => {
    navigate(`/community/${communityId}`);
  };

  const handleCreateCommunity = async () => {
    navigate(`/new/community`);
  };

  useEffect(() => {
    sortCommunitiesBy('members');
  }, []);

  return {
    communities,
    error,
    handleJoin,
    handleCreateCommunity,
    handlePreviewCommunity,
    sortCommunitiesBy,
  };
};

export default useCommunitiesListPage;
