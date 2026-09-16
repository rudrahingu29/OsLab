import React from 'react';
import GanttChart from '../../../../components/charts/GanttChart';
import MetricCard from '../../../../components/charts/MetricCard';
import styles from './ResultsPanel.module.css';

const ResultsPanel: React.FC = () => {
  return (
    <div className={styles.panel}>
      <h3>Simulation Results</h3>
      <GanttChart blocks={[]} totalTime={0} />
      <div className={styles.metrics}>
        <MetricCard label="Avg Turnaround Time" value="0.0" />
        <MetricCard label="Avg Waiting Time" value="0.0" />
      </div>
    </div>
  );
};

export default ResultsPanel;
