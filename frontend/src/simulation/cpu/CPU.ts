import type { IScheduler } from './Scheduler';
import { Process } from '../process/Process';
import { EventBus } from '../core/EventBus';

export class CPU {
  private scheduler: IScheduler | null = null;
  private currentProcess: Process | null = null;
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  public setScheduler(scheduler: IScheduler): void {
    this.scheduler = scheduler;
  }

  public getScheduler(): IScheduler | null {
    return this.scheduler;
  }

  public addProcess(process: Process): void {
    if (this.scheduler) {
      this.scheduler.addProcess(process);
    }
  }

  public tick(currentTime: number): void {
    if (!this.scheduler) return;

    const nextProcess = this.scheduler.tick(currentTime);
    
    if (nextProcess !== this.currentProcess) {
      if (this.currentProcess && this.currentProcess.state === 'RUNNING') {
        this.currentProcess.setState('READY');
      }
      this.currentProcess = nextProcess;
      if (this.currentProcess) {
        if (this.currentProcess.firstRunTime === null) {
          this.currentProcess.firstRunTime = currentTime;
          this.currentProcess.responseTime = currentTime - this.currentProcess.arrivalTime;
        }
        this.currentProcess.setState('RUNNING');
      }
      this.eventBus.emit({
        type: 'CONTEXT_SWITCH',
        payload: { processId: this.currentProcess?.id ?? null },
        timestamp: currentTime
      });
    }

    if (this.currentProcess) {
      this.currentProcess.remainingTime--;
      if (this.currentProcess.remainingTime <= 0) {
        this.currentProcess.setState('TERMINATED');
        this.currentProcess.completionTime = currentTime + 1;
        this.currentProcess.turnaroundTime = this.currentProcess.completionTime - this.currentProcess.arrivalTime;
        this.currentProcess.waitingTime = this.currentProcess.turnaroundTime - this.currentProcess.burstTime;
        
        this.scheduler.removeProcess(this.currentProcess.id);
        this.currentProcess = null;
      }
    }
  }

  public removeProcess(processId: number): void {
    if (this.scheduler) {
      this.scheduler.removeProcess(processId);
    }
    if (this.currentProcess?.id === processId) {
      this.currentProcess = null;
    }
  }

  public reset(): void {
    this.scheduler?.reset();
    this.currentProcess = null;
  }
}
