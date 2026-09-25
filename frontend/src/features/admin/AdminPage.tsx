import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Button, Spinner } from '../../components/common';
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
  const { user, logout } = useAuth();
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'quizzes' | 'labs' | 'broadcasts' | 'terminal'>('overview');
  const [loading, setLoading] = useState(true);

  // Live real data states (no hardcoded fake users)
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [simStats, setSimStats] = useState<SimulationStat[]>([]);

  // Check admin role
  useEffect(() => {
    const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase().includes('admin');
    if (user && !isAdmin) {
      addToast('Access denied: Admin privileges required.', 'error');
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate, addToast]);

  // Fetch real database records from backend
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

      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) {
        setUsers(usersRes.value);
      }

      if (questionsRes.status === 'fulfilled' && Array.isArray(questionsRes.value)) {
        setQuestions(questionsRes.value);
      }

      if (labsRes.status === 'fulfilled' && labsRes.value?.simStats) {
        setSimStats(labsRes.value.simStats);
      }

      if (annRes.status === 'fulfilled' && Array.isArray(annRes.value)) {
        setAnnouncements(annRes.value);
      }
    } catch (_e) {
      addToast('Failed to fetch live database records.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully.', 'info');
    navigate('/login');
  };

  // User Actions - Real Backend Integration
  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      addToast(`User role updated to ${newRole}.`, 'success');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to update user role.', 'error');
    }
  };

  const handleToggleStatus = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    const newStatus = target?.status === 'active' ? 'suspended' : 'active';
    try {
      await adminService.updateUserStatus(userId, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
      addToast(`User account ${newStatus}.`, newStatus === 'active' ? 'success' : 'info');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to update user status.', 'error');
    }
  };

  const handleResetProgress = async (userId: string) => {
    try {
      await adminService.resetUserProgress(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, progress: 0, quizzesCompleted: 0, experimentsCount: 0 } : u
        )
      );
      addToast('User learning progress and experiments reset.', 'info');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to reset progress.', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      addToast('User record deleted from database.', 'info');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to delete user.', 'error');
    }
  };

  const handleAddUser = async (newUserData: Omit<AdminUser, 'id' | 'createdAt' | 'lastActive' | 'progress' | 'quizzesCompleted' | 'experimentsCount'>) => {
    try {
      const created = await adminService.createUser(newUserData);
      setUsers((prev) => [created, ...prev]);
      addToast('New user account created successfully.', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to create user.', 'error');
    }
  };

  // Question Actions - Real Backend Integration
  const handleAddQuestion = async (qData: Omit<AdminQuestion, 'id' | 'successRate'>) => {
    try {
      const created = await adminService.createQuestion(qData);
      setQuestions((prev) => [created, ...prev]);
      addToast('New question published to database.', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to add question.', 'error');
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    try {
      await adminService.deleteQuestion(qId);
      setQuestions((prev) => prev.filter((q) => q.id !== qId));
      addToast('Question removed from curriculum.', 'info');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to delete question.', 'error');
    }
  };

  // Announcement Actions - Real Backend Integration
  const handleAddAnnouncement = async (annData: Omit<AdminAnnouncement, 'id' | 'createdAt'>) => {
    try {
      const created = await adminService.createAnnouncement(annData);
      setAnnouncements((prev) => [created, ...prev]);
      addToast('Broadcast published to student dashboards.', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to create announcement.', 'error');
    }
  };

  const handleToggleAnnouncement = async (id: string) => {
    try {
      await adminService.toggleAnnouncement(id);
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
      );
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to toggle announcement.', 'error');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await adminService.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      addToast('Announcement deleted.', 'info');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to delete announcement.', 'error');
    }
  };

  return (
    <div className="container-width animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <div className={styles.headerSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <PageHeader
            title="OSLab Administrative Console"
            description="Live dashboard monitoring real registered students, curriculum questions, and simulator telemetry."
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

      {loading && users.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 0', flexDirection: 'column', gap: '1rem' }}>
          <Spinner size="lg" />
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-sm)' }}>Loading live platform telemetry...</span>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default AdminPage;
