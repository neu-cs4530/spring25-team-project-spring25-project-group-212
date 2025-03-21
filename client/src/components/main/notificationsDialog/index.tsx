import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../../../hooks/useNotifications';
import { clearUserNotifications } from '../../../services/notificationService';
import useUserContext from '../../../hooks/useUserContext';
import './index.css';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { notifications, loading, error, refetchNotifications } = useNotifications();

  const handleNotificationClick = (questionId: string) => {
    navigate(`/question/${questionId}`);
  };

  const handleClearNotifications = async () => {
    try {
      if (!user?.username) return;
      await clearUserNotifications(user.username);
      refetchNotifications();
    } catch (err) {
      throw new Error(
        `Failed to clear notifications: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
    }
  };

  if (loading) {
    return (
      <div className='notifications-container'>
        <div className='notifications-header'>
          <h3 className='notifications-heading'>Notifications</h3>
        </div>
        <div className='notifications-scroll'>
          <div className='notification-item'>
            <p>Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='notifications-container'>
        <div className='notifications-header'>
          <h3 className='notifications-heading'>Notifications</h3>
        </div>
        <div className='notifications-scroll'>
          <div className='notification-item'>
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='notifications-container'>
      <div className='notifications-header'>
        <h3 className='notifications-heading'>Notifications</h3>
        {notifications.length > 0 && (
          <button onClick={handleClearNotifications} className='clear-notifications'>
            Clear
          </button>
        )}
      </div>
      <div className='notifications-scroll'>
        {notifications.length === 0 ? (
          <div className='notification-item'>
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification._id.toString()}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification.questionId._id.toString())}
              role='button'
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNotificationClick(notification.questionId._id.toString());
                }
              }}>
              <p>
                <strong>{notification.answeredBy}</strong>
                {` answered your question "${notification.questionId.title}"`}
              </p>
              <span className='notification-time'>
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
