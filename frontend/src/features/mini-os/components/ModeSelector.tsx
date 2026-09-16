import React from 'react';
import { Card, Button } from '../../../components/common';
import { BookOpen, ArrowRight, Cpu, Layers, HardDrive, Terminal, CheckCircle2, ShieldCheck } from 'lucide-react';
import styles from './ModeSelector.module.css';

interface ModeSelectorProps {
  onSelectMode: (mode: 'learning' | 'realism') => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelectMode }) => {
  return (
    <div className={`${styles.selector} animate-fade-in`}>
      <div className={styles.container}>
        
        {/* Header Title & Kernel Spec Banner */}
        <div className={styles.header}>
          <h1 className={styles.title}>Mini-OS Virtual Kernel Architecture</h1>
          <p className={styles.subtitle}>
            Boot a 64-bit simulated operating system environment with real-time CPU scheduling, memory management, and process isolation.
          </p>
          
          <div className={styles.kernelSpecs}>
            <span className={styles.specBadge}>
              <Cpu size={14} style={{ color: '#3b82f6' }} /> Microkernel v2.4
            </span>
            <span className={styles.specBadge}>
              <Layers size={14} style={{ color: '#10b981' }} /> Demand Paging (4 GB Virtual RAM)
            </span>
            <span className={styles.specBadge}>
              <HardDrive size={14} style={{ color: '#8b5cf6' }} /> Virtual File System (VFS / ext4)
            </span>
            <span className={styles.specBadge}>
              <Terminal size={14} style={{ color: '#f59e0b' }} /> POSIX Terminal Shell
            </span>
          </div>
        </div>

        {/* Mode Options */}
        <div className={styles.options}>
          
          {/* Option 1: Learning Mode */}
          <Card className={styles.card} variant="default">
            <span className={`${styles.cardBadge} ${styles.badgeBlue}`}>
              RECOMMENDED FOR STUDENTS
            </span>

            <div className={styles.cardTop}>
              <div className={`${styles.iconBox} ${styles.iconBoxBlue}`}>
                <BookOpen size={28} />
              </div>
              <h2 className={styles.cardTitle}>Learning Mode</h2>
            </div>

            <p className={styles.cardDesc}>
              Includes the **OS Inspector** dashboard side-by-side. Trace memory allocation, process states, and CPU scheduling ticks in real-time.
            </p>

            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <CheckCircle2 size={15} style={{ color: '#3b82f6' }} /> Real-time Process Control Block (PCB) Table
              </li>
              <li className={styles.featureItem}>
                <CheckCircle2 size={15} style={{ color: '#3b82f6' }} /> RAM Allocation & Page Fault Visualizer
              </li>
              <li className={styles.featureItem}>
                <CheckCircle2 size={15} style={{ color: '#3b82f6' }} /> Live CPU Gantt Execution Ticks
              </li>
              <li className={styles.featureItem}>
                <CheckCircle2 size={15} style={{ color: '#3b82f6' }} /> Event Logs & Context Switch Monitor
              </li>
            </ul>

            <Button 
              onClick={() => onSelectMode('learning')} 
              variant="primary"
              rightIcon={<ArrowRight size={16} />}
              className={styles.actionBtn}
            >
              Start Learning Mode
            </Button>
          </Card>

          {/* Option 2: Realism Mode */}
          <Card className={styles.card} variant="default">
            <span className={`${styles.cardBadge} ${styles.badgeGreen}`}>
              FULL OS SANDBOX
            </span>

            <div className={styles.cardTop}>
              <div className={`${styles.iconBox} ${styles.iconBoxGreen}`}>
                <ShieldCheck size={28} />
              </div>
              <h2 className={styles.cardTitle}>Realism Mode</h2>
            </div>

            <p className={styles.cardDesc}>
              A clean virtual desktop environment. Ideal for running shell commands, managing files, writing code, and running daemons.
            </p>

            <ul className={styles.featureList}>
              <li className={styles.featureItem}>
                <CheckCircle2 size={15} style={{ color: '#10b981' }} /> Fullscreen Virtual Desktop Workspace
              </li>
              <li className={styles.featureItem}>
                <CheckCircle2 size={15} style={{ color: '#10b981' }} /> Multi-window Terminal & POSIX Shell
              </li>
              <li className={styles.featureItem}>
                <CheckCircle2 size={15} style={{ color: '#10b981' }} /> Built-in Code Editor & File Manager
              </li>
              <li className={styles.featureItem}>
                <CheckCircle2 size={15} style={{ color: '#10b981' }} /> Real-World Linux CFS Scheduler Engine
              </li>
            </ul>

            <Button 
              onClick={() => onSelectMode('realism')} 
              variant="primary"
              rightIcon={<ArrowRight size={16} />}
              className={styles.actionBtn}
            >
              Start Realism Mode
            </Button>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default ModeSelector;
