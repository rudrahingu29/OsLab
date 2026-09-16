import type { IScheduler } from '../../simulation/cpu/Scheduler';
import type { ProcessControlBlock, SchedulingResult, GanttItem } from '../../types/simulation';
import { Process } from '../../simulation/process/Process';

export class RoundRobinScheduler implements IScheduler {
  name = 'Round Robin';
  private quantum: number;
  private queue: Process[] = [];
  private currentQuantum: number = 0;
  private currentProcessId: number | null = null;

  constructor(quantum: number = 2) {
    this.quantum = quantum;
  }

  schedule(processes: ProcessControlBlock[]): SchedulingResult {
    const procs = processes.map(p => ({ ...p, remainingTime: p.burstTime }));
    const ganttChart: GanttItem[] = [];
    let currentTime = 0;
    let completed = 0;
    const readyQueue: ProcessControlBlock[] = [];
    const inQueue = new Set<number>();

    // Initial arrivals at time 0
    procs.filter(p => p.arrivalTime === 0).forEach(p => {
      readyQueue.push(p);
      inQueue.add(p.id);
    });

    while (completed < procs.length) {
      if (readyQueue.length > 0) {
        const p = readyQueue.shift()!;
        
        if (p.firstRunTime === null || p.firstRunTime === undefined) {
          p.firstRunTime = currentTime;
          p.responseTime = currentTime - p.arrivalTime;
        }

        const runTime = Math.min(p.remainingTime, this.quantum);
        const start = currentTime;
        
        currentTime += runTime;
        p.remainingTime -= runTime;

        ganttChart.push({ processId: p.id, startTime: start, endTime: currentTime });

        // Add new arrivals
        procs.filter(newP => newP.arrivalTime > start && newP.arrivalTime <= currentTime && !inQueue.has(newP.id)).forEach(newP => {
          readyQueue.push(newP);
          inQueue.add(newP.id);
        });

        if (p.remainingTime === 0) {
          p.completionTime = currentTime;
          p.turnaroundTime = p.completionTime - p.arrivalTime;
          p.waitingTime = p.turnaroundTime - p.burstTime;
          completed++;
        } else {
          readyQueue.push(p);
        }

      } else {
        const nextArrival = procs.filter(p => !inQueue.has(p.id)).reduce((min, p) => p.arrivalTime < min ? p.arrivalTime : min, Infinity);
        if (nextArrival !== Infinity) {
          currentTime = nextArrival;
          procs.filter(p => p.arrivalTime === currentTime).forEach(p => {
            readyQueue.push(p);
            inQueue.add(p.id);
          });
        }
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
    if (!this.queue.find(p => p.id === process.id)) {
      this.queue.push(process);
    }
  }

  tick(currentTime: number): Process | null {
    const available = this.queue.filter(p => p.arrivalTime <= currentTime);
    
    if (available.length === 0) {
      this.currentProcessId = null;
      this.currentQuantum = 0;
      return null;
    }

    let p = available.find(p => p.id === this.currentProcessId);
    
    if (p) {
      if (this.currentQuantum < this.quantum && p.remainingTime > 0) {
        this.currentQuantum++;
        return p;
      }
      // Quantum expired or process done, move to back of queue
      this.queue = this.queue.filter(proc => proc.id !== p!.id);
      if (p.remainingTime > 0) {
        this.queue.push(p);
      }
    }

    const newAvailable = this.queue.filter(proc => proc.arrivalTime <= currentTime);
    if (newAvailable.length > 0) {
      const nextProc = newAvailable[0];
      this.currentProcessId = nextProc.id;
      this.currentQuantum = 1;
      return nextProc;
    }

    this.currentProcessId = null;
    this.currentQuantum = 0;
    return null;
  }

  removeProcess(processId: number): void {
    this.queue = this.queue.filter(p => p.id !== processId);
    if (this.currentProcessId === processId) {
      this.currentProcessId = null;
      this.currentQuantum = 0;
    }
  }

  reset(): void {
    this.queue = [];
    this.currentQuantum = 0;
    this.currentProcessId = null;
  }
}

