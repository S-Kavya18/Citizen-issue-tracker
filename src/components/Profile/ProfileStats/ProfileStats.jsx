import React from 'react';
import styles from './ProfileStats.module.css';

const ProfileStats = ({ user, userStats }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isVolunteer = user?.role === 'volunteer';

  return (
    <div className={styles.statsContainer}>
      {/* User Statistics */}
      {userStats ? (
        <div className={styles.statsCard}>
          <h3 className={styles.statsTitle}>
            {isVolunteer ? 'Volunteer Statistics' : 'Activity Statistics'}
          </h3>
          
          {isVolunteer ? (
            <>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Issues Resolved</span>
                <span className={styles.statValue}>{userStats.issuesResolved || userStats.resolved_issues || 0}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Active Issues</span>
                <span className={styles.statValue}>{userStats.activeIssues || userStats.active_issues || 0}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Community Rating</span>
                <span className={styles.statValue}>
                  {userStats.rating ? `${userStats.rating}/5.0` : 'Not rated yet'}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Total Contributions</span>
                <span className={styles.statValue}>{userStats.totalContributions || (userStats.resolved_issues || 0) + (userStats.active_issues || 0)}</span>
              </div>
            </>
          ) : (
            <>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Issues Submitted</span>
                <span className={styles.statValue}>{userStats.issuesSubmitted || userStats.reported_issues || 0}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Issues Resolved</span>
                <span className={styles.statValue}>{userStats.issuesResolved || userStats.resolved_issues || 0}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Feedback Given</span>
                <span className={styles.statValue}>{userStats.feedbackGiven || userStats.feedback_given || 0}</span>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className={styles.statsCard}>
          <div className={styles.loadingStats}>
            Loading statistics...
          </div>
        </div>
      )}

      {/* Account Information */}
      <div className={styles.accountInfo}>
        <h3 className={styles.accountTitle}>Account Information</h3>
        
        <div className={styles.accountDetail}>
          <span className={styles.accountLabel}>Member Since</span>
          <span className={styles.accountValue}>
            {formatDate(user?.created_at)}
          </span>
        </div>
        
        <div className={styles.accountDetail}>
          <span className={styles.accountLabel}>Last Updated</span>
          <span className={styles.accountValue}>
            {formatDate(user?.last_login || user?.updated_at)}
          </span>
        </div>
        
        <div className={styles.accountDetail}>
          <span className={styles.accountLabel}>Account Status</span>
          <span className={styles.accountValue}>Active</span>
        </div>
        
        {isVolunteer && (
          <div className={styles.accountDetail}>
            <span className={styles.accountLabel}>Verification Status</span>
            <span className={styles.accountValue}>
              {user?.email_verified ? 'Verified' : 'Pending Verification'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileStats;