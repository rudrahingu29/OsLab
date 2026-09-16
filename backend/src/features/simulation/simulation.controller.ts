import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { SchedulingService } from './scheduling/scheduling.service';
import { MemoryService } from './memory/memory.service';
import { PagingService } from './paging/paging.service';
import { DiskService } from './disk/disk.service';

// --- CPU Scheduling Controllers ---
export const runFCFSSimulation = asyncHandler(async (req: Request, res: Response) => {
  const { processes } = req.body;
  const result = SchedulingService.fcfs(processes);
  res.json({ success: true, data: result });
});

export const runSJFSimulation = asyncHandler(async (req: Request, res: Response) => {
  const { processes } = req.body;
  const result = SchedulingService.sjf(processes);
  res.json({ success: true, data: result });
});

export const runSRTFSimulation = asyncHandler(async (req: Request, res: Response) => {
  const { processes } = req.body;
  const result = SchedulingService.srtf(processes);
  res.json({ success: true, data: result });
});

export const runRoundRobinSimulation = asyncHandler(async (req: Request, res: Response) => {
  const { processes, timeQuantum } = req.body;
  const result = SchedulingService.roundRobin(processes, Number(timeQuantum));
  res.json({ success: true, data: result });
});

export const runPrioritySimulation = asyncHandler(async (req: Request, res: Response) => {
  const { processes, isPreemptive } = req.body;
  const result = SchedulingService.priority(processes, Boolean(isPreemptive));
  res.json({ success: true, data: result });
});

// --- Memory Allocation Controllers ---
export const runFirstFitSimulation = asyncHandler(async (req: Request, res: Response) => {
  const { blocks, processes } = req.body;
  const result = MemoryService.firstFit(blocks, processes);
  res.json({ success: true, data: result });
});

export const runBestFitSimulation = asyncHandler(async (req: Request, res: Response) => {
  const { blocks, processes } = req.body;
  const result = MemoryService.bestFit(blocks, processes);
  res.json({ success: true, data: result });
});

export const runWorstFitSimulation = asyncHandler(async (req: Request, res: Response) => {
  const { blocks, processes } = req.body;
  const result = MemoryService.worstFit(blocks, processes);
  res.json({ success: true, data: result });
});

export const runNextFitSimulation = asyncHandler(async (req: Request, res: Response) => {
  const { blocks, processes } = req.body;
  const result = MemoryService.nextFit(blocks, processes);
  res.json({ success: true, data: result });
});

// --- Page Replacement Controllers ---
export const runFIFOPagingSimulation = asyncHandler(async (req: Request, res: Response) => {
  const { referenceString, frameCount } = req.body;
  const result = PagingService.fifo(referenceString, Number(frameCount));
  res.json({ success: true, data: result });
});

export const runLRUPagingSimulation = asyncHandler(async (req: Request, res: Response) => {
  const { referenceString, frameCount } = req.body;
  const result = PagingService.lru(referenceString, Number(frameCount));
  res.json({ success: true, data: result });
});

export const runOptimalPagingSimulation = asyncHandler(async (req: Request, res: Response) => {
  const { referenceString, frameCount } = req.body;
  const result = PagingService.optimal(referenceString, Number(frameCount));
  res.json({ success: true, data: result });
});

// --- Disk Scheduling Controllers ---
export const runFCFSDiskSimulation = asyncHandler(async (req: Request, res: Response) => {
  const { requests, initialHead, diskSize, direction } = req.body;
  const result = DiskService.fcfs({ requests, initialHead, diskSize, direction });
  res.json({ success: true, data: result });
});

export const runSSTFDiskSimulation = asyncHandler(async (req: Request, res: Response) => {
  const { requests, initialHead, diskSize, direction } = req.body;
  const result = DiskService.sstf({ requests, initialHead, diskSize, direction });
  res.json({ success: true, data: result });
});

export const runSCANDiskSimulation = asyncHandler(async (req: Request, res: Response) => {
  const { requests, initialHead, diskSize, direction } = req.body;
  const result = DiskService.scan({ requests, initialHead, diskSize, direction });
  res.json({ success: true, data: result });
});

export const runCSCANDiskSimulation = asyncHandler(async (req: Request, res: Response) => {
  const { requests, initialHead, diskSize, direction } = req.body;
  const result = DiskService.cscan({ requests, initialHead, diskSize, direction });
  res.json({ success: true, data: result });
});

export const runLOOKDiskSimulation = asyncHandler(async (req: Request, res: Response) => {
  const { requests, initialHead, diskSize, direction } = req.body;
  const result = DiskService.look({ requests, initialHead, diskSize, direction });
  res.json({ success: true, data: result });
});

export const runCLOOKDiskSimulation = asyncHandler(async (req: Request, res: Response) => {
  const { requests, initialHead, diskSize, direction } = req.body;
  const result = DiskService.clook({ requests, initialHead, diskSize, direction });
  res.json({ success: true, data: result });
});
