export interface MemoryBlock {
  id: number;
  processId: number | null;
  start: number;
  size: number;
}

export class MemoryManager {
  private totalMemory: number;
  private blocks: MemoryBlock[];
  private nextBlockId: number = 1;

  constructor(totalMemory: number = 4096) {
    this.totalMemory = totalMemory;
    this.blocks = [{ id: this.nextBlockId++, processId: null, start: 0, size: totalMemory }];
  }

  public allocate(processId: number, size: number): boolean {
    // First fit
    const freeBlockIndex = this.blocks.findIndex(b => b.processId === null && b.size >= size);
    if (freeBlockIndex !== -1) {
      const freeBlock = this.blocks[freeBlockIndex];
      const newBlock: MemoryBlock = { id: this.nextBlockId++, processId, start: freeBlock.start, size };
      
      if (freeBlock.size === size) {
        this.blocks[freeBlockIndex] = newBlock;
      } else {
        freeBlock.start += size;
        freeBlock.size -= size;
        this.blocks.splice(freeBlockIndex, 0, newBlock);
      }
      return true;
    }
    return false;
  }

  public deallocate(processId: number): void {
    const blockIndex = this.blocks.findIndex(b => b.processId === processId);
    if (blockIndex !== -1) {
      this.blocks[blockIndex].processId = null;
      this.mergeFreeBlocks();
    }
  }

  private mergeFreeBlocks(): void {
    for (let i = 0; i < this.blocks.length - 1; i++) {
      if (this.blocks[i].processId === null && this.blocks[i+1].processId === null) {
        this.blocks[i].size += this.blocks[i+1].size;
        this.blocks.splice(i+1, 1);
        i--;
      }
    }
  }

  public getBlocks(): MemoryBlock[] {
    return this.blocks;
  }

  public reset(): void {
    this.blocks = [{ id: this.nextBlockId++, processId: null, start: 0, size: this.totalMemory }];
  }
}
