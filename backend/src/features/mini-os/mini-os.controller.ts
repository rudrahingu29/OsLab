import { Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { MiniOSService } from './mini-os.service';
import { AuthRequest } from '../../types';

// --- PROCESS CONTROLLERS ---
export const createProcess = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const { name, burstTime, priority } = req.body;

  const processDoc = await MiniOSService.createProcess(userId, name, Number(burstTime), priority);
  res.status(201).json({ success: true, data: processDoc });
});

export const getProcesses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const stateFilter = req.query.state ? String(req.query.state) : undefined;

  const processes = await MiniOSService.getProcesses(userId, stateFilter);
  res.json({ success: true, data: processes });
});

export const getProcessByPid = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const pid = parseInt(String(req.params.pid), 10);

  const processDoc = await MiniOSService.getProcessByPid(userId, pid);
  res.json({ success: true, data: processDoc });
});

export const readyProcess = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const pid = parseInt(String(req.params.pid), 10);

  const processDoc = await MiniOSService.transitionState(userId, pid, 'READY');
  res.json({ success: true, data: processDoc });
});

export const runProcess = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const pid = parseInt(String(req.params.pid), 10);

  const processDoc = await MiniOSService.transitionState(userId, pid, 'RUNNING');
  res.json({ success: true, data: processDoc });
});

export const waitProcess = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const pid = parseInt(String(req.params.pid), 10);

  const processDoc = await MiniOSService.transitionState(userId, pid, 'WAITING');
  res.json({ success: true, data: processDoc });
});

export const terminateProcess = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const pid = parseInt(String(req.params.pid), 10);

  const processDoc = await MiniOSService.transitionState(userId, pid, 'TERMINATED');
  res.json({ success: true, data: processDoc });
});

export const cpuTickProcess = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const pid = parseInt(String(req.params.pid), 10);

  const processDoc = await MiniOSService.cpuTick(userId, pid);
  res.json({ success: true, data: processDoc });
});

// --- MEMORY CONTROLLERS ---
export const getMemoryState = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const memoryState = await MiniOSService.getMemoryState(userId);
  res.json({ success: true, data: memoryState });
});

export const allocateMemory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const { pid, size } = req.body;

  const memoryState = await MiniOSService.allocateMemory(userId, Number(pid), Number(size));
  res.json({ success: true, data: memoryState });
});

export const freeMemory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const { pid } = req.body;

  const memoryState = await MiniOSService.freeMemory(userId, Number(pid));
  res.json({ success: true, data: memoryState });
});

// --- FILE SYSTEM CONTROLLERS ---
export const createFile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const { name, content } = req.body;

  const fileDoc = await MiniOSService.createFile(userId, name, content);
  res.status(201).json({ success: true, data: fileDoc });
});

export const getFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const files = await MiniOSService.getFiles(userId);
  res.json({ success: true, data: files });
});

export const getFileById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const fileId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const fileDoc = await MiniOSService.getFileById(userId, fileId);
  res.json({ success: true, data: fileDoc });
});

export const updateFile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const fileId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { name, content } = req.body;

  const fileDoc = await MiniOSService.updateFile(userId, fileId, name, content);
  res.json({ success: true, data: fileDoc });
});

export const deleteFile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const fileId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const result = await MiniOSService.deleteFile(userId, fileId);
  res.json({ success: true, data: result });
});

// --- SNAPSHOT & RESET CONTROLLERS ---
export const getStateSnapshot = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const snapshot = await MiniOSService.getStateSnapshot(userId);
  res.json({ success: true, data: snapshot });
});

export const resetEnvironment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId!;
  const result = await MiniOSService.resetEnvironment(userId);
  res.json({ success: true, data: result });
});
