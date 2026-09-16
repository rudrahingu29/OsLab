import mongoose from 'mongoose';
import { MiniOSProcess, IMiniOSProcess } from './mini-os.process.model';
import { MiniOSMemory, IMiniOSMemory } from './mini-os.memory.model';
import { MiniOSFile, IMiniOSFile } from './mini-os.file.model';
import { ProcessState, MiniOSMemoryState, MiniOSStateSnapshot } from './mini-os.types';
import { ApiError } from '../../utils/ApiError';

const ALLOWED_TRANSITIONS: Record<ProcessState, ProcessState[]> = {
  NEW: ['READY'],
  READY: ['RUNNING', 'TERMINATED'],
  RUNNING: ['WAITING', 'TERMINATED'],
  WAITING: ['READY'],
  TERMINATED: [],
};

export class MiniOSService {
  // --- PROCESS OPERATIONS ---

  private static async getNextPid(userId: string): Promise<number> {
    const userObjId = new mongoose.Types.ObjectId(userId);
    const lastProcess = await MiniOSProcess.findOne({ userId: userObjId })
      .sort({ pid: -1 })
      .select('pid');

    return lastProcess ? lastProcess.pid + 1 : 1;
  }

  public static async createProcess(
    userId: string,
    name: string,
    burstTime: number,
    priority: number = 5
  ): Promise<IMiniOSProcess> {
    const userObjId = new mongoose.Types.ObjectId(userId);
    const pid = await this.getNextPid(userId);

    try {
      const processDoc = await MiniOSProcess.create({
        userId: userObjId,
        pid,
        name: name.trim(),
        state: 'NEW',
        priority,
        burstTime,
        remainingTime: burstTime,
      });

      return processDoc;
    } catch (err: any) {
      // In case of rare PID collision during concurrent creation, retry once with max PID
      if (err.code === 11000) {
        const retryPid = (await this.getNextPid(userId)) + 1;
        return await MiniOSProcess.create({
          userId: userObjId,
          pid: retryPid,
          name: name.trim(),
          state: 'NEW',
          priority,
          burstTime,
          remainingTime: burstTime,
        });
      }
      throw err;
    }
  }

  public static async getProcesses(userId: string, stateFilter?: string): Promise<IMiniOSProcess[]> {
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    if (stateFilter) {
      query.state = String(stateFilter).toUpperCase();
    }
    return MiniOSProcess.find(query).sort({ pid: 1 });
  }

  public static async getProcessByPid(userId: string, pid: number): Promise<IMiniOSProcess> {
    const processDoc = await MiniOSProcess.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      pid,
    });

    if (!processDoc) {
      throw new ApiError(404, 'Process not found');
    }

    return processDoc;
  }

  public static async transitionState(
    userId: string,
    pid: number,
    targetState: ProcessState
  ): Promise<IMiniOSProcess> {
    const processDoc = await this.getProcessByPid(userId, pid);

    if (processDoc.state === targetState) {
      return processDoc;
    }

    const allowed = ALLOWED_TRANSITIONS[processDoc.state] || [];
    if (!allowed.includes(targetState)) {
      throw new ApiError(
        400,
        `Invalid state transition from ${processDoc.state} to ${targetState}`
      );
    }

    processDoc.state = targetState;
    await processDoc.save();

    return processDoc;
  }

  public static async cpuTick(userId: string, pid: number): Promise<IMiniOSProcess> {
    const processDoc = await this.getProcessByPid(userId, pid);

    if (processDoc.state !== 'RUNNING') {
      throw new ApiError(
        400,
        `Cannot execute CPU tick on process in ${processDoc.state} state (process must be RUNNING)`
      );
    }

    if (processDoc.remainingTime <= 0) {
      processDoc.state = 'TERMINATED';
      await processDoc.save();
      return processDoc;
    }

    processDoc.remainingTime = Math.max(0, processDoc.remainingTime - 1);

    if (processDoc.remainingTime === 0) {
      processDoc.state = 'TERMINATED';
    }

    await processDoc.save();
    return processDoc;
  }

  // --- MEMORY OPERATIONS ---

  public static async getMemoryState(userId: string): Promise<MiniOSMemoryState> {
    const userObjId = new mongoose.Types.ObjectId(userId);
    let memDoc = await MiniOSMemory.findOne({ userId: userObjId });

    if (!memDoc) {
      memDoc = await MiniOSMemory.create({ userId: userObjId, totalMemory: 1024, allocations: [] });
    }

    const totalMemory = memDoc.totalMemory || 1024;
    const allocatedMemory = memDoc.allocations.reduce((sum, item) => sum + item.size, 0);
    const freeMemory = Math.max(0, totalMemory - allocatedMemory);

    return {
      totalMemory,
      allocatedMemory,
      freeMemory,
      unit: 'MB',
      allocations: memDoc.allocations.map(a => ({
        pid: a.pid,
        size: a.size,
        allocatedAt: a.allocatedAt,
      })),
    };
  }

  public static async allocateMemory(
    userId: string,
    pid: number,
    size: number
  ): Promise<MiniOSMemoryState> {
    const processDoc = await this.getProcessByPid(userId, pid);

    if (processDoc.state === 'TERMINATED') {
      throw new ApiError(400, `Cannot allocate memory to a TERMINATED process (PID ${pid})`);
    }

    const memoryState = await this.getMemoryState(userId);

    const hasActiveAllocation = memoryState.allocations.some(a => a.pid === pid);
    if (hasActiveAllocation) {
      throw new ApiError(400, `Process PID ${pid} already has an active memory allocation`);
    }

    if (size > memoryState.freeMemory) {
      throw new ApiError(
        400,
        `Insufficient memory. Requested: ${size} MB, Available: ${memoryState.freeMemory} MB`
      );
    }

    const userObjId = new mongoose.Types.ObjectId(userId);
    await MiniOSMemory.findOneAndUpdate(
      { userId: userObjId },
      { $push: { allocations: { pid, size, allocatedAt: new Date() } } },
      { upsert: true, new: true }
    );

    return this.getMemoryState(userId);
  }

  public static async freeMemory(userId: string, pid: number): Promise<MiniOSMemoryState> {
    const userObjId = new mongoose.Types.ObjectId(userId);
    await MiniOSMemory.findOneAndUpdate(
      { userId: userObjId },
      { $pull: { allocations: { pid } } },
      { new: true }
    );

    return this.getMemoryState(userId);
  }

  // --- FILE SYSTEM OPERATIONS ---

  public static async createFile(
    userId: string,
    name: string,
    content: string = ''
  ): Promise<IMiniOSFile> {
    const userObjId = new mongoose.Types.ObjectId(userId);
    const size = Buffer.byteLength(content || '', 'utf-8');

    const existingFile = await MiniOSFile.findOne({ userId: userObjId, name: name.trim() });
    if (existingFile) {
      throw new ApiError(400, `File "${name.trim()}" already exists`);
    }

    return MiniOSFile.create({
      userId: userObjId,
      name: name.trim(),
      content: content || '',
      size,
    });
  }

  public static async getFiles(userId: string): Promise<IMiniOSFile[]> {
    return MiniOSFile.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 });
  }

  public static async getFileById(userId: string, fileId: string): Promise<IMiniOSFile> {
    const fileDoc = await MiniOSFile.findOne({
      _id: fileId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!fileDoc) {
      throw new ApiError(404, 'File not found');
    }

    return fileDoc;
  }

  public static async updateFile(
    userId: string,
    fileId: string,
    name?: string,
    content?: string
  ): Promise<IMiniOSFile> {
    const fileDoc = await this.getFileById(userId, fileId);

    if (name !== undefined && name.trim() !== fileDoc.name) {
      const existingName = await MiniOSFile.findOne({
        userId: fileDoc.userId,
        name: name.trim(),
        _id: { $ne: fileDoc._id },
      });
      if (existingName) {
        throw new ApiError(400, `File "${name.trim()}" already exists`);
      }
      fileDoc.name = name.trim();
    }

    if (content !== undefined) {
      fileDoc.content = content;
      fileDoc.size = Buffer.byteLength(content, 'utf-8');
    }

    await fileDoc.save();
    return fileDoc;
  }

  public static async deleteFile(userId: string, fileId: string): Promise<{ message: string }> {
    const fileDoc = await MiniOSFile.findOneAndDelete({
      _id: fileId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!fileDoc) {
      throw new ApiError(404, 'File not found');
    }

    return { message: 'File deleted successfully' };
  }

  // --- CONSOLIDATED SNAPSHOT & RESET ---

  public static async getStateSnapshot(userId: string): Promise<MiniOSStateSnapshot> {
    const [processes, memoryState, files] = await Promise.all([
      this.getProcesses(userId),
      this.getMemoryState(userId),
      this.getFiles(userId),
    ]);

    const stats = {
      totalProcesses: processes.length,
      newProcesses: processes.filter(p => p.state === 'NEW').length,
      readyProcesses: processes.filter(p => p.state === 'READY').length,
      runningProcesses: processes.filter(p => p.state === 'RUNNING').length,
      waitingProcesses: processes.filter(p => p.state === 'WAITING').length,
      terminatedProcesses: processes.filter(p => p.state === 'TERMINATED').length,
    };

    return {
      processes,
      memory: memoryState,
      files,
      stats,
    };
  }

  public static async resetEnvironment(userId: string): Promise<{ message: string }> {
    const userObjId = new mongoose.Types.ObjectId(userId);

    await Promise.all([
      MiniOSProcess.deleteMany({ userId: userObjId }),
      MiniOSFile.deleteMany({ userId: userObjId }),
      MiniOSMemory.findOneAndUpdate(
        { userId: userObjId },
        { $set: { allocations: [] } },
        { upsert: true }
      ),
    ]);

    return { message: 'Mini OS environment reset successfully' };
  }
}
