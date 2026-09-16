import { SimulationClock, EventBus } from './core';
import { ProcessManager, Process } from './process';
import { CPU } from "./cpu";
import type { IScheduler } from "./cpu";
import { MemoryManager } from './memory';
import { IOManager } from './io';
import { FileSystem } from './storage';

export class SimulationEngine {
  public clock: SimulationClock;
  public eventBus: EventBus;
  public processManager: ProcessManager;
  public cpu: CPU;
  public memoryManager: MemoryManager;
  public ioManager: IOManager;
  public fileSystem: FileSystem;

  constructor() {
    this.clock = new SimulationClock();
    this.eventBus = new EventBus();
    this.processManager = new ProcessManager(this.eventBus);
    this.cpu = new CPU(this.eventBus);
    this.memoryManager = new MemoryManager();
    this.ioManager = new IOManager();
    this.fileSystem = new FileSystem();
  }

  public tick(): void {
    this.clock.tick();
    const currentTime = this.clock.getTicks();
    
    // Check for newly arrived processes
    const allProcs = this.processManager.getAllProcesses();
    const newProcs = allProcs.filter(p => p.arrivalTime <= currentTime && p.state === 'NEW');
    
    newProcs.forEach(p => {
      p.setState('READY');
      this.cpu.addProcess(p);
      this.memoryManager.allocate(p.id, p.memoryRequired);
    });

    this.cpu.tick(currentTime);
  }

  public reset(): void {
    this.clock.reset();
    this.processManager.reset();
    this.cpu.reset();
    this.memoryManager.reset();
    this.ioManager.reset();
    this.fileSystem.reset();
  }

  public createProcess(name: string, arrivalTime: number, burstTime: number, priority: number = 0, ioBurstTime: number = 0, memoryRequired: number = 0): Process {
    return this.processManager.createProcess(name, arrivalTime, burstTime, priority, ioBurstTime, memoryRequired);
  }

  public setScheduler(scheduler: IScheduler): void {
    this.cpu.setScheduler(scheduler);
  }
}
