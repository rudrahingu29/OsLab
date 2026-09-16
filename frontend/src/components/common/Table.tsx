import React from 'react';
import styles from './Table.module.css';

interface TableProps {
  headers?: React.ReactNode[];
  children?: React.ReactNode;
  className?: string;
  striped?: boolean;
}

const Table: React.FC<TableProps> = ({
  headers,
  children,
  className = '',
  striped = false,
}) => {
  return (
    <div className={styles.responsiveWrapper}>
      <table className={`${styles.table} ${striped ? styles.striped : ''} ${className}`}>
        {headers && (
          <thead>
            <tr>
              {headers.map((h, idx) => (
                <th key={idx} className={styles.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        {children}
      </table>
    </div>
  );
};

export default Table;
