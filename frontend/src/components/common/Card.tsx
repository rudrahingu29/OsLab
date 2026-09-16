import React, { type ReactNode, type CSSProperties } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'interactive';
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'default', 
  className = '', 
  onClick,
  style
}) => {
  return (
    <div 
      className={`${styles.card} ${styles[variant]} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};

export default Card;
