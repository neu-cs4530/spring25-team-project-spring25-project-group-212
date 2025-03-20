import React from 'react';
import './index.css';

const Notifications = () => (
  <div className='notifications-container'>
    <h3 className='notifications-heading'>Notifications</h3>
    <div className='notifications-scroll'>
      <div className='notification-item'>
        <p>New message from John Doe</p>
        <span className='notification-time'>2m ago</span>
      </div>
      <div className='notification-item'>
        <p>Your question received 3 new answers</p>
        <span className='notification-time'>15m ago</span>
      </div>
      <div className='notification-item'>
        <p>New community post in Game Development</p>
        <span className='notification-time'>1h ago</span>
      </div>
      <div className='notification-item'>
        <p>Your answer was marked as accepted</p>
        <span className='notification-time'>2h ago</span>
      </div>
      <div className='notification-item'>
        <p>New follower: Jane Smith</p>
        <span className='notification-time'>3h ago</span>
      </div>
      <div className='notification-item'>
        <p>New follower: Jane Smith</p>
        <span className='notification-time'>3h ago</span>
      </div>
    </div>
  </div>
);

export default Notifications;
