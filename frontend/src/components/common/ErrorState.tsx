import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button';
import styles from './ErrorState.module.css';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = "We couldn't load this section.",
  onRetry,
}) => {
  return (
    <div className={`${styles.errorState} animate-fade-in`}>
      <div className={styles.icon}>
        <AlertCircle size={40} color="#ef4444" />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className={styles.retryBtn}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
