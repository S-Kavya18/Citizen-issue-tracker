import React from 'react';
import styles from './Card.module.css';

const Card = ({ children, variant = 'default', className = '', ...props }) => {
  const cardClasses = [
    styles.card,
    variant !== 'default' && styles[variant],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`${styles.cardHeader} ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h2 className={`${styles.cardTitle} ${className}`}>
    {children}
  </h2>
);

const CardSubtitle = ({ children, className = '' }) => (
  <p className={`${styles.cardSubtitle} ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`${styles.cardContent} ${className}`}>
    {children}
  </div>
);

const CardActions = ({ children, className = '' }) => (
  <div className={`${styles.cardActions} ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Content = CardContent;
Card.Actions = CardActions;

export default Card;