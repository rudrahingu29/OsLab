import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  color?: string;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary', 
  color, 
  className = '' 
}) => {
  const inlineStyle = color ? { backgroundColor: color, color: '#ffffff' } : undefined;
  return (
    <span 
      className={`${styles.badge} ${styles[variant]} ${className}`} 
      style={inlineStyle}
    >
      {children}
    </span>
  );
};

export default Badge;
