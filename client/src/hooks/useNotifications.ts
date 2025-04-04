import { useEffect, useState, useCallback } from 'react';
import { NotificationUpdatePayload, PopulatedDatabaseNotification } from '../types/types';
import { getUserNotifications } from '../services/notificationService';
import useUserContext from './useUserContext';
import bellSound from '../assets/bells.wav';

const bell = new Audio(bellSound);

/**
 * Custom hook for managing notifications.
 *
 * @returns notifications - The list of notifications for the current user
 * @returns loading - Whether the notifications are being loaded
 * @returns error - Any error that occurred while fetching notifications
 * @returns refetchNotifications - Function to manually refetch notifications
 */
const useNotifications = () => {
  const { user, socket } = useUserContext();
  const [notifications, setNotifications] = useState<PopulatedDatabaseNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
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
  }, [user?.username]);

  // Initial fetch of notifications
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Listen for real-time notification updates
  useEffect(() => {
    if (!socket) return undefined;

    const handleNotificationUpdate = (data: NotificationUpdatePayload) => {
      // Only update if the notification is for the current user
      if (data.notification.recipient === user?.username) {
        bell.play().catch(err => {
          console.warn('Bell sound could not play:', err);
        });
        // Refetch all notifications to get the populated data
        fetchNotifications();
      }
    };

    socket.on('notificationUpdate', handleNotificationUpdate);

    return () => {
      socket.off('notificationUpdate', handleNotificationUpdate);
    };
  }, [socket, user?.username, fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    refetchNotifications: fetchNotifications,
  };
};
export default useNotifications;
