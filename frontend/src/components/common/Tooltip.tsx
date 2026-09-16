import { type ReactNode } from 'react';
import styles from './Tooltip.module.css';

interface TooltipProps {
  children: ReactNode;
  content: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, content }) => {
  return (
    <div className={styles.container}>
      {children}
      <div className={styles.tooltip}>{content}</div>
    </div>
  );
};

export default Tooltip;
