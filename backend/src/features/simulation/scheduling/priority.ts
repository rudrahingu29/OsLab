import { ProcessInput, ProcessMetrics, GanttSegment, SchedulingSimulationResult } from '../simulation.types';

export const runPriority = (
  inputs: ProcessInput[],
  isPreemptive: boolean = false
): SchedulingSimulationResult => {
  if (isPreemptive) {
    return runPreemptivePriority(inputs);
  } else {
    return runNonPreemptivePriority(inputs);
  }
};

const runNonPreemptivePriority = (inputs: ProcessInput[]): SchedulingSimulationResult => {
  const procs = inputs.map(p => ({
    ...p,
    priorityVal: p.priority !== undefined ? p.priority : Infinity,
    completed: false,
  }));

  const metricsMap = new Map<string | number, ProcessMetrics>();
  const ganttChart: GanttSegment[] = [];
  let currentTime = 0;
  let completedCount = 0;

  while (completedCount < procs.length) {
    const available = procs.filter(p => !p.completed && p.arrivalTime <= currentTime);

    if (available.length > 0) {
      // Pick process with lowest numerical priority; tie-break by arrivalTime then PID
      available.sort((a, b) => {
        if (a.priorityVal !== b.priorityVal) return a.priorityVal - b.priorityVal;
        if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
        return String(a.pid).localeCompare(String(b.pid));
      });

      const p = available[0];
      const startTime = currentTime;
      const completionTime = startTime + p.burstTime;
      const turnaroundTime = completionTime - p.arrivalTime;
      const waitingTime = turnaroundTime - p.burstTime;
      const responseTime = startTime - p.arrivalTime;

      ganttChart.push({
        pid: p.pid,
        startTime,
        endTime: completionTime,
      });

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

      p.completed = true;
      completedCount++;
      currentTime = completionTime;
    } else {
      const uncompleted = procs.filter(p => !p.completed);
      const nextArrival = Math.min(...uncompleted.map(p => p.arrivalTime));

      ganttChart.push({
        pid: null,
        startTime: currentTime,
        endTime: nextArrival,
      });

      currentTime = nextArrival;
    }
  }

  return formatResult('Priority (Non-Preemptive, Lower Number = Higher Priority)', inputs, metricsMap, ganttChart, currentTime);
};

const runPreemptivePriority = (inputs: ProcessInput[]): SchedulingSimulationResult => {
  interface PriorityProc {
    pid: string | number;
    arrivalTime: number;
    burstTime: number;
    priority?: number;
    priorityVal: number;
    remainingTime: number;
    firstRunTime: number | null;
    completionTime: number | null;
  }

  const procs: PriorityProc[] = inputs.map(p => ({
    ...p,
    priorityVal: p.priority !== undefined ? p.priority : Infinity,
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
      // Pick process with lowest numerical priority; tie-break by arrivalTime then PID
      available.sort((a, b) => {
        if (a.priorityVal !== b.priorityVal) return a.priorityVal - b.priorityVal;
        if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
        return String(a.pid).localeCompare(String(b.pid));
      });

      const currentProc = available[0];

      if (currentProc.firstRunTime === null) {
        currentProc.firstRunTime = currentTime;
      }

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

  return formatResult('Priority (Preemptive, Lower Number = Higher Priority)', inputs, metricsMap, ganttChart, currentTime);
};

const formatResult = (
  algorithmName: string,
  inputs: ProcessInput[],
  metricsMap: Map<string | number, ProcessMetrics>,
  ganttChart: GanttSegment[],
  totalExecutionTime: number
): SchedulingSimulationResult => {
  const processes = inputs.map(p => metricsMap.get(p.pid)!);
  const busyTime = processes.reduce((acc, p) => acc + p.burstTime, 0);
  const cpuUtilization = totalExecutionTime > 0 ? (busyTime / totalExecutionTime) * 100 : 0;
  const throughput = totalExecutionTime > 0 ? processes.length / totalExecutionTime : 0;

  const averageWaitingTime = processes.reduce((acc, p) => acc + p.waitingTime, 0) / processes.length;
  const averageTurnaroundTime = processes.reduce((acc, p) => acc + p.turnaroundTime, 0) / processes.length;
  const averageResponseTime = processes.reduce((acc, p) => acc + p.responseTime, 0) / processes.length;

  return {
    algorithm: algorithmName,
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
