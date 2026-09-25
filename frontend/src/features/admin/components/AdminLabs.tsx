import React from 'react';
import { Card, ProgressBar } from '../../../components/common';
import type { SimulationStat } from '../types';
import { Cpu, Layers, HardDrive } from 'lucide-react';
import styles from '../AdminPage.module.css';

interface AdminLabsProps {
  simStats: SimulationStat[];
}

export const AdminLabs: React.FC<AdminLabsProps> = ({ simStats }) => {
  const cpuStats = simStats.filter((s) => s.type === 'CPU');
  const memoryStats = simStats.filter((s) => s.type === 'Memory');
  const diskStats = simStats.filter((s) => s.type === 'Disk');

  const totalRuns = simStats.reduce((acc, s) => acc + s.runsCount, 0);

  return (
    <div className={styles.tabContent}>
      {/* Simulation Breakdown Grid */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(34, 211, 238, 0.12)', color: 'var(--color-primary)' }}>
            <Cpu size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>CPU Scheduling Labs</span>
            <div className={styles.statValue}>
              {cpuStats.reduce((a, b) => a + b.runsCount, 0)} runs
            </div>
            <span className={styles.statSub}>FCFS, SJF, RR, Priority</span>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-warning)' }}>
            <Layers size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Memory Management Labs</span>
            <div className={styles.statValue}>
              {memoryStats.reduce((a, b) => a + b.runsCount, 0)} runs
            </div>
            <span className={styles.statSub}>LRU, FIFO, Optimal</span>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(34, 197, 94, 0.12)', color: 'var(--color-success)' }}>
            <HardDrive size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Disk Scheduling Labs</span>
            <div className={styles.statValue}>
              {diskStats.reduce((a, b) => a + b.runsCount, 0)} runs
            </div>
            <span className={styles.statSub}>SCAN, C-SCAN, SSTF, LOOK</span>
          </div>
        </Card>
      </div>

      <div className={styles.twoColGrid}>
        {/* CPU & Memory Simulation Benchmarks */}
        <Card className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div>
              <h3>CPU & Memory Performance Metrics</h3>
              <p className={styles.panelSub}>Average turnaround times & simulated page faults</p>
            </div>
          </div>

          <div className={styles.algorithmList}>
            <h4 style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CPU Scheduling (Avg Turnaround Time)
            </h4>
            {cpuStats.map((stat) => (
              <div key={stat.algorithm} className={styles.algoRow}>
                <div className={styles.algoMeta}>
                  <span className={styles.algoNameText}>{stat.algorithm}</span>
                  <span className={styles.metricHighlight}>{stat.avgTurnaround} ms</span>
                </div>
                <ProgressBar value={Math.min(100, Math.round((stat.runsCount / totalRuns) * 250))} size="sm" />
              </div>
            ))}

            <h4 style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '1.5rem' }}>
              Memory Page Replacement (Avg Page Faults)
            </h4>
            {memoryStats.map((stat) => (
              <div key={stat.algorithm} className={styles.algoRow}>
                <div className={styles.algoMeta}>
                  <span className={styles.algoNameText}>{stat.algorithm}</span>
                  <span className={styles.metricHighlight}>{stat.avgPageFaults} faults</span>
                </div>
                <ProgressBar value={Math.min(100, Math.round((stat.runsCount / totalRuns) * 250))} size="sm" />
              </div>
            ))}
          </div>
        </Card>

        {/* Disk Scheduling & Simulator Health */}
        <Card className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div>
              <h3>Disk Head Movement & Mini-OS</h3>
              <p className={styles.panelSub}>Seek optimization averages & OS process stats</p>
            </div>
          </div>

          <div className={styles.algorithmList}>
            <h4 style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Disk Head Optimization (Avg Cylinders Traversed)
            </h4>
            {diskStats.map((stat) => (
              <div key={stat.algorithm} className={styles.algoRow}>
                <div className={styles.algoMeta}>
                  <span className={styles.algoNameText}>{stat.algorithm}</span>
                  <span className={styles.metricHighlight}>{stat.avgHeadMovement} tracks</span>
                </div>
                <ProgressBar value={Math.min(100, Math.round((stat.runsCount / totalRuns) * 250))} size="sm" />
              </div>
            ))}

            <div className={styles.miniOsInsightsBox}>
              <h4>Mini-OS Virtual Machine Telemetry</h4>
              <div className={styles.miniOsStatsGrid}>
                <div className={styles.miniOsStat}>
                  <span className={styles.miniOsVal}>1,240</span>
                  <span className={styles.miniOsLbl}>Virtual Processes Spawned</span>
                </div>
                <div className={styles.miniOsStat}>
                  <span className={styles.miniOsVal}>4.8 MB</span>
                  <span className={styles.miniOsLbl}>Simulated RAM In-Use</span>
                </div>
                <div className={styles.miniOsStat}>
                  <span className={styles.miniOsVal}>388</span>
                  <span className={styles.miniOsLbl}>Simulated Files Created</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminLabs;
