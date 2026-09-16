import React from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import styles from './EventLog.module.css';

interface EventLogProps {
  mode?: 'learning' | 'realism';
}

export const EventLog: React.FC<EventLogProps> = ({ mode = 'learning' }) => {
  const { events } = useSimulationStore();

  const getExplanation = (type: string, payload: any) => {
    switch (type) {
      case 'PROCESS_CREATED':
        return `Process "${payload.process?.name}" was spawned. The OS initializes the Process Control Block (PCB) and allocates memory.`;
      case 'CONTEXT_SWITCH':
        return payload.processId 
          ? `CPU switched execution context. Saved state of previous process and loaded Process ID ${payload.processId} into CPU registers.`
          : 'CPU entered idle state as there are no ready processes in the schedule queue.';
      default:
        return '';
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.header}>OS System Event Log</h3>
      <div className={styles.logList}>
        {events.map((event, idx) => (
          <div key={idx} className={styles.logItem}>
            <div className={styles.meta}>
              <span className={styles.timestamp}>[{event.timestamp} ms]</span>
              <span className={styles.type}>{event.type}</span>
            </div>
            {mode === 'learning' && (
              <div className={styles.explanation}>
                {getExplanation(event.type, event.payload)}
              </div>
            )}
          </div>
        ))}
        {events.length === 0 && (
          <div className={styles.empty}>No system events recorded yet. Start the clock to observe events.</div>
        )}
      </div>
    </div>
  );
};

export default EventLog;
