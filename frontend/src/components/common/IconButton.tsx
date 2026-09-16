import React, { type ButtonHTMLAttributes } from 'react';
import styles from './IconButton.module.css';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  ariaLabel: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'secondary',
  size = 'md',
  ariaLabel,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`${styles.iconButton} ${styles[variant]} ${styles[size]} ${className}`}
      aria-label={ariaLabel}
      title={ariaLabel}
      {...props}
    >
      {icon}
    </button>
  );
};

export default IconButton;
