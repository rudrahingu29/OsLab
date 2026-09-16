import React from 'react';
import styles from './GanttChart.module.css';

export interface GanttBlock {
  processId: string;
  startTime: number;
  endTime: number;
  color?: string;
}

interface GanttChartProps {
  blocks: GanttBlock[];
  totalTime: number;
}

const defaultProcessColors: Record<string, string> = {
  Idle: 'var(--color-text-muted)',
  P1: 'var(--color-primary)',
  P2: '#0d9488', // Teal
  P3: '#6366f1', // Indigo
  P4: '#d97706', // Amber
  P5: '#059669', // Emerald
};

const getProcessColor = (processId: string, customColor?: string) => {
  if (customColor) return customColor;
  if (defaultProcessColors[processId]) return defaultProcessColors[processId];
  return 'var(--color-primary)';
};

const GanttChart: React.FC<GanttChartProps> = ({ blocks, totalTime }) => {
  if (totalTime === 0 || blocks.length === 0) return <div className={styles.empty}>No execution timeline data available</div>;

  return (
    <div className={styles.container}>
      <div className={styles.chart}>
        {blocks.map((block, i) => (
          <div 
            key={i} 
            className={styles.block}
            style={{
              left: `${(block.startTime / totalTime) * 100}%`,
              width: `${((block.endTime - block.startTime) / totalTime) * 100}%`,
              backgroundColor: getProcessColor(block.processId, block.color)
            }}
            title={`${block.processId} (${block.startTime}ms - ${block.endTime}ms)`}
          >
            {block.processId}
          </div>
        ))}
      </div>
      <div className={styles.timeline}>
        {(() => {
          const step = totalTime <= 20 ? 1 : totalTime <= 50 ? 5 : totalTime <= 100 ? 10 : totalTime <= 500 ? 50 : Math.ceil(totalTime / 10);
          const ticksList = [];
          for (let i = 0; i <= totalTime; i += step) {
            ticksList.push(i);
          }
          if (ticksList[ticksList.length - 1] !== totalTime) {
            ticksList.push(totalTime);
          }
          return ticksList.map((tickVal) => (
            <div key={tickVal} className={styles.tick} style={{ left: `${(tickVal / totalTime) * 100}%` }}>
              {tickVal}
            </div>
          ));
        })()}
      </div>
    </div>
  );
};

export default GanttChart;
