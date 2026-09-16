import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  showValue?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showValue = false,
  className = '',
  size = 'md',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={`${styles.track} ${styles[size]}`}>
        <div 
          className={styles.bar} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <span className={styles.value}>
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
