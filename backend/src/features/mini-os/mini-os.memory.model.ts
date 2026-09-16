import mongoose, { Document, Schema } from 'mongoose';

export interface IMiniOSMemoryAllocation {
  pid: number;
  size: number;
  allocatedAt: Date;
}

export interface IMiniOSMemory extends Document {
  userId: mongoose.Types.ObjectId;
  totalMemory: number;
  allocations: IMiniOSMemoryAllocation[];
  updatedAt: Date;
}

const memoryAllocationSchema = new Schema(
  {
    pid: { type: Number, required: true },
    size: { type: Number, required: true, min: 1 },
    allocatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const miniOSMemorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    totalMemory: { type: Number, default: 1024 },
    allocations: [memoryAllocationSchema],
  },
  { timestamps: true }
);

export const MiniOSMemory = mongoose.model<IMiniOSMemory>('MiniOSMemory', miniOSMemorySchema);
