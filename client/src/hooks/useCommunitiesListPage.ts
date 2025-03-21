import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PopulatedDatabaseCommunity } from '@fake-stack-overflow/shared';
import { getCommunities } from '../services/communityService';

const useCommunitiesListPage = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<PopulatedDatabaseCommunity[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunities = async () => {
    try {
      const communitiesList = await getCommunities();
      setCommunities(communitiesList);
    } catch (getCommunitiesError) {
      setError('Error fetching communities');
    }
  };

  const handleJoin = (communityId: string) => {
    navigate(`/community/${communityId}`);
  };

  const handleCreateCommunity = async () => {
    navigate(`/new/community`);
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  return {
    communities,
    error,
    handleJoin,
    fetchCommunities,
    handleCreateCommunity,
  };
};

export default useCommunitiesListPage;
