import React from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import ProcessStateBadge from '../../../components/simulation/ProcessStateBadge';
import styles from './AppContent.module.css';

export const TaskManagerApp: React.FC = () => {
  const { processes, engine } = useSimulationStore();

  const handleKill = (pid: number) => {
    // Transition to TERMINATED or remove from CPU queue
    const p = engine.processManager.getProcess(pid);
    if (p) {
      p.setState('TERMINATED');
      engine.cpu.removeProcess(pid);
      // Re-sync store state
      useSimulationStore.setState({
        processes: engine.processManager.getAllProcesses().map(pr => pr.clone())
      });
    }
  };

  const getMemoryPercentage = () => {
    const total = 4096;
    const used = processes
      .filter(p => p.state !== 'TERMINATED')
      .reduce((acc, p) => acc + (p.memoryRequired || 0), 256); // 256MB kernel default
    return Math.round((used / total) * 100);
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div className={styles.cardPanel} style={{ flexGrow: 1, padding: '12px' }}>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>System Memory Usage</h4>
          <div style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>{getMemoryPercentage()}%</div>
        </div>
        <div className={styles.cardPanel} style={{ flexGrow: 1, padding: '12px' }}>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Active Processes</h4>
          <div style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>
            {processes.filter(p => p.state !== 'TERMINATED').length}
          </div>
        </div>
      </div>

      <div className={styles.content} style={{ border: '1px solid var(--color-border)', borderRadius: '6px', overflowY: 'auto', backgroundColor: 'var(--color-surface)' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>PID</th>
              <th>Process Name</th>
              <th>State</th>
              <th>Memory</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {processes.filter(p => p.state !== 'TERMINATED').map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-primary)' }}>{p.id}</td>
                <td style={{ color: 'var(--color-text-primary)' }}>{p.name}</td>
                <td>
                  <ProcessStateBadge state={p.state} />
                </td>
                <td style={{ color: 'var(--color-text-secondary)' }}>{p.memoryRequired} MB</td>
                <td>
                  <button 
                    onClick={() => handleKill(p.id)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--color-error)',
                      color: 'var(--color-error)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    Kill
                  </button>
                </td>
              </tr>
            ))}
            {processes.filter(p => p.state !== 'TERMINATED').length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '16px' }}>
                  No active processes. Launch applications to create workloads.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskManagerApp;
