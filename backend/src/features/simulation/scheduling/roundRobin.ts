import { ProcessInput, ProcessMetrics, GanttSegment, SchedulingSimulationResult } from '../simulation.types';

export const runRoundRobin = (inputs: ProcessInput[], timeQuantum: number): SchedulingSimulationResult => {
  interface RRProcess {
    pid: string | number;
    arrivalTime: number;
    burstTime: number;
    priority?: number;
    remainingTime: number;
    firstRunTime: number | null;
    completionTime: number | null;
    inQueue: boolean;
  }

  // Sort initial processes by arrival time, then by PID
  const procs: RRProcess[] = inputs.map(p => ({
    ...p,
    remainingTime: p.burstTime,
    firstRunTime: null,
    completionTime: null,
    inQueue: false,
  })).sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return String(a.pid).localeCompare(String(b.pid));
  });

  const readyQueue: RRProcess[] = [];
  const ganttChart: GanttSegment[] = [];
  let currentTime = 0;
  let completedCount = 0;
  const totalProcesses = procs.length;

  // Add initial arrived processes at t = 0
  for (const p of procs) {
    if (p.arrivalTime <= currentTime && !p.inQueue) {
      readyQueue.push(p);
      p.inQueue = true;
    }
  }

  while (completedCount < totalProcesses) {
    if (readyQueue.length > 0) {
      const p = readyQueue.shift()!;
      p.inQueue = false;

      if (p.firstRunTime === null) {
        p.firstRunTime = currentTime;
      }

      const executionTime = Math.min(p.remainingTime, timeQuantum);
      const startTime = currentTime;
      const endTime = startTime + executionTime;

      // Add to Gantt chart (merge contiguous segments if same PID)
      const lastSegment = ganttChart[ganttChart.length - 1];
      if (lastSegment && lastSegment.pid === p.pid) {
        lastSegment.endTime = endTime;
      } else {
        ganttChart.push({
          pid: p.pid,
          startTime,
          endTime,
        });
      }

      p.remainingTime -= executionTime;
      currentTime = endTime;

      // Check for processes that arrived during execution [startTime + 1, currentTime]
      for (const unqueued of procs) {
        if (
          unqueued.pid !== p.pid &&
          unqueued.remainingTime > 0 &&
          !unqueued.inQueue &&
          unqueued.arrivalTime <= currentTime
        ) {
          readyQueue.push(unqueued);
          unqueued.inQueue = true;
        }
      }

      if (p.remainingTime > 0) {
        readyQueue.push(p);
        p.inQueue = true;
      } else {
        p.completionTime = currentTime;
        completedCount++;
      }
    } else {
      // Ready queue is empty; find next process arrival time
      const uncompleted = procs.filter(p => p.remainingTime > 0);
      const nextArrival = Math.min(...uncompleted.map(p => p.arrivalTime));

      ganttChart.push({
        pid: null,
        startTime: currentTime,
        endTime: nextArrival,
      });

      currentTime = nextArrival;

      for (const p of procs) {
        if (p.arrivalTime <= currentTime && p.remainingTime > 0 && !p.inQueue) {
          readyQueue.push(p);
          p.inQueue = true;
        }
      }
    }
  }

  const metricsMap = new Map<string | number, ProcessMetrics>();
  for (const p of procs) {
    const completionTime = p.completionTime!;
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    const responseTime = p.firstRunTime! - p.arrivalTime;

    metricsMap.set(p.pid, {
      pid: p.pid,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    });
  }

  const processes = inputs.map(p => metricsMap.get(p.pid)!);
  const totalExecutionTime = currentTime;
  const busyTime = processes.reduce((acc, p) => acc + p.burstTime, 0);
  const cpuUtilization = totalExecutionTime > 0 ? (busyTime / totalExecutionTime) * 100 : 0;
  const throughput = totalExecutionTime > 0 ? processes.length / totalExecutionTime : 0;

  const averageWaitingTime = processes.reduce((acc, p) => acc + p.waitingTime, 0) / processes.length;
  const averageTurnaroundTime = processes.reduce((acc, p) => acc + p.turnaroundTime, 0) / processes.length;
  const averageResponseTime = processes.reduce((acc, p) => acc + p.responseTime, 0) / processes.length;

  return {
    algorithm: `Round Robin (RR, Quantum=${timeQuantum})`,
    processes,
    ganttChart,
    metrics: {
      averageWaitingTime,
      averageTurnaroundTime,
      averageResponseTime,
      totalExecutionTime,
      cpuUtilization: Math.round(cpuUtilization * 100) / 100,
      throughput: Math.round(throughput * 10000) / 10000,
    },
  };
};
