import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/common';
import { Cpu, HardDrive, Layers, ArrowRight, FlaskConical, Activity, Award } from 'lucide-react';
import styles from './OSLabPage.module.css';

export const OSLabPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container-width animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* OS Lab Hero Banner */}
      <div className={styles.heroBanner}>
        <div className={styles.heroHeader}>
          <div className={styles.heroTitleGroup}>
            <h1 className={styles.heroTitle}>
              <FlaskConical size={28} style={{ color: 'var(--color-primary)' }} />
              OS Virtual Laboratory Workspaces
            </h1>
            <p className={styles.heroSubtitle}>
              Configure system parameters, test scheduling algorithms, analyze RAM partitioning, and track disk arm seek movements in real-time.
            </p>
          </div>
        </div>

        <div className={styles.statsBar}>
          <span className={styles.statBadge}>
            <Cpu size={14} style={{ color: '#3b82f6' }} /> 3 Interactive Workspaces
          </span>
          <span className={styles.statBadge}>
            <Activity size={14} style={{ color: '#10b981' }} /> 12 Simulation Algorithms
          </span>
          <span className={styles.statBadge}>
            <Award size={14} style={{ color: '#8b5cf6' }} /> Live Gantt & Disk Seek Graphs
          </span>
        </div>
      </div>

      {/* Laboratory Workspaces Grid */}
      <div className={styles.grid}>
        
        {/* Workspace 1: CPU Scheduling Lab */}
        <Card 
          className={`${styles.card} ${styles.cardCpu}`} 
          onClick={() => navigate('/os-lab/cpu-scheduling')}
        >
          <div className={styles.cardHeader}>
            <div className={`${styles.iconBox} ${styles.iconCpu}`}>
              <Cpu size={26} />
            </div>
            <span className={styles.activeBadge}>Interactive Workspace</span>
          </div>

          <h2 className={styles.cardTitle}>CPU Scheduling Laboratory</h2>
          <p className={styles.cardDesc}>
            Simulate CPU execution, context switching, waiting time, turnaround time, and response time across process burst requests.
          </p>

          <div className={styles.algoList}>
            <span className={styles.algoBadge}>FCFS</span>
            <span className={styles.algoBadge}>SJF</span>
            <span className={styles.algoBadge}>Priority</span>
            <span className={styles.algoBadge}>Round Robin</span>
            <span className={styles.algoBadge}>Gantt Charts</span>
          </div>

          <div className={styles.cardFooter}>
            <span className={styles.actionText}>
              Launch CPU Simulator <ArrowRight size={14} />
            </span>
          </div>
        </Card>

        {/* Workspace 2: Memory Management Lab */}
        <Card 
          className={`${styles.card} ${styles.cardMemory}`} 
          onClick={() => navigate('/os-lab/memory-management')}
        >
          <div className={styles.cardHeader}>
            <div className={`${styles.iconBox} ${styles.iconMemory}`}>
              <Layers size={26} />
            </div>
            <span className={styles.activeBadge}>Interactive Workspace</span>
          </div>

          <h2 className={styles.cardTitle}>Memory Management & Paging</h2>
          <p className={styles.cardDesc}>
            Experiment with contiguous RAM partition allocation, internal/external fragmentation, Demand Paging, and Page Replacement algorithms.
          </p>

          <div className={styles.algoList}>
            <span className={styles.algoBadge}>First-Fit</span>
            <span className={styles.algoBadge}>Best-Fit</span>
            <span className={styles.algoBadge}>Worst-Fit</span>
            <span className={styles.algoBadge}>FIFO / LRU</span>
            <span className={styles.algoBadge}>Page Faults</span>
          </div>

          <div className={styles.cardFooter}>
            <span className={styles.actionText}>
              Launch Memory Simulator <ArrowRight size={14} />
            </span>
          </div>
        </Card>

        {/* Workspace 3: Disk Scheduling Lab */}
        <Card 
          className={`${styles.card} ${styles.cardDisk}`} 
          onClick={() => navigate('/os-lab/disk-scheduling')}
        >
          <div className={styles.cardHeader}>
            <div className={`${styles.iconBox} ${styles.iconDisk}`}>
              <HardDrive size={26} />
            </div>
            <span className={styles.activeBadge}>Interactive Workspace</span>
          </div>

          <h2 className={styles.cardTitle}>Disk Scheduling & I/O Subsystem</h2>
          <p className={styles.cardDesc}>
            Observe physical magnetic disk arm head sweep movements, track cylinder seek paths, and request queue response times.
          </p>

          <div className={styles.algoList}>
            <span className={styles.algoBadge}>FCFS</span>
            <span className={styles.algoBadge}>SSTF</span>
            <span className={styles.algoBadge}>SCAN</span>
            <span className={styles.algoBadge}>C-SCAN</span>
            <span className={styles.algoBadge}>C-LOOK</span>
          </div>

          <div className={styles.cardFooter}>
            <span className={styles.actionText}>
              Launch Disk Simulator <ArrowRight size={14} />
            </span>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default OSLabPage;
