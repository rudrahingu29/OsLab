import React, { type ButtonHTMLAttributes, type CSSProperties } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  children,
  style,
  ...props
}) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${isLoading ? styles.loading : ''} ${className}`}
      disabled={disabled || isLoading}
      style={style}
      {...props}
    >
      {isLoading && <span className={styles.spinner} />}
      {!isLoading && leftIcon && <span className={styles.icon}>{leftIcon}</span>}
      <span className={styles.content}>{children}</span>
      {!isLoading && rightIcon && <span className={styles.icon}>{rightIcon}</span>}
    </button>
  );
};

export default Button;
