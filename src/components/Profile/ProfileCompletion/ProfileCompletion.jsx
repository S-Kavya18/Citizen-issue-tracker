import React from 'react';
import styles from './ProfileCompletion.module.css';

const ProfileCompletion = ({ 
  profileCompletion, 
  isVolunteer, 
  onCompleteProfile,
  getFieldDisplayName 
}) => {
  if (!profileCompletion || profileCompletion.isComplete) {
    return null;
  }

  return (
    <div className={styles.completionAlert}>
      <div className={styles.alertContent}>
        <div className={styles.alertIcon}>
          ⚠️
        </div>
        <div className={styles.alertInfo}>
          <h3 className={styles.alertTitle}>
            Complete Your Profile
          </h3>
          <p className={styles.alertDescription}>
            {isVolunteer 
              ? 'Complete your profile to start receiving relevant community issues that match your skills and location.'
              : 'Complete your profile to enhance your community experience and get better issue recommendations.'
            }
          </p>
          <div className={styles.progressContainer}>
            <div className={styles.progressBadge}>
              {profileCompletion.completionPercentage}% Complete
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${profileCompletion.completionPercentage}%` }}
              />
            </div>
            <span className={styles.progressText}>
              {profileCompletion.filledFields}/{profileCompletion.totalFields} fields
            </span>
          </div>
          
          {profileCompletion.missingFields.length > 0 && (
            <div className={styles.missingFields}>
              <p className={styles.missingFieldsTitle}>
                Missing fields:
              </p>
              <div className={styles.fieldTags}>
                {profileCompletion.missingFields.map(field => (
                  <span key={field} className={styles.fieldTag}>
                    {getFieldDisplayName(field)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onCompleteProfile}
          className={styles.completeButton}
        >
          Complete Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileCompletion;