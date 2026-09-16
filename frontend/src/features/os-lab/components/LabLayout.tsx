import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LabLayout.module.css';

interface LabLayoutProps {
  title: string;
  description?: string;
  controls?: React.ReactNode;
  children: React.ReactNode;
}

const LabLayout: React.FC<LabLayoutProps> = ({ title, description, controls, children }) => {
  return (
    <div className="container-width animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div className={styles.breadcrumbs}>
        <Link to="/os-lab" className={styles.breadLink}>OS Lab</Link>
        <span className={styles.breadDivider}>/</span>
        <span className={styles.breadCurrent}>{title}</span>
      </div>

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      </header>

      {controls && <div className={styles.controlsWrapper}>{controls}</div>}

      <main className={styles.content}>{children}</main>
    </div>
  );
};

export default LabLayout;
