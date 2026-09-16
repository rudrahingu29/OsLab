import React from 'react';
import Button from './Button';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className={`${styles.emptyState} animate-fade-in`}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction} className={styles.actionBtn}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
