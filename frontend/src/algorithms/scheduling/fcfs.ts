import type { IScheduler } from '../../simulation/cpu/Scheduler';
import type { ProcessControlBlock, SchedulingResult, GanttItem } from '../../types/simulation';
import { Process } from '../../simulation/process/Process';

export class FCFSScheduler implements IScheduler {
  name = 'FCFS';
  private queue: Process[] = [];

  schedule(processes: ProcessControlBlock[]): SchedulingResult {
    const procs = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
    procs.sort((a, b) => a.arrivalTime - b.arrivalTime);

    const ganttChart: GanttItem[] = [];
    let currentTime = 0;
    let completed = 0;
    
    while (completed < procs.length) {
      const available = procs.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);
      
      if (available.length > 0) {
        const p = available[0];
        
        if (p.firstRunTime === null || p.firstRunTime === undefined) {
          p.firstRunTime = currentTime;
          p.responseTime = currentTime - p.arrivalTime;
        }

        const start = currentTime;
        currentTime += p.remainingTime;
        p.remainingTime = 0;
        
        ganttChart.push({ processId: p.id, startTime: start, endTime: currentTime });
        
        p.completionTime = currentTime;
        p.turnaroundTime = p.completionTime - p.arrivalTime;
        p.waitingTime = p.turnaroundTime - p.burstTime;
        completed++;
      } else {
        const nextArrival = procs.find(p => p.remainingTime > 0)?.arrivalTime ?? currentTime + 1;
        ganttChart.push({ processId: null, startTime: currentTime, endTime: nextArrival });
        currentTime = nextArrival;
      }
    }

    const avgWait = procs.reduce((acc, p) => acc + p.waitingTime, 0) / procs.length;
    const avgTurn = procs.reduce((acc, p) => acc + p.turnaroundTime, 0) / procs.length;
    const avgResp = procs.reduce((acc, p) => acc + p.responseTime, 0) / procs.length;

    return { processes: procs, ganttChart, averageWaitingTime: avgWait, averageTurnaroundTime: avgTurn, averageResponseTime: avgResp };
  }

  addProcess(process: Process): void {
    this.queue.push(process);
    this.queue.sort((a, b) => a.arrivalTime - b.arrivalTime);
  }

  tick(currentTime: number): Process | null {
    const available = this.queue.filter(p => p.arrivalTime <= currentTime);
    return available.length > 0 ? available[0] : null;
  }

  removeProcess(processId: number): void {
    this.queue = this.queue.filter(p => p.id !== processId);
  }

  reset(): void {
    this.queue = [];
  }
}

