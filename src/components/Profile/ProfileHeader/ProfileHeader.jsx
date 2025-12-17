import React from 'react';
import styles from './ProfileHeader.module.css';

const ProfileHeader = ({ user }) => {
  if (!user) return null;

  const isVolunteer = user.role === 'volunteer';

  return (
    <div className={styles.profileHeader}>
      <div className={styles.headerContent}>
        <div className={styles.avatar}>
          {user.name ? user.name[0].toUpperCase() : 'U'}
        </div>
        <div className={styles.userInfo}>
          <h1 className={styles.userName}>
            {user.name || 'User'}
          </h1>
          <p className={styles.userEmail}>
            {user.email}
          </p>
          <div className={styles.userRole}>
            {isVolunteer ? '🤝 Volunteer' : '👤 Citizen'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;