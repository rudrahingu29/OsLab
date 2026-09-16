import React from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import { FCFSScheduler } from '../../../algorithms/scheduling/fcfs';
import { SJFScheduler } from '../../../algorithms/scheduling/sjf';
import { PriorityScheduler } from '../../../algorithms/scheduling/priority';
import { RoundRobinScheduler } from '../../../algorithms/scheduling/roundRobin';
import { ArrowLeft, Play, Pause, StepForward, RotateCcw, Clock } from 'lucide-react';
import styles from './SimulationControls.module.css';

interface SimulationControlsProps {
  mode?: 'learning' | 'realism';
  onSwitchMode?: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({ mode = 'learning', onSwitchMode }) => {
  const { isRunning, toggleRun, tick, reset, setScheduler, engine, ticks } = useSimulationStore();

  const handleSchedulerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const policy = e.target.value;
    let scheduler;
    switch (policy) {
      case 'FCFS':
        scheduler = new FCFSScheduler();
        break;
      case 'SJF':
        scheduler = new SJFScheduler();
        break;
      case 'Priority':
        scheduler = new PriorityScheduler();
        break;
      case 'RR':
        scheduler = new RoundRobinScheduler(2); // default quantum = 2
        break;
      default:
        scheduler = new FCFSScheduler();
    }
    setScheduler(scheduler);
    useSimulationStore.setState({ engine });
  };

  const currentSched = engine.cpu.getScheduler();
  const schedName = currentSched ? currentSched.name : 'FCFS';

  return (
    <div className={styles.controls}>
      {onSwitchMode && (
        <button 
          onClick={onSwitchMode} 
          className={styles.btn} 
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid var(--color-border)', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          title="Return to Mode Selector"
        >
          <ArrowLeft size={16} />
        </button>
      )}

      {/* Uptime Ticks Badge */}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '3px 8px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
        <Clock size={12} style={{ color: '#3b82f6' }} /> {ticks} ms
      </span>

      {mode === 'learning' ? (
        <div className={styles.policyGroup}>
          <span className={styles.label}>Policy:</span>
          <select 
            value={schedName} 
            onChange={handleSchedulerChange} 
            className={styles.select}
          >
            <option value="FCFS">FCFS (First Come First Served)</option>
            <option value="SJF">SJF (Shortest Job First)</option>
            <option value="Priority">Priority Scheduling</option>
            <option value="RR">Round Robin (Q=2)</option>
          </select>
        </div>
      ) : (
        <div className={styles.policyGroup}>
          <span className={styles.label}>Kernel:</span>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, padding: '3px 8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            Linux CFS Hybrid
          </span>
        </div>
      )}

      <div className={styles.btnGroup}>
        <button 
          onClick={toggleRun} 
          className={styles.btn}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: isRunning ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: isRunning ? '#ef4444' : '#10b981', borderColor: isRunning ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)' }}
          title={isRunning ? "Pause Execution" : "Start Kernel Execution"}
        >
          {isRunning ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Start</>}
        </button>

        <button 
          onClick={tick} 
          disabled={isRunning} 
          className={styles.btn}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          title="Execute Single Clock Tick (+1 ms)"
        >
          <StepForward size={12} /> Step
        </button>

        <button 
          onClick={reset} 
          className={styles.btn}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          title="Reset Kernel State"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>
    </div>
  );
};

export default SimulationControls;
