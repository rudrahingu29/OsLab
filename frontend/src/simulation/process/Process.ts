import type { ProcessControlBlock, ProcessState } from '../../types/simulation';

export class Process implements ProcessControlBlock {
  public id: number;
  public name: string;
  public state: ProcessState;
  public arrivalTime: number;
  public burstTime: number;
  public remainingTime: number;
  public priority: number;
  public waitingTime: number;
  public turnaroundTime: number;
  public responseTime: number;
  public firstRunTime: number | null;
  public completionTime: number | null;
  public ioBurstTime: number;
  public ioRemainingTime: number;
  public memoryRequired: number;

  constructor(
    id: number,
    name: string,
    arrivalTime: number,
    burstTime: number,
    priority: number = 0,
    ioBurstTime: number = 0,
    memoryRequired: number = 0
  ) {
    this.id = id;
    this.name = name;
    this.state = 'NEW';
    this.arrivalTime = arrivalTime;
    this.burstTime = burstTime;
    this.remainingTime = burstTime;
    this.priority = priority;
    this.waitingTime = 0;
    this.turnaroundTime = 0;
    this.responseTime = -1;
    this.firstRunTime = null;
    this.completionTime = null;
    this.ioBurstTime = ioBurstTime;
    this.ioRemainingTime = ioBurstTime;
    this.memoryRequired = memoryRequired;
  }

  public setState(newState: ProcessState): void {
    // Basic state machine validation
    const validTransitions: Record<ProcessState, ProcessState[]> = {
      'NEW': ['READY'],
      'READY': ['RUNNING'],
      'RUNNING': ['READY', 'WAITING', 'TERMINATED'],
      'WAITING': ['READY'],
      'TERMINATED': []
    };

    if (validTransitions[this.state].includes(newState)) {
      this.state = newState;
    } else {
      console.warn(`Invalid state transition from ${this.state} to ${newState}`);
      // Still set it for flexibility but warn
      this.state = newState;
    }
  }

  public clone(): Process {
    const p = new Process(
      this.id,
      this.name,
      this.arrivalTime,
      this.burstTime,
      this.priority,
      this.ioBurstTime,
      this.memoryRequired
    );
    p.state = this.state;
    p.remainingTime = this.remainingTime;
    p.waitingTime = this.waitingTime;
    p.turnaroundTime = this.turnaroundTime;
    p.responseTime = this.responseTime;
    p.firstRunTime = this.firstRunTime;
    p.completionTime = this.completionTime;
    p.ioRemainingTime = this.ioRemainingTime;
    return p;
  }
}
