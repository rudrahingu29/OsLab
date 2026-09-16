import type { IScheduler } from '../../simulation/cpu/Scheduler';
import type { ProcessControlBlock, SchedulingResult, GanttItem } from '../../types/simulation';
import { Process } from '../../simulation/process/Process';

export class PriorityScheduler implements IScheduler {
  name = 'Priority'; // Preemptive priority
  private queue: Process[] = [];

  schedule(processes: ProcessControlBlock[]): SchedulingResult {
    const procs = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
    const ganttChart: GanttItem[] = [];
    let currentTime = 0;
    let completed = 0;
    let currentProcessId: number | null = null;
    let currentStart = 0;

    while (completed < procs.length) {
      const available = procs.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);
      
      if (available.length > 0) {
        // Lower number means higher priority
        available.sort((a, b) => {
          if (a.priority === b.priority) {
            return a.arrivalTime - b.arrivalTime;
          }
          return (a.priority ?? 0) - (b.priority ?? 0);
        });
        
        const p = available[0];

        if (currentProcessId !== p.id) {
          if (currentProcessId !== null) {
            ganttChart.push({ processId: currentProcessId, startTime: currentStart, endTime: currentTime });
          }
          currentProcessId = p.id;
          currentStart = currentTime;
        }

        if (p.firstRunTime === null || p.firstRunTime === undefined) {
          p.firstRunTime = currentTime;
          p.responseTime = currentTime - p.arrivalTime;
        }

        currentTime++;
        p.remainingTime--;

        if (p.remainingTime === 0) {
          p.completionTime = currentTime;
          p.turnaroundTime = p.completionTime - p.arrivalTime;
          p.waitingTime = p.turnaroundTime - p.burstTime;
          completed++;
          
          ganttChart.push({ processId: currentProcessId, startTime: currentStart, endTime: currentTime });
          currentProcessId = null;
        }
      } else {
        if (currentProcessId !== null) {
          ganttChart.push({ processId: currentProcessId, startTime: currentStart, endTime: currentTime });
          currentProcessId = null;
        }
        currentTime++;
      }
    }

    const mergedGantt: GanttItem[] = [];
    for (const item of ganttChart) {
      if (mergedGantt.length > 0) {
        const last = mergedGantt[mergedGantt.length - 1];
        if (last.processId === item.processId && last.endTime === item.startTime) {
          last.endTime = item.endTime;
          continue;
        }
      }
      mergedGantt.push(item);
    }

    const avgWait = procs.reduce((acc, p) => acc + p.waitingTime, 0) / procs.length;
    const avgTurn = procs.reduce((acc, p) => acc + p.turnaroundTime, 0) / procs.length;
    const avgResp = procs.reduce((acc, p) => acc + p.responseTime, 0) / procs.length;

    return { processes: procs, ganttChart: mergedGantt, averageWaitingTime: avgWait, averageTurnaroundTime: avgTurn, averageResponseTime: avgResp };
  }

  addProcess(process: Process): void {
    this.queue.push(process);
  }

  tick(currentTime: number): Process | null {
    const available = this.queue.filter(p => p.arrivalTime <= currentTime);
    if (available.length === 0) return null;
    available.sort((a, b) => {
      if (a.priority === b.priority) return a.arrivalTime - b.arrivalTime;
      return (a.priority ?? 0) - (b.priority ?? 0);
    });
    return available[0];
  }

  removeProcess(processId: number): void {
    this.queue = this.queue.filter(p => p.id !== processId);
  }

  reset(): void {
    this.queue = [];
  }
}

