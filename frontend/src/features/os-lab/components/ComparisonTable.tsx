import React from 'react';
import styles from './ComparisonTable.module.css';

interface ComparisonData {
  algorithm: string;
  avgTurnaround: number;
  avgWait: number;
}

interface ComparisonTableProps {
  data: ComparisonData[];
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ data }) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Algorithm</th>
          <th>Avg Turnaround Time</th>
          <th>Avg Wait Time</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            <td>{row.algorithm}</td>
            <td>{row.avgTurnaround.toFixed(2)}</td>
            <td>{row.avgWait.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ComparisonTable;
