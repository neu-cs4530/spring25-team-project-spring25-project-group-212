import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Editor, getSnapshot, loadSnapshot } from 'tldraw';
import { PopulatedDatabaseCommunity } from '@fake-stack-overflow/shared';
import { getCommunityById } from '../services/communityService';

const useBulletinBoardPage = () => {
  const { id } = useParams();
  const roomId = crypto.randomUUID();
  const [showCheckMark, setShowCheckMark] = useState(false);
  const [community, setCommunity] = useState<PopulatedDatabaseCommunity>();

  const handleBulletinBoardSave = useCallback((editor: Editor) => {
    const { document } = getSnapshot(editor.store);
    localStorage.setItem('snapshot', JSON.stringify({ document }));
  }, []);

  const handleBulletinBoardLoad = useCallback((editor: Editor) => {
    const snapshot = localStorage.getItem('snapshot');
    if (!snapshot) return;
    loadSnapshot(editor.store, JSON.parse(snapshot));
  }, []);

  const [bulletinBoardError, setBulletinBoardError] = useState('');

  useEffect(() => {
    const communityExistsCheck = async () => {
      if (!id) {
        setBulletinBoardError('Error retrieving community');
        return () => {};
      }
      try {
        const retrievedCommunity = await getCommunityById(id);
        setCommunity(retrievedCommunity);
        setBulletinBoardError('');
      } catch (error) {
        setBulletinBoardError('Error retrieving community');
      }
      return undefined;
    };

    communityExistsCheck();

    if (showCheckMark) {
      const timeout = setTimeout(() => {
        setShowCheckMark(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }

    return () => {};
  }, [id, showCheckMark]);

  return {
    handleBulletinBoardLoad,
    handleBulletinBoardSave,
    showCheckMark,
    setShowCheckMark,
    roomId,
    bulletinBoardError,
    community,
  };
};

export default useBulletinBoardPage;
