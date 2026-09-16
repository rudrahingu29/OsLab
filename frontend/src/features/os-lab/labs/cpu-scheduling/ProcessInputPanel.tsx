import React, { useState } from 'react';
import { Button, Input, Table } from '../../../../components/common';
import { Plus, Trash2, RotateCcw, Sparkles } from 'lucide-react';
import styles from './ProcessInputPanel.module.css';
import type { ProcessControlBlock } from '../../../../types/simulation';

interface ProcessInputPanelProps {
  processes: ProcessControlBlock[];
  setProcesses: React.Dispatch<React.SetStateAction<ProcessControlBlock[]>>;
  showPriority?: boolean;
}

export const ProcessInputPanel: React.FC<ProcessInputPanelProps> = ({ 
  processes, 
  setProcesses,
  showPriority = false 
}) => {
  const [nextId, setNextId] = useState(processes.length > 0 ? Math.max(...processes.map(p => p.id)) + 1 : 1);
  const [arrivalTime, setArrivalTime] = useState<number>(0);
  const [burstTime, setBurstTime] = useState<number>(5);
  const [priority, setPriority] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAddProcess = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (arrivalTime < 0) {
      setValidationError('Arrival time cannot be negative.');
      return;
    }
    if (burstTime <= 0) {
      setValidationError('Burst time must be greater than zero.');
      return;
    }

    const newProcess: ProcessControlBlock = {
      id: nextId,
      name: `P${nextId}`,
      state: 'NEW',
      arrivalTime,
      burstTime,
      priority: showPriority ? priority : 1,
      remainingTime: burstTime,
      waitingTime: 0,
      turnaroundTime: 0,
      responseTime: 0,
      firstRunTime: null,
      completionTime: null,
      ioBurstTime: 0,
      ioRemainingTime: 0,
      memoryRequired: 64
    };

    setProcesses([...processes, newProcess]);
    setNextId(nextId + 1);
  };

  const handleRemoveProcess = (id: number) => {
    setProcesses(processes.filter(p => p.id !== id));
  };

  const handleLoadPreset = () => {
    const sampleData: ProcessControlBlock[] = [
      { id: 1, name: 'P1', state: 'NEW', arrivalTime: 0, burstTime: 8, priority: 3, remainingTime: 8, waitingTime: 0, turnaroundTime: 0, responseTime: 0, firstRunTime: null, completionTime: null, ioBurstTime: 0, ioRemainingTime: 0, memoryRequired: 64 },
      { id: 2, name: 'P2', state: 'NEW', arrivalTime: 1, burstTime: 4, priority: 1, remainingTime: 4, waitingTime: 0, turnaroundTime: 0, responseTime: 0, firstRunTime: null, completionTime: null, ioBurstTime: 0, ioRemainingTime: 0, memoryRequired: 64 },
      { id: 3, name: 'P3', state: 'NEW', arrivalTime: 2, burstTime: 9, priority: 4, remainingTime: 9, waitingTime: 0, turnaroundTime: 0, responseTime: 0, firstRunTime: null, completionTime: null, ioBurstTime: 0, ioRemainingTime: 0, memoryRequired: 64 },
      { id: 4, name: 'P4', state: 'NEW', arrivalTime: 3, burstTime: 5, priority: 2, remainingTime: 5, waitingTime: 0, turnaroundTime: 0, responseTime: 0, firstRunTime: null, completionTime: null, ioBurstTime: 0, ioRemainingTime: 0, memoryRequired: 64 },
    ];
    setProcesses(sampleData);
    setNextId(5);
    setValidationError(null);
  };

  const handleClearAll = () => {
    setProcesses([]);
    setNextId(1);
    setValidationError(null);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.headerRow}>
        <h3>Process Queue Configuration</h3>
        <div className={styles.presetButtons}>
          <Button variant="ghost" size="sm" onClick={handleLoadPreset} leftIcon={<Sparkles size={14} />}>
            Sample Data
          </Button>
          {processes.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearAll} leftIcon={<RotateCcw size={14} />}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleAddProcess} className={styles.formGrid}>
        <Input 
          label="Arrival Time (ms)" 
          type="number" 
          min="0" 
          value={arrivalTime} 
          onChange={e => setArrivalTime(Number(e.target.value))} 
          required 
        />
        <Input 
          label="Burst Time (ms)" 
          type="number" 
          min="1" 
          value={burstTime} 
          onChange={e => setBurstTime(Number(e.target.value))} 
          required 
        />
        {showPriority && (
          <Input 
            label="Priority (Lower = Higher)" 
            type="number" 
            min="0" 
            value={priority} 
            onChange={e => setPriority(Number(e.target.value))} 
            required 
          />
        )}
        <div className={styles.addBtnWrapper}>
          <Button variant="primary" type="submit" leftIcon={<Plus size={16} />}>
            Add Process
          </Button>
        </div>
      </form>

      {validationError && (
        <div className={styles.validationError}>{validationError}</div>
      )}

      {processes.length > 0 ? (
        <div className={styles.tableWrapper}>
          <Table>
            <thead>
              <tr>
                <th>PID</th>
                <th title="Time when process arrives in the Ready Queue">Arrival Time</th>
                <th title="CPU execution time required by the process">Burst Time</th>
                {showPriority && (
                  <th title="Priority ranking (lower numbers run first in Priority Scheduling)">Priority</th>
                )}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {processes.map(p => (
                <tr key={p.id}>
                  <td className={styles.pidCell}>P{p.id}</td>
                  <td>{p.arrivalTime} ms</td>
                  <td>{p.burstTime} ms</td>
                  {showPriority && <td>{p.priority}</td>}
                  <td>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveProcess(p.id)} 
                      className={styles.removeBtn}
                      title="Remove process"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <div className={styles.emptyState}>
          No processes configured. Click <strong>Sample Data</strong> above or add a process to begin.
        </div>
      )}
    </div>
  );
};

export default ProcessInputPanel;
