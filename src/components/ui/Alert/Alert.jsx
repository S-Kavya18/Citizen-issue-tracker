import React from 'react';
import styles from './Alert.module.css';

const Alert = ({ children, variant = 'info', icon, className = '' }) => {
  const alertClasses = [
    styles.alert,
    styles[variant],
    className
  ].filter(Boolean).join(' ');

  const getDefaultIcon = () => {
    switch (variant) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={alertClasses}>
      <div className={styles.alertIcon}>
        {icon || getDefaultIcon()}
      </div>
      <div className={styles.alertContent}>
        {children}
      </div>
    </div>
  );
};

export default Alert;