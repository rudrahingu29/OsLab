import { ProcessInput, ProcessMetrics, GanttSegment, SchedulingSimulationResult } from '../simulation.types';

export const runSRTF = (inputs: ProcessInput[]): SchedulingSimulationResult => {
  interface SRTFProcess {
    pid: string | number;
    arrivalTime: number;
    burstTime: number;
    priority?: number;
    remainingTime: number;
    firstRunTime: number | null;
    completionTime: number | null;
  }

  const procs: SRTFProcess[] = inputs.map(p => ({
    ...p,
    remainingTime: p.burstTime,
    firstRunTime: null,
    completionTime: null,
  }));

  const ganttChart: GanttSegment[] = [];
  let currentTime = 0;
  let completedCount = 0;
  const totalProcesses = procs.length;

  while (completedCount < totalProcesses) {
    const available = procs.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);

    if (available.length > 0) {
      // Pick process with minimum remainingTime; tie-break by arrivalTime then PID
      available.sort((a, b) => {
        if (a.remainingTime !== b.remainingTime) return a.remainingTime - b.remainingTime;
        if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
        return String(a.pid).localeCompare(String(b.pid));
      });

      const currentProc = available[0];

      if (currentProc.firstRunTime === null) {
        currentProc.firstRunTime = currentTime;
      }

      // Record slice in Gantt chart
      const lastSegment = ganttChart[ganttChart.length - 1];
      if (lastSegment && lastSegment.pid === currentProc.pid) {
        lastSegment.endTime += 1;
      } else {
        ganttChart.push({
          pid: currentProc.pid,
          startTime: currentTime,
          endTime: currentTime + 1,
        });
      }

      currentProc.remainingTime -= 1;
      currentTime += 1;

      if (currentProc.remainingTime === 0) {
        currentProc.completionTime = currentTime;
        completedCount++;
      }
    } else {
      // CPU Idle for 1 unit of time
      const lastSegment = ganttChart[ganttChart.length - 1];
      if (lastSegment && lastSegment.pid === null) {
        lastSegment.endTime += 1;
      } else {
        ganttChart.push({
          pid: null,
          startTime: currentTime,
          endTime: currentTime + 1,
        });
      }
      currentTime += 1;
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
    algorithm: 'Shortest Remaining Time First (SRTF - Preemptive SJF)',
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
