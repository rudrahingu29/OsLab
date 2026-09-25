export type UserRole = 'student' | 'instructor' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  progress: number;
  quizzesCompleted: number;
  experimentsCount: number;
  lastActive: string;
  createdAt: string;
}

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface AdminQuestion {
  id: string;
  topicSlug: string;
  topicName: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: QuestionDifficulty;
  successRate: number;
}

export type AnnouncementType = 'info' | 'warning' | 'success' | 'urgent';

export interface AdminAnnouncement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  createdAt: string;
  active: boolean;
  target: 'all' | 'students' | 'instructors';
}

export interface SimulationStat {
  algorithm: string;
  type: 'CPU' | 'Memory' | 'Disk';
  runsCount: number;
  avgTurnaround?: number;
  avgPageFaults?: number;
  avgHeadMovement?: number;
}
