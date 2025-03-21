import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import useNotifications from '../../../hooks/useNotifications';
import './index.css';

const Notifications = () => {
  const { notifications, loading, error } = useNotifications();

  if (loading) {
    return (
      <div className='notifications-container'>
        <h3 className='notifications-heading'>Notifications</h3>
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
        <h3 className='notifications-heading'>Notifications</h3>
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
      <h3 className='notifications-heading'>Notifications</h3>
      <div className='notifications-scroll'>
        {notifications.length === 0 ? (
          <div className='notification-item'>
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification._id.toString()}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}>
              <p>{`${notification.answeredBy} answered your question "${notification.questionId.title}"`}</p>
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
