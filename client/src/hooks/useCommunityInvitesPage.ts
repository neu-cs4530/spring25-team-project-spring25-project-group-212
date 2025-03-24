import {
  PopulatedDatabaseCommunity,
  SafeDatabaseUser,
  UserUpdatePayload,
} from '@fake-stack-overflow/shared';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useUserContext from './useUserContext';
import { getUsers } from '../services/userService';
import { getCommunityById, inviteUserToCommunity } from '../services/communityService';

const useCommunityInvitesPage = () => {
  const { id } = useParams();
  const [currentCommunity, setCurrentCommunity] = useState<PopulatedDatabaseCommunity | null>(null);
  const { socket } = useUserContext();
  const [userFilter, setUserFilter] = useState<string>('');
  const [userList, setUserList] = useState<SafeDatabaseUser[]>([]);
  const [err, setErr] = useState('');
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) {
          throw new Error('Unable to get community ID');
        }
        const community = await getCommunityById(id);
        const communityMembers = community.members;
        const res = await getUsers();
        // gets all users who are not in this community AND who have not already been sent an invite
        const usersNotInCommunity = res
          .filter(u => !communityMembers.includes(u.username))
          .filter(u => !community.pendingInvites.includes(u.username));
        setUserList(usersNotInCommunity || []);
        setCurrentCommunity(community);
      } catch (error) {
        setErr((error as Error).message);
      }
    };

    /**
     * Removes a user from the userList using a filter
     * @param prevUserList the list of users
     * @param user the user to remove
     * @returns a list without the given user
     */
    const removeUserFromList = (prevUserList: SafeDatabaseUser[], user: SafeDatabaseUser) =>
      prevUserList.filter(otherUser => user.username !== otherUser.username);

    /**
     * Adds a user to the userList, if not present. Otherwise updates the user.
     * @param prevUserList the list of users
     * @param user the user to add
     * @returns a list with the user added, or updated if present.
     */
    const addUserToList = (prevUserList: SafeDatabaseUser[], user: SafeDatabaseUser) => {
      const userExists = prevUserList.some(otherUser => otherUser.username === user.username);

      if (userExists) {
        // Update the existing user
        return prevUserList.map(otherUser =>
          otherUser.username === user.username ? user : otherUser,
        );
      }

      return [user, ...prevUserList];
    };

    /**
     * Function to handle user updates from the socket.
     *
     * @param user - the updated user object.
     */
    const handleModifiedUserUpdate = (userUpdate: UserUpdatePayload) => {
      setUserList(prevUserList => {
        switch (userUpdate.type) {
          case 'created':
          case 'updated':
            return addUserToList(prevUserList, userUpdate.user);
          case 'deleted':
            return removeUserFromList(prevUserList, userUpdate.user);
          default:
            throw new Error('Invalid user update type');
        }
      });
    };

    fetchData();

    socket.on('userUpdate', handleModifiedUserUpdate);

    return () => {
      socket.off('userUpdate', handleModifiedUserUpdate);
    };
  }, [id, socket]);

  const sendUserInvite = async (username: string) => {
    if (!id) return;
    try {
      const res = await inviteUserToCommunity(id, username);
      setCurrentCommunity(res);
      const prevUserList = userList;
      setUserList(prevUserList.filter(user => user.username !== username));
    } catch (error) {
      setErr((error as Error).message);
    }
  };

  const filteredUserlist = userList.filter(user => user.username.includes(userFilter));
  return { userList: filteredUserlist, setUserFilter, err, currentCommunity, sendUserInvite };
};

export default useCommunityInvitesPage;
