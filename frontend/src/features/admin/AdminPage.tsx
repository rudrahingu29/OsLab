import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Button } from '../../components/common';
import { useAuth } from '../auth/context/AuthContext';
import { useUIStore } from '../../stores/uiStore';
import { 
  LayoutDashboard, 
  Users, 
  HelpCircle, 
  FlaskConical, 
  Megaphone, 
  Terminal as TerminalIcon,
  LogOut,
  RefreshCw
} from 'lucide-react';
import {
  INITIAL_USERS,
  INITIAL_QUESTIONS,
  INITIAL_ANNOUNCEMENTS,
  SIMULATION_STATS,
} from './mockData';
import type { AdminUser, AdminQuestion, AdminAnnouncement, SimulationStat, UserRole } from './types';
import adminService from '../../services/adminService';
import AdminOverview from './components/AdminOverview';
import AdminUsers from './components/AdminUsers';
import AdminQuizzes from './components/AdminQuizzes';
import AdminLabs from './components/AdminLabs';
import AdminBroadcasts from './components/AdminBroadcasts';
import AdminTerminal from './components/AdminTerminal';
import styles from './AdminPage.module.css';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'quizzes' | 'labs' | 'broadcasts' | 'terminal'>('overview');
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('oslab_admin_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [questions, setQuestions] = useState<AdminQuestion[]>(() => {
    const saved = localStorage.getItem('oslab_admin_questions');
    return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
  });

  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>(() => {
    const saved = localStorage.getItem('oslab_admin_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [simStats, setSimStats] = useState<SimulationStat[]>(SIMULATION_STATS);

  // Fetch real data from backend
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [, usersRes, questionsRes, labsRes, annRes] = await Promise.allSettled([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getQuestions(),
        adminService.getLabTelemetry(),
        adminService.getAnnouncements(),
      ]);

      if (usersRes.status === 'fulfilled' && usersRes.value && usersRes.value.length > 0) {
        setUsers(usersRes.value);
        localStorage.setItem('oslab_admin_users', JSON.stringify(usersRes.value));
      }

      if (questionsRes.status === 'fulfilled' && questionsRes.value && questionsRes.value.length > 0) {
        setQuestions(questionsRes.value);
        localStorage.setItem('oslab_admin_questions', JSON.stringify(questionsRes.value));
      }

      if (labsRes.status === 'fulfilled' && labsRes.value && labsRes.value.simStats?.length > 0) {
        setSimStats(labsRes.value.simStats);
      }

      if (annRes.status === 'fulfilled' && annRes.value && annRes.value.length > 0) {
        setAnnouncements(annRes.value);
        localStorage.setItem('oslab_admin_announcements', JSON.stringify(annRes.value));
      }
    } catch (_e) {
      // Fall back to local cached state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Sync state to local storage as fallback cache
  useEffect(() => {
    localStorage.setItem('oslab_admin_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('oslab_admin_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('oslab_admin_announcements', JSON.stringify(announcements));
  }, [announcements]);

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully.', 'info');
    navigate('/login');
  };

  // User Actions
  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
    } catch (_e) {
      // Offline fallback
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    addToast(`User role updated to ${newRole}.`, 'success');
  };

  const handleToggleStatus = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    const newStatus = target?.status === 'active' ? 'suspended' : 'active';
    try {
      await adminService.updateUserStatus(userId, newStatus);
    } catch (_e) {
      // Offline fallback
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
    addToast(`User account ${newStatus}.`, newStatus === 'active' ? 'success' : 'info');
  };

  const handleResetProgress = async (userId: string) => {
    try {
      await adminService.resetUserProgress(userId);
    } catch (_e) {
      // Offline fallback
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, progress: 0, quizzesCompleted: 0, experimentsCount: 0 } : u
      )
    );
    addToast('User learning progress and experiments reset.', 'info');
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminService.deleteUser(userId);
    } catch (_e) {
      // Offline fallback
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    addToast('User record deleted from database.', 'info');
  };

  const handleAddUser = async (newUserData: Omit<AdminUser, 'id' | 'createdAt' | 'lastActive' | 'progress' | 'quizzesCompleted' | 'experimentsCount'>) => {
    try {
      const created = await adminService.createUser(newUserData);
      setUsers((prev) => [created, ...prev]);
      addToast('New user account created successfully.', 'success');
    } catch (_e) {
      const localUser: AdminUser = {
        ...newUserData,
        id: `u-${Date.now().toString().slice(-4)}`,
        progress: 0,
        quizzesCompleted: 0,
        experimentsCount: 0,
        lastActive: 'Just registered',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers((prev) => [localUser, ...prev]);
      addToast('User account created.', 'success');
    }
  };

  // Question Actions
  const handleAddQuestion = async (qData: Omit<AdminQuestion, 'id' | 'successRate'>) => {
    try {
      const created = await adminService.createQuestion(qData);
      setQuestions((prev) => [created, ...prev]);
      addToast('New question published to database.', 'success');
    } catch (_e) {
      const localQ: AdminQuestion = {
        ...qData,
        id: `q-${Date.now().toString().slice(-4)}`,
        successRate: 100,
      };
      setQuestions((prev) => [localQ, ...prev]);
      addToast('Question added.', 'success');
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    try {
      await adminService.deleteQuestion(qId);
    } catch (_e) {
      // Offline fallback
    }
    setQuestions((prev) => prev.filter((q) => q.id !== qId));
    addToast('Question removed from curriculum.', 'info');
  };

  // Announcement Actions
  const handleAddAnnouncement = async (annData: Omit<AdminAnnouncement, 'id' | 'createdAt'>) => {
    try {
      const created = await adminService.createAnnouncement(annData);
      setAnnouncements((prev) => [created, ...prev]);
      addToast('Broadcast published to student dashboards.', 'success');
    } catch (_e) {
      const localAnn: AdminAnnouncement = {
        ...annData,
        id: `ann-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setAnnouncements((prev) => [localAnn, ...prev]);
      addToast('Announcement posted.', 'success');
    }
  };

  const handleToggleAnnouncement = async (id: string) => {
    try {
      await adminService.toggleAnnouncement(id);
    } catch (_e) {
      // Offline fallback
    }
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await adminService.deleteAnnouncement(id);
    } catch (_e) {
      // Offline fallback
    }
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    addToast('Announcement deleted.', 'info');
  };

  return (
    <div className="container-width animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div className={styles.headerSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <PageHeader
            title="OSLab Administrative Console"
            description="Manage student rosters, customize curriculum quiz assessments, inspect laboratory telemetry, and broadcast announcements."
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Button 
              variant="ghost" 
              size="sm" 
              leftIcon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
              onClick={fetchAllData}
            >
              Refresh Data
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              leftIcon={<LogOut size={14} />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === 'overview' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <LayoutDashboard size={16} />
          <span>Overview</span>
        </button>

        <button
          className={`${styles.tabButton} ${activeTab === 'users' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} />
          <span>Users & Students</span>
          <span className={styles.tabBadge}>{users.length}</span>
        </button>

        <button
          className={`${styles.tabButton} ${activeTab === 'quizzes' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('quizzes')}
        >
          <HelpCircle size={16} />
          <span>Quiz CMS</span>
          <span className={styles.tabBadge}>{questions.length}</span>
        </button>

        <button
          className={`${styles.tabButton} ${activeTab === 'labs' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('labs')}
        >
          <FlaskConical size={16} />
          <span>Lab Telemetry</span>
        </button>

        <button
          className={`${styles.tabButton} ${activeTab === 'broadcasts' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('broadcasts')}
        >
          <Megaphone size={16} />
          <span>Broadcasts</span>
          {announcements.filter((a) => a.active).length > 0 && (
            <span className={styles.tabBadge} style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--color-warning)' }}>
              {announcements.filter((a) => a.active).length}
            </span>
          )}
        </button>

        <button
          className={`${styles.tabButton} ${activeTab === 'terminal' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('terminal')}
        >
          <TerminalIcon size={16} />
          <span>Admin CLI Terminal</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <AdminOverview
          users={users}
          questions={questions}
          announcements={announcements}
          simStats={simStats}
          onNavigateTab={(tab) => setActiveTab(tab as any)}
        />
      )}

      {activeTab === 'users' && (
        <AdminUsers
          users={users}
          onUpdateRole={handleUpdateRole}
          onToggleStatus={handleToggleStatus}
          onResetProgress={handleResetProgress}
          onDeleteUser={handleDeleteUser}
          onAddUser={handleAddUser}
        />
      )}

      {activeTab === 'quizzes' && (
        <AdminQuizzes
          questions={questions}
          onAddQuestion={handleAddQuestion}
          onDeleteQuestion={handleDeleteQuestion}
        />
      )}

      {activeTab === 'labs' && <AdminLabs simStats={simStats} />}

      {activeTab === 'broadcasts' && (
        <AdminBroadcasts
          announcements={announcements}
          onAddAnnouncement={handleAddAnnouncement}
          onToggleAnnouncement={handleToggleAnnouncement}
          onDeleteAnnouncement={handleDeleteAnnouncement}
        />
      )}

      {activeTab === 'terminal' && (
        <AdminTerminal
          users={users}
          questions={questions}
          announcements={announcements}
          simStats={simStats}
          onAddAnnouncement={handleAddAnnouncement}
        />
      )}
    </div>
  );
};

export default AdminPage;
