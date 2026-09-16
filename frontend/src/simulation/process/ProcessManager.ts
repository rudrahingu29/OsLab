import { Process } from './Process';
import { EventBus } from '../core/EventBus';

export class ProcessManager {
  private processes: Map<number, Process> = new Map();
  private nextPid: number = 1;
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  public createProcess(
    name: string,
    arrivalTime: number,
    burstTime: number,
    priority: number = 0,
    ioBurstTime: number = 0,
    memoryRequired: number = 0
  ): Process {
    const process = new Process(this.nextPid++, name, arrivalTime, burstTime, priority, ioBurstTime, memoryRequired);
    this.processes.set(process.id, process);
    this.eventBus.emit({ type: 'PROCESS_CREATED', payload: { process: process.clone() }, timestamp: 0 });
    return process;
  }

  public getProcess(id: number): Process | undefined {
    return this.processes.get(id);
  }

  public getAllProcesses(): Process[] {
    return Array.from(this.processes.values());
  }

  public removeProcess(id: number): void {
    this.processes.delete(id);
  }

  public reset(): void {
    this.processes.clear();
    this.nextPid = 1;
  }
}
