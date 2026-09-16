import React from 'react';
import { MiniOSIcon } from './MiniOSIcon';
import styles from './AppIcon.module.css';

interface AppIconProps {
  id: string;
  title: string;
  icon: string;
  onDoubleClick: () => void;
}

export const AppIcon: React.FC<AppIconProps> = ({ id, title, icon, onDoubleClick }) => {
  return (
    <div className={styles.appIcon} onDoubleClick={onDoubleClick} onClick={onDoubleClick}>
      <div className={styles.iconContainer}>
        <span className={styles.icon}>
          <MiniOSIcon name={icon || id} size={28} />
        </span>
      </div>
      <span className={styles.title}>{title}</span>
    </div>
  );
};

export default AppIcon;
