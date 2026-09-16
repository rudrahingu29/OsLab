import React from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import { SchedulingCalculator } from '../../../algorithms/scheduling/SchedulingCalculator';
import { FCFSScheduler } from '../../../algorithms/scheduling/fcfs';
import { SJFScheduler } from '../../../algorithms/scheduling/sjf';
import { PriorityScheduler } from '../../../algorithms/scheduling/priority';
import { RoundRobinScheduler } from '../../../algorithms/scheduling/roundRobin';
import type { ProcessControlBlock } from '../../../types/simulation';
import styles from './PolicyAnalyzer.module.css';


export const PolicyAnalyzer: React.FC = () => {
  const { processes } = useSimulationStore();
  
  // Filter for valid active/terminated processes that have workload
  const pcbList: ProcessControlBlock[] = processes.map(p => ({
    id: p.id,
    name: p.name,
    state: 'NEW',
    arrivalTime: p.arrivalTime,
    burstTime: p.burstTime,
    remainingTime: p.burstTime,
    priority: p.priority || 0,
    waitingTime: 0,
    turnaroundTime: 0,
    responseTime: 0,
    firstRunTime: null,
    completionTime: null,
    ioBurstTime: p.ioBurstTime || 0,
    ioRemainingTime: p.ioBurstTime || 0,
    memoryRequired: p.memoryRequired || 0
  }));

  const runAnalysis = () => {
    if (pcbList.length === 0) return [];

    const fcfs = new FCFSScheduler();
    const sjf = new SJFScheduler();
    const priority = new PriorityScheduler();
    const rr = new RoundRobinScheduler(2); // Quantum = 2

    const fcfsRes = SchedulingCalculator.calculate(fcfs, JSON.parse(JSON.stringify(pcbList)));
    const sjfRes = SchedulingCalculator.calculate(sjf, JSON.parse(JSON.stringify(pcbList)));
    const priorityRes = SchedulingCalculator.calculate(priority, JSON.parse(JSON.stringify(pcbList)));
    const rrRes = SchedulingCalculator.calculate(rr, JSON.parse(JSON.stringify(pcbList)));

    // Count context switches from Gantt charts
    const countSwitches = (gantt: any[]) => {
      let count = 0;
      for (let i = 1; i < gantt.length; i++) {
        if (gantt[i].processId !== gantt[i - 1].processId) {
          count++;
        }
      }
      return count;
    };

    return [
      {
        name: 'FCFS',
        avgWT: fcfsRes.averageWaitingTime.toFixed(1),
        avgTAT: fcfsRes.averageTurnaroundTime.toFixed(1),
        switches: countSwitches(fcfsRes.ganttChart)
      },
      {
        name: 'SJF',
        avgWT: sjfRes.averageWaitingTime.toFixed(1),
        avgTAT: sjfRes.averageTurnaroundTime.toFixed(1),
        switches: countSwitches(sjfRes.ganttChart)
      },
      {
        name: 'Priority',
        avgWT: priorityRes.averageWaitingTime.toFixed(1),
        avgTAT: priorityRes.averageTurnaroundTime.toFixed(1),
        switches: countSwitches(priorityRes.ganttChart)
      },
      {
        name: 'Round Robin',
        avgWT: rrRes.averageWaitingTime.toFixed(1),
        avgTAT: rrRes.averageTurnaroundTime.toFixed(1),
        switches: countSwitches(rrRes.ganttChart)
      }
    ];
  };

  const results = runAnalysis();

  return (
    <div className={styles.container}>
      <h3 className={styles.header}>OS Scheduling Policy Analyzer</h3>
      <div className={styles.content}>
        <div className={styles.infoBox}>
          <strong>Dynamic Analysis:</strong> This panel runs the current list of processes through FCFS, SJF, Priority, and Round Robin scheduling algorithms to compare scheduling efficiency under different workloads.
        </div>
        
        {pcbList.length === 0 ? (
          <div className={styles.empty}>Create processes by launching desktop apps to analyze workloads.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>Avg Wait (WT)</th>
                <th>Avg Turnaround (TAT)</th>
                <th>Context Switches</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={idx}>
                  <td className={styles.algoName}>{r.name}</td>
                  <td>{r.avgWT} ms</td>
                  <td>{r.avgTAT} ms</td>
                  <td>{r.switches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PolicyAnalyzer;
