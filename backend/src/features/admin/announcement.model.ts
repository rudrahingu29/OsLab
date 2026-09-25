import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  type: 'urgent' | 'info' | 'success';
  target: 'all' | 'students' | 'instructors';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ['urgent', 'info', 'success'], default: 'info' },
    target: { type: String, enum: ['all', 'students', 'instructors'], default: 'all' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Announcement = mongoose.model<IAnnouncement>('Announcement', announcementSchema);
