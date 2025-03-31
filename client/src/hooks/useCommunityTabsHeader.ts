import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PopulatedDatabaseCommunity } from '@fake-stack-overflow/shared';
import { getCommunityById } from '../services/communityService';

const useCommunityTabsHeader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<PopulatedDatabaseCommunity | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!id) {
      setError('Could not get community ID');
      return;
    }

    const fetchChatFromId = async () => {
      try {
        const communityFromId = await getCommunityById(id);
        if (communityFromId) {
          setCommunity(communityFromId);
        } else {
          setError('Could not find community from ID');
        }
      } catch (err) {
        setError('Could not find community from ID');
      }
    };

    fetchChatFromId();
  }, [id]);

  const handleQuestionsAndChatTabClick = async () => {
    navigate(`/community/${id}`);
  };

  const handleBulletinBoardTabClick = async () => {
    navigate(`/community/${id}/bulletinBoard`);
  };

  const handleInvitesTabClick = async () => {
    navigate(`/community/${id}/invites`);
  };

  const handleStatisticsClick = async () => {
    navigate(`/community/${id}/statistics`);
  };

  return {
    handleQuestionsAndChatTabClick,
    handleBulletinBoardTabClick,
    handleInvitesTabClick,
    handleStatisticsClick,
    community,
    error,
  };
};

export default useCommunityTabsHeader;
