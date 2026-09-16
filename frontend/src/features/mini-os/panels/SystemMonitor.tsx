import React from 'react';
import { HardDrive, Globe } from 'lucide-react';
import { useSimulationStore } from '../../../stores/simulationStore';
import styles from './SystemMonitor.module.css';

export const SystemMonitor: React.FC = () => {
  const { processes } = useSimulationStore();
  const activeProcs = processes.filter(p => p.state !== 'TERMINATED');

  // Compute memory usage
  const totalMem = 4096;
  const usedMem = activeProcs.reduce((acc, p) => acc + (p.memoryRequired || 0), 256);
  const memPct = Math.round((usedMem / totalMem) * 100);

  // Compute CPU utilization based on state
  const isCpuBusy = activeProcs.some(p => p.state === 'RUNNING');
  const cpuUtil = isCpuBusy ? Math.round(45 + Math.random() * 35) : 0; // Simulated dynamic utilization when running

  // I/O counts
  const diskIoTasks = activeProcs.filter(p => p.ioBurstTime > 0 && p.state === 'WAITING').length;
  const netIoTasks = activeProcs.filter(p => p.name.includes('Browser') && p.state === 'WAITING').length;

  return (
    <div className={styles.container}>
      <h3 className={styles.header}>OS Resource Monitor</h3>
      <div className={styles.monitorContent}>
        {/* CPU utilization meter */}
        <div className={styles.metric}>
          <div className={styles.label}>CPU Utilization:</div>
          <div className={styles.meterContainer}>
            <div className={styles.meterFill} style={{ width: `${cpuUtil}%`, backgroundColor: cpuUtil > 80 ? 'var(--color-danger)' : 'var(--color-success)' }} />
          </div>
          <div className={styles.value}>{cpuUtil}%</div>
        </div>

        {/* Memory allocation graph */}
        <div className={styles.metric}>
          <div className={styles.label}>RAM Usage:</div>
          <div className={styles.meterContainer}>
            <div className={styles.meterFill} style={{ width: `${memPct}%`, backgroundColor: '#8b5cf6' }} />
          </div>
          <div className={styles.value}>{usedMem} MB / {totalMem} MB ({memPct}%)</div>
        </div>

        {/* Dynamic I/O requests active queues */}
        <div className={styles.ioList}>
          <div className={styles.ioItem}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <HardDrive size={14} color="#eab308" /> Active Disk I/O Queue:
            </span>
            <span style={{ fontWeight: 'bold', color: diskIoTasks > 0 ? 'var(--color-warning)' : 'var(--color-text-secondary)' }}>{diskIoTasks} tasks</span>
          </div>
          <div className={styles.ioItem}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={14} color="#38bdf8" /> Active Network Socket I/O Queue:
            </span>
            <span style={{ fontWeight: 'bold', color: netIoTasks > 0 ? 'var(--color-warning)' : 'var(--color-text-secondary)' }}>{netIoTasks} tasks</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
