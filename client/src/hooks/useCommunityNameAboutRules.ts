import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PopulatedDatabaseCommunity } from '@fake-stack-overflow/shared';
import { getCommunityById, updateCommunityNameAboutRules } from '../services/communityService';
import useUserContext from './useUserContext';

const useCommunityNameAboutRules = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const [community, setCommunity] = useState<PopulatedDatabaseCommunity | null>();
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAbout, setNewAbout] = useState('');
  const [newRules, setNewRules] = useState('');
  const [err, setErr] = useState('');
  const [canEditNameAboutRules, setCanEditNameAboutRules] = useState(false);

  useEffect(() => {
    const communityExistsCheck = async () => {
      if (!id) {
        setErr('Error retrieving community');
        return undefined;
      }
      try {
        await getCommunityById(id);
        setErr('');
      } catch (error) {
        setErr('Error retrieving community');
      }
      return undefined;
    };

    communityExistsCheck();
    if (!id) {
      setErr('Error retrieving community');
      return;
    }

    const fetchCommunityAndSetCanEdit = async () => {
      try {
        const communityFromId = await getCommunityById(id);
        if (communityFromId) {
          setCommunity(communityFromId);
          if (communityFromId.admins.includes(user.username)) {
            setCanEditNameAboutRules(true);
          }
        } else {
          setErr('Community not found');
        }
      } catch (error) {
        setErr('Community not found');
      }
    };

    fetchCommunityAndSetCanEdit();
  }, [id, user.username]);

  const handleEditNameAboutRules = async () => {
    if (!community) {
      return;
    }

    if (!community.admins.includes(user.username)) {
      return;
    }

    try {
      const updatedCommunity = await updateCommunityNameAboutRules(
        community._id.toString(),
        newName,
        newAbout,
        newRules,
      );
      await new Promise(resolve => {
        setCommunity(updatedCommunity);
        setEditMode(false);
        resolve(null);
      });
      setErr('');
    } catch (error) {
      setErr('Could not edit name, about, and/or rules');
    }
  };

  return {
    community,
    editMode,
    setEditMode,
    newName,
    setNewName,
    newAbout,
    setNewAbout,
    newRules,
    setNewRules,
    communityExistsError: err,
    handleEditNameAboutRules,
    canEditNameAboutRules,
  };
};

export default useCommunityNameAboutRules;
