import { ProcessInput, ProcessMetrics, GanttSegment, SchedulingSimulationResult } from '../simulation.types';

export const runSJF = (inputs: ProcessInput[]): SchedulingSimulationResult => {
  const procs = inputs.map(p => ({
    ...p,
    completed: false,
  }));

  const metricsMap = new Map<string | number, ProcessMetrics>();
  const ganttChart: GanttSegment[] = [];
  let currentTime = 0;
  let completedCount = 0;

  while (completedCount < procs.length) {
    const available = procs.filter(p => !p.completed && p.arrivalTime <= currentTime);

    if (available.length > 0) {
      // Pick process with smallest burstTime; tie-break by arrivalTime then PID
      available.sort((a, b) => {
        if (a.burstTime !== b.burstTime) return a.burstTime - b.burstTime;
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
      // CPU Idle: find next process arrival time
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

  const processes = inputs.map(p => metricsMap.get(p.pid)!);
  const totalExecutionTime = currentTime;
  const busyTime = processes.reduce((acc, p) => acc + p.burstTime, 0);
  const cpuUtilization = totalExecutionTime > 0 ? (busyTime / totalExecutionTime) * 100 : 0;
  const throughput = totalExecutionTime > 0 ? processes.length / totalExecutionTime : 0;

  const averageWaitingTime = processes.reduce((acc, p) => acc + p.waitingTime, 0) / processes.length;
  const averageTurnaroundTime = processes.reduce((acc, p) => acc + p.turnaroundTime, 0) / processes.length;
  const averageResponseTime = processes.reduce((acc, p) => acc + p.responseTime, 0) / processes.length;

  return {
    algorithm: 'Shortest Job First (SJF - Non-Preemptive)',
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
