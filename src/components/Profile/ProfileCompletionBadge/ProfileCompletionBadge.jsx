import React from 'react';
import styles from './ProfileCompletionBadge.module.css';

const ProfileCompletionBadge = ({ 
  profileCompletion, 
  isVolunteer 
}) => {
  if (!profileCompletion || !profileCompletion.isComplete) {
    return null;
  }

  return (
    <div className={styles.completionBadge}>
      <div className={styles.badgeContent}>
        <div className={styles.badgeIcon}>
          ✓
        </div>
        <div className={styles.badgeInfo}>
          <h3 className={styles.badgeTitle}>
            Profile Complete! 
            <span className={styles.celebrationIcon}>🎉</span>
          </h3>
          <p className={styles.badgeDescription}>
            {isVolunteer 
              ? 'Excellent! Your complete profile helps us match you with relevant community issues and volunteer opportunities.'
              : 'Great! Your complete profile enhances your community experience and helps us provide better recommendations.'
            }
          </p>
          <div className={styles.completionStats}>
            <div className={styles.completionPercentage}>
              {profileCompletion.completionPercentage}% Complete
            </div>
            <span className={styles.completionText}>
              All {profileCompletion.totalFields} required fields filled
            </span>
            <div className={styles.profileCompleteTag}>
              ✓ Verified Complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionBadge;