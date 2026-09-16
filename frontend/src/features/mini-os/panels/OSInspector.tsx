import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useSimulationStore } from '../../../stores/simulationStore';
import ProcessStateBadge from '../../../components/simulation/ProcessStateBadge';
import EventLog from './EventLog';
import SystemMonitor from './SystemMonitor';
import PolicyAnalyzer from './PolicyAnalyzer';
import styles from './OSInspector.module.css';

interface OSInspectorProps {
  mode?: 'learning' | 'realism';
}

export const OSInspector: React.FC<OSInspectorProps> = ({ mode = 'learning' }) => {
  const { processes, ticks } = useSimulationStore();
  const [activeTab, setActiveTab] = useState<'processes' | 'memory' | 'events' | 'policy'>('processes');

  const activeProcs = processes.filter(p => p.state !== 'TERMINATED');

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button 
          onClick={() => setActiveTab('processes')} 
          className={`${styles.tabBtn} ${activeTab === 'processes' ? styles.activeTab : ''}`}
        >
          Processes
        </button>
        <button 
          onClick={() => setActiveTab('memory')} 
          className={`${styles.tabBtn} ${activeTab === 'memory' ? styles.activeTab : ''}`}
        >
          Memory
        </button>
        <button 
          onClick={() => setActiveTab('events')} 
          className={`${styles.tabBtn} ${activeTab === 'events' ? styles.activeTab : ''}`}
        >
          Events
        </button>
        <button 
          onClick={() => setActiveTab('policy')} 
          className={`${styles.tabBtn} ${activeTab === 'policy' ? styles.activeTab : ''}`}
        >
          Policy Analyzer
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'processes' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4>Active Process Table (PCB)</h4>
              <span className={styles.ticks}>Uptime: {ticks} ms</span>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>PID</th>
                    <th>Name</th>
                    <th>State</th>
                    <th>Arrival</th>
                    <th>Burst</th>
                    <th>Remaining</th>
                    <th>RAM Req</th>
                  </tr>
                </thead>
                <tbody>
                  {activeProcs.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'monospace' }}>{p.id}</td>
                      <td>{p.name}</td>
                      <td><ProcessStateBadge state={p.state} /></td>
                      <td>{p.arrivalTime} ms</td>
                      <td>{p.burstTime} ms</td>
                      <td>{p.remainingTime} ms</td>
                      <td>{p.memoryRequired} MB</td>
                    </tr>
                  ))}
                  {activeProcs.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: '16px' }}>
                        No active processes. Open apps from the desktop to launch tasks.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link to="/learn/cpu-scheduling" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <BookOpen size={14} /> Learn CPU Scheduling →
              </Link>
              <Link to="/learn/process-states" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#10b981', textDecoration: 'none', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <BookOpen size={14} /> Learn Process States →
              </Link>
              <Link to="/learn/memory-management" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#8b5cf6', textDecoration: 'none', backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <BookOpen size={14} /> Learn Memory Management →
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'memory' && (
          <div className={styles.section}>
            <h4>Memory Space Map (RAM allocation)</h4>
            <div className={styles.memoryMapContainer}>
              <div className={styles.memoryBlock} style={{ flexGrow: 256, backgroundColor: '#475569' }}>
                <span className={styles.blockLabel}>OS Kernel (256 MB)</span>
              </div>
              {activeProcs.map(p => (
                <div 
                  key={p.id} 
                  className={styles.memoryBlock} 
                  style={{ flexGrow: p.memoryRequired || 60, backgroundColor: '#3b82f6' }}
                >
                  <span className={styles.blockLabel}>{p.name} (PID {p.id}: {p.memoryRequired}MB)</span>
                </div>
              ))}
              <div className={styles.memoryBlock} style={{ flexGrow: 4096 - 256 - activeProcs.reduce((acc, p) => acc + (p.memoryRequired || 0), 0), backgroundColor: '#0f172a', border: '1px dashed #334155' }}>
                <span className={styles.blockLabel}>Free RAM</span>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <SystemMonitor />
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className={styles.section} style={{ height: '100%' }}>
            <EventLog mode={mode} />
          </div>
        )}

        {activeTab === 'policy' && (
          <div className={styles.section}>
            <PolicyAnalyzer />
          </div>
        )}
      </div>
    </div>
  );
};

export default OSInspector;
