import api from './api';
import type { AdminUser, AdminQuestion, AdminAnnouncement, SimulationStat, UserRole } from '../features/admin/types';

export interface AdminStatsResponse {
  totalStudents: number;
  activeStudents: number;
  totalUsers: number;
  totalSimulations: number;
  avgQuizSuccess: number;
  totalQuestions: number;
  activeAnnouncements: number;
  systemHealth: {
    status: string;
    uptimeSeconds: number;
    dbLatencyMs: number;
  };
}

export interface LabTelemetryResponse {
  simStats: SimulationStat[];
  miniOS: {
    virtualProcesses: number;
    simulatedRAMUsedMB: string;
    filesCreated: number;
  };
}

export const adminService = {
  getStats: async (): Promise<AdminStatsResponse> => {
    const res = await api.get('/admin/stats');
    return res.data.data;
  },

  getUsers: async (search?: string, role?: string): Promise<AdminUser[]> => {
    const res = await api.get('/admin/users', { params: { search, role } });
    return res.data.data;
  },

  createUser: async (data: { name: string; email: string; role: UserRole; status?: 'active' | 'suspended' }): Promise<AdminUser> => {
    const res = await api.post('/admin/users', data);
    return res.data.data;
  },

  updateUserRole: async (userId: string, role: UserRole) => {
    const res = await api.patch(`/admin/users/${userId}/role`, { role });
    return res.data.data;
  },

  updateUserStatus: async (userId: string, status?: 'active' | 'suspended') => {
    const res = await api.patch(`/admin/users/${userId}/status`, { status });
    return res.data.data;
  },

  resetUserProgress: async (userId: string) => {
    const res = await api.post(`/admin/users/${userId}/reset-progress`);
    return res.data;
  },

  deleteUser: async (userId: string) => {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
  },

  getQuestions: async (): Promise<AdminQuestion[]> => {
    const res = await api.get('/admin/quizzes/questions');
    return res.data.data;
  },

  createQuestion: async (data: Omit<AdminQuestion, 'id' | 'successRate'>): Promise<AdminQuestion> => {
    const res = await api.post('/admin/quizzes/questions', data);
    return res.data.data;
  },

  deleteQuestion: async (id: string) => {
    const res = await api.delete(`/admin/quizzes/questions/${id}`);
    return res.data;
  },

  getLabTelemetry: async (): Promise<LabTelemetryResponse> => {
    const res = await api.get('/admin/labs/stats');
    return res.data.data;
  },

  getAnnouncements: async (): Promise<AdminAnnouncement[]> => {
    const res = await api.get('/admin/announcements');
    return res.data.data;
  },

  createAnnouncement: async (data: Omit<AdminAnnouncement, 'id' | 'createdAt'>): Promise<AdminAnnouncement> => {
    const res = await api.post('/admin/announcements', data);
    return res.data.data;
  },

  toggleAnnouncement: async (id: string) => {
    const res = await api.patch(`/admin/announcements/${id}/toggle`);
    return res.data.data;
  },

  deleteAnnouncement: async (id: string) => {
    const res = await api.delete(`/admin/announcements/${id}`);
    return res.data;
  },
};

export default adminService;
