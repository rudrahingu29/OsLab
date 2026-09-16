import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PageHeader.module.css';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  action,
  className = '',
}) => {
  return (
    <div className={`${styles.header} ${className}`}>
      <div className={styles.content}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className={styles.separator}>/</span>}
                {crumb.to ? (
                  <Link to={crumb.to} className={styles.link}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={styles.current}>{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
};

export default PageHeader;
