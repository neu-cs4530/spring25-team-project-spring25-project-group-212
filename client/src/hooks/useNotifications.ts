import { useEffect, useState } from 'react';
import { PopulatedDatabaseNotification } from '../types/types';
import { getUserNotifications } from '../services/notificationService';
import useUserContext from './useUserContext';

/**
 * Custom hook for managing notifications.
 *
 * @returns notifications - The list of notifications for the current user
 * @returns loading - Whether the notifications are being loaded
 * @returns error - Any error that occurred while fetching notifications
 */
const useNotifications = () => {
  const { user } = useUserContext();
  const [notifications, setNotifications] = useState<PopulatedDatabaseNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!user?.username) {
          setError('User not logged in');
          return;
        }
        const userNotifications = await getUserNotifications(user.username);
        setNotifications(userNotifications);
      } catch (err) {
        setError('Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.username]);

  return { notifications, loading, error };
};

export default useNotifications;
