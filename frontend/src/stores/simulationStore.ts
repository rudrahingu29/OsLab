import { create } from 'zustand';
import { SimulationEngine } from '../simulation';
import type { ProcessControlBlock, SystemEvent } from '../types/simulation';
import type { IScheduler } from '../simulation/cpu';

interface SimulationState {
  engine: SimulationEngine;
  ticks: number;
  processes: ProcessControlBlock[];
  events: SystemEvent[];
  isRunning: boolean;
  tick: () => void;
  reset: () => void;
  toggleRun: () => void;
  createProcess: (name: string, arrivalTime: number, burstTime: number, priority?: number, ioBurstTime?: number, memoryRequired?: number) => void;
  setScheduler: (scheduler: IScheduler) => void;
  getScheduler: () => IScheduler | null;
}

import { FCFSScheduler } from '../algorithms/scheduling/fcfs';

const engine = new SimulationEngine();
engine.setScheduler(new FCFSScheduler());

export const useSimulationStore = create<SimulationState>((set, get) => {
  engine.eventBus.subscribe('PROCESS_CREATED', () => {
    set({ processes: engine.processManager.getAllProcesses().map(p => p.clone()) });
  });


  engine.eventBus.subscribe('CONTEXT_SWITCH', (e) => {
    set({ events: [...get().events, e] });
  });

  return {
    engine,
    ticks: 0,
    processes: [],
    events: [],
    isRunning: false,
    
    tick: () => {
      const { engine } = get();
      engine.tick();
      set({ 
        ticks: engine.clock.getTicks(),
        processes: engine.processManager.getAllProcesses().map(p => p.clone())
      });
    },
    
    reset: () => {
      const { engine } = get();
      engine.reset();
      set({ 
        ticks: 0, 
        processes: [], 
        events: [],
        isRunning: false
      });
    },
    
    toggleRun: () => set(state => ({ isRunning: !state.isRunning })),
    
    createProcess: (name, arrivalTime, burstTime, priority = 0, ioBurstTime = 0, memoryRequired = 0) => {
      const { engine, ticks } = get();
      // Use current simulation clock tick as arrival time if arrivalTime is 0 or omitted
      const finalArrivalTime = (arrivalTime === undefined || arrivalTime === 0) ? ticks : arrivalTime;
      engine.createProcess(name, finalArrivalTime, burstTime, priority, ioBurstTime, memoryRequired);
      set({ processes: engine.processManager.getAllProcesses().map(p => p.clone()) });
    },
    
    setScheduler: (scheduler) => {
      const { engine } = get();
      engine.setScheduler(scheduler);
    },
    
    getScheduler: () => {
      return get().engine.cpu.getScheduler();
    }
  };
});
