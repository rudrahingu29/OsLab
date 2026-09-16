import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import { useLearnStore } from '../../stores/learnStore';
import { useLabStore } from '../../stores/labStore';
import { useSimulationStore } from '../../stores/simulationStore';
import { useUIStore } from '../../stores/uiStore';
import { Card, Button, Input, PageHeader, Modal, Spinner } from '../../components/common';
import { 
  User as UserIcon, 
  BookOpen, 
  Save, 
  Key, 
  Award, 
  HardDrive, 
  Trash2, 
  ExternalLink, 
  FlaskConical,
  CheckCircle2,
  XCircle,
  Eye,
  RotateCcw,
  Rocket,
  Cpu,
  Layers,
  FileQuestion,
  ClipboardCheck,
  Terminal
} from 'lucide-react';
import { quizService } from '../quiz/services/quizService';
import styles from './ProfilePage.module.css';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as 'profile' | 'stats' | 'experiments' | 'quizzes' | 'security' | null;

  const { topics, loadProgress } = useLearnStore();
  const { experiments, loadExperiments, deleteSavedExperiment } = useLabStore();
  const { ticks } = useSimulationStore();
  const { addToast } = useUIStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'experiments' | 'quizzes' | 'security'>(
    tabParam && ['profile', 'stats', 'experiments', 'quizzes', 'security'].includes(tabParam) ? tabParam : 'profile'
  );

  useEffect(() => {
    if (tabParam && ['profile', 'stats', 'experiments', 'quizzes', 'security'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'profile' | 'stats' | 'experiments' | 'quizzes' | 'security') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  const [hasPassedFinalExam, setHasPassedFinalExam] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  // Review modal state
  const [selectedAttempt, setSelectedAttempt] = useState<any | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [bio, setBio] = useState('OS Student & Computer Systems Enthusiast');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const loadQuizHistory = async () => {
    setLoadingQuizzes(true);
    try {
      const res = await quizService.getUserHistory();
      const attempts = res?.data || [];
      setQuizAttempts(attempts);
      const passed = attempts.some((a: any) => a.topic === 'final-exam' && a.passed && a.percentage >= 80);
      setHasPassedFinalExam(passed);
    } catch (err) {
      console.error('Failed to load quiz history:', err);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    loadProgress();
    loadExperiments();
    loadQuizHistory();
  }, [loadProgress, loadExperiments]);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const getInitials = (userName: string) => {
    return userName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Name cannot be empty.', 'warning');
      return;
    }
    addToast('Profile details updated successfully!', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      addToast('Please fill in all password fields.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New password and confirm password do not match.', 'error');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    addToast('Password changed successfully!', 'success');
  };

  const handleDeleteExp = async (id: string) => {
    await deleteSavedExperiment(id);
    addToast('Experiment deleted.', 'info');
  };

  const getLabPath = (type: string) => {
    switch (type) {
      case 'cpu-scheduling':
        return '/os-lab/cpu-scheduling';
      case 'memory-management':
        return '/os-lab/memory-management';
      case 'disk-scheduling':
        return '/os-lab/disk-scheduling';
      default:
        return '/os-lab';
    }
  };

  const formatLabName = (type: string) => {
    switch (type) {
      case 'cpu-scheduling':
        return 'CPU Scheduling';
      case 'memory-management':
        return 'Memory Management';
      case 'disk-scheduling':
        return 'Disk Scheduling';
      default:
        return type;
    }
  };

  const handleOpenReview = async (attemptId: string) => {
    setReviewLoading(true);
    setIsReviewOpen(true);
    try {
      const data = await quizService.getAttemptById(attemptId);
      setSelectedAttempt(data);
    } catch (err) {
      console.error('Failed to load attempt details:', err);
      addToast('Failed to load attempt review.', 'error');
      setIsReviewOpen(false);
    } finally {
      setReviewLoading(false);
    }
  };

  const formatTopicName = (topic: string) => {
    switch (topic) {
      case 'final-exam':
        return 'OSLab Certification Exam';
      case 'foundations':
        return 'Chapter 1: Foundations & Architecture';
      case 'processes-cpu':
      case 'cpu-scheduling':
      case 'process-management':
        return 'Chapter 2: Processes & CPU Scheduling';
      case 'synchronization-deadlocks':
      case 'deadlocks':
      case 'process-synchronization':
        return 'Chapter 3: Synchronization & Deadlocks';
      case 'memory-management':
      case 'page-replacement':
        return 'Chapter 4: Memory Management & Paging';
      case 'storage-disk':
      case 'disk-scheduling':
      case 'file-systems':
        return 'Chapter 5: Storage Hardware & File Systems';
      case 'security-virtualization':
      case 'security-protection':
        return 'Chapter 6: Security & Virtualization';
      default:
        return topic;
    }
  };

  const completedTopicsCount = topics.filter((t) => t.isComplete).length;
  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="container-width animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <PageHeader
        title="My Profile"
        description="Manage your account preferences, trace learning progress, review exam results, and access saved experiments."
      />

      <div className={styles.profileContainer}>
        
        {/* User Info Header Card */}
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {user ? getInitials(user.name) : 'OS'}
          </div>
          <div className={styles.userInfo}>
            <h2 className={styles.userName}>{user?.name || 'Student'}</h2>
            <span className={styles.userEmail}>{user?.email || 'student@oslab.edu'}</span>
            <div className={styles.roleBadge}>
              <Award size={12} /> OS Scholar
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.activeTab : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            Profile Information
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'stats' ? styles.activeTab : ''}`}
            onClick={() => handleTabChange('stats')}
          >
            Learning & Activity Stats
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'quizzes' ? styles.activeTab : ''}`}
            onClick={() => handleTabChange('quizzes')}
          >
            Exam & Quiz Results ({quizAttempts.length})
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'experiments' ? styles.activeTab : ''}`}
            onClick={() => handleTabChange('experiments')}
          >
            Saved Experiments ({experiments.length})
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'security' ? styles.activeTab : ''}`}
            onClick={() => handleTabChange('security')}
          >
            Security & Credentials
          </button>
        </div>

        {/* Tab 1: Profile Details */}
        {activeTab === 'profile' && (
          <Card>
            <form onSubmit={handleSaveProfile} className={styles.formGrid}>
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />

              <Input
                label="Email Address"
                value={email}
                disabled
                helperText="Email address cannot be changed."
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  User Bio / Status
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your learning goals..."
                  rows={3}
                  style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px',
                    fontSize: '0.9rem',
                    resize: 'none',
                    outline: 'none'
                  }}
                />
              </div>

              <div className={styles.btnRow}>
                <Button type="submit" variant="primary" leftIcon={<Save size={16} />}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Tab 2: Learning Overview & Stats */}
        {activeTab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Curriculum Progress Bar Card */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
                  Curriculum Mastery Progress
                </h3>
                <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.1rem' }}>
                  {topics.length > 0 ? Math.round((completedTopicsCount / topics.length) * 100) : 0}%
                </span>
              </div>
              <div className={styles.progressBarTrack}>
                <div 
                  className={styles.progressBarFill} 
                  style={{ width: `${topics.length > 0 ? Math.round((completedTopicsCount / topics.length) * 100) : 0}%` }} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                <span>{completedTopicsCount} of {topics.length} Topics Completed</span>
                <span>{topics.length - completedTopicsCount} Remaining</span>
              </div>
            </Card>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div style={{ color: 'var(--color-primary)' }}><BookOpen size={24} /></div>
                <div className={styles.statValue}>{completedTopicsCount} / {topics.length}</div>
                <div className={styles.statLabel}>Curriculum Topics Completed</div>
              </div>

              <div className={styles.statCard}>
                <div style={{ color: '#10b981' }}><HardDrive size={24} /></div>
                <div className={styles.statValue}>{experiments.length}</div>
                <div className={styles.statLabel}>Saved OS Lab Experiments</div>
              </div>

              <div className={styles.statCard}>
                <div style={{ color: '#8b5cf6' }}><UserIcon size={24} /></div>
                <div className={styles.statValue}>{ticks} ms</div>
                <div className={styles.statLabel}>Mini-OS Kernel Uptime Ticks</div>
              </div>
            </div>

            {/* Achievements & Badges Section */}
            <Card>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
                Earned Achievements & Badges
              </h3>
              <div className={styles.achievementsGrid}>
                <div className={`${styles.achievementCard} ${styles.achievementCardUnlocked}`}>
                  <div className={styles.achievementIcon}>
                    <Rocket size={22} color="#3b82f6" />
                  </div>
                  <div className={styles.achievementDetails}>
                    <span className={styles.achievementName}>OS Pioneer <Award size={14} style={{ color: '#22c55e' }} /></span>
                    <span className={styles.achievementDesc}>Booted Mini-OS virtual machine</span>
                  </div>
                </div>

                <div className={`${styles.achievementCard} ${completedTopicsCount >= 3 ? styles.achievementCardUnlocked : styles.achievementCardLocked}`}>
                  <div className={styles.achievementIcon}>
                    <Cpu size={22} color="#eab308" />
                  </div>
                  <div className={styles.achievementDetails}>
                    <span className={styles.achievementName}>Scheduling Expert {completedTopicsCount >= 3 && <Award size={14} style={{ color: '#22c55e' }} />}</span>
                    <span className={styles.achievementDesc}>Mastered CPU Scheduling policies</span>
                  </div>
                </div>

                <div className={`${styles.achievementCard} ${completedTopicsCount >= 6 ? styles.achievementCardUnlocked : styles.achievementCardLocked}`}>
                  <div className={styles.achievementIcon}>
                    <Layers size={22} color="#8b5cf6" />
                  </div>
                  <div className={styles.achievementDetails}>
                    <span className={styles.achievementName}>Memory Architect {completedTopicsCount >= 6 && <Award size={14} style={{ color: '#22c55e' }} />}</span>
                    <span className={styles.achievementDesc}>Explored RAM & Page Replacement</span>
                  </div>
                </div>

                <div className={`${styles.achievementCard} ${completedTopicsCount >= 8 ? styles.achievementCardUnlocked : styles.achievementCardLocked}`}>
                  <div className={styles.achievementIcon}>
                    <HardDrive size={22} color="#06b6d4" />
                  </div>
                  <div className={styles.achievementDetails}>
                    <span className={styles.achievementName}>Disk Commander {completedTopicsCount >= 8 && <Award size={14} style={{ color: '#22c55e' }} />}</span>
                    <span className={styles.achievementDesc}>Mastered Disk Arm Head Seeking</span>
                  </div>
                </div>

                <div className={`${styles.achievementCard} ${completedTopicsCount >= 7 ? styles.achievementCardUnlocked : styles.achievementCardLocked}`}>
                  <div className={styles.achievementIcon}>
                    <BookOpen size={22} color="#10b981" />
                  </div>
                  <div className={styles.achievementDetails}>
                    <span className={styles.achievementName}>Kernel Scholar {completedTopicsCount >= 7 && <Award size={14} style={{ color: '#22c55e' }} />}</span>
                    <span className={styles.achievementDesc}>Completed 50%+ of OS Curriculum</span>
                  </div>
                </div>

                <div className={`${styles.achievementCard} ${hasPassedFinalExam || completedTopicsCount >= topics.length ? styles.achievementCardUnlocked : styles.achievementCardLocked}`}>
                  <div className={styles.achievementIcon}>
                    <Award size={22} color="#f59e0b" />
                  </div>
                  <div className={styles.achievementDetails}>
                    <span className={styles.achievementName}>
                      OS Master {(hasPassedFinalExam || completedTopicsCount >= topics.length) && <Award size={14} style={{ color: '#22c55e' }} />}
                    </span>
                    <span className={styles.achievementDesc}>
                      {hasPassedFinalExam ? 'Passed Grand Final Certification Exam (≥ 80%)' : 'Pass Grand Final Exam or complete all curriculum topics'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Workspace Links */}
            <Card>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
                Quick Workspace Shortcuts
              </h3>
              <div className={styles.shortcutsGrid}>
                <Link to="/learn" className={styles.shortcutCard}>
                  <div className={styles.shortcutIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)' }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>Course Curriculum</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>20 comprehensive OS learning topics</p>
                  </div>
                </Link>

                <Link to="/os-lab" className={styles.shortcutCard}>
                  <div className={styles.shortcutIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <FlaskConical size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>OS Lab Simulators</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Interactive CPU, Memory & Disk labs</p>
                  </div>
                </Link>

                <Link to="/mini-os" className={styles.shortcutCard}>
                  <div className={styles.shortcutIcon} style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                    <Terminal size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>Mini-OS Desktop</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Live multitasking virtual environment</p>
                  </div>
                </Link>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 3: Exam & Quiz Results */}
        {activeTab === 'quizzes' && (
          <div>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
                    Assessment History & Certification Attempts
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Track all your chapter knowledge checks and certification examination submissions.
                  </span>
                </div>
                <Button variant="secondary" size="sm" onClick={() => navigate('/learn')} leftIcon={<BookOpen size={14} />}>
                  Explore Curriculum
                </Button>
              </div>

              {loadingQuizzes ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <Spinner size="md" />
                  <span style={{ marginTop: '0.75rem', display: 'block' }}>Loading exam results...</span>
                </div>
              ) : quizAttempts.length === 0 ? (
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    background: 'rgba(59, 130, 246, 0.1)', 
                    padding: '16px', 
                    borderRadius: '16px',
                    marginBottom: '1rem' 
                  }}>
                    <ClipboardCheck size={36} color="var(--color-primary)" />
                  </div>
                  <h4>No Assessment History Yet</h4>
                  <p style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem auto' }}>
                    Complete a chapter knowledge check in Learn or take the Certification Exam to see your graded attempts here.
                  </p>
                  <Button variant="primary" onClick={() => navigate('/learn')}>
                    Explore Course Curriculum
                  </Button>
                </div>
              ) : (
                <div className={styles.quizTableWrapper}>
                  <table className={styles.quizTable}>
                    <thead>
                      <tr>
                        <th>Assessment</th>
                        <th>Score</th>
                        <th>Percentage</th>
                        <th>Status</th>
                        <th>Date Taken</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizAttempts.map((attempt) => {
                        const isCertExam = attempt.topic === 'final-exam';
                        return (
                          <tr key={attempt._id}>
                            <td>
                              <div className={styles.topicCell}>
                                <span className={styles.topicIcon}>
                                  {isCertExam ? <Award size={16} color="#f59e0b" /> : <FileQuestion size={16} color="#3b82f6" />}
                                </span>
                                <div>
                                  <div>{formatTopicName(attempt.topic)}</div>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                    {isCertExam ? 'Certification Exam' : 'Chapter Checkpoint'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td style={{ fontWeight: 600 }}>
                              {attempt.score} / {attempt.maxScore}
                            </td>
                            <td style={{ fontWeight: 700, color: attempt.passed ? '#22c55e' : '#ef4444' }}>
                              {attempt.percentage}%
                            </td>
                            <td>
                              <span className={`${styles.statusPill} ${attempt.passed ? styles.statusPassed : styles.statusFailed}`}>
                                {attempt.passed ? (
                                  <>
                                    <CheckCircle2 size={12} /> Passed
                                  </>
                                ) : (
                                  <>
                                    <XCircle size={12} /> Failed
                                  </>
                                )}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                              {new Date(attempt.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleOpenReview(attempt._id)}
                                  leftIcon={<Eye size={14} />}
                                >
                                  Review
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => navigate(`/quiz/${attempt.topic}`)}
                                  leftIcon={<RotateCcw size={14} />}
                                >
                                  Retake
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Tab 4: Saved OS Lab Experiments */}
        {activeTab === 'experiments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {experiments.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <FlaskConical size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-primary)' }}>No Saved Experiments Yet</h3>
                <p style={{ color: 'var(--color-text-muted)', margin: '0 0 1.5rem 0', fontSize: '0.9rem' }}>
                  Perform simulations in OS Lab (CPU Scheduling, Memory Management, Disk Scheduling) and click &quot;Save Experiment&quot; to bookmark them here.
                </p>
                <Link to="/os-lab" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                  Explore OS Lab Workspaces →
                </Link>
              </Card>
            ) : (
              <div className={styles.experimentList}>
                {experiments.map((exp) => (
                  <div key={exp._id} className={styles.experimentCard}>
                    <div className={styles.experimentInfo}>
                      <div className={styles.experimentTitle}>
                        <FlaskConical size={18} style={{ color: '#3b82f6' }} />
                        <span>{exp.algorithm || 'Simulation Run'}</span>
                        <span className={styles.typeBadge}>{formatLabName(exp.type)}</span>
                      </div>
                      <div className={styles.experimentMeta}>
                        <span>Saved: {new Date(exp.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Type: {exp.type}</span>
                      </div>
                    </div>
                    <div className={styles.experimentActions}>
                      <Link
                        to={getLabPath(exp.type)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          color: '#3b82f6',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          textDecoration: 'none'
                        }}
                      >
                        <ExternalLink size={14} /> Launch Lab
                      </Link>
                      <button
                        onClick={() => handleDeleteExp(exp._id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 10px',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                        title="Delete saved experiment"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Security */}
        {activeTab === 'security' && (
          <Card>
            <form onSubmit={handleChangePassword} className={styles.formGrid}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, marginBottom: '0.5rem' }}>
                Change Account Password
              </h3>

              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />

              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />

              <div className={styles.btnRow}>
                <Button type="submit" variant="primary" leftIcon={<Key size={16} />}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        )}

      </div>

      {/* Review Submission Modal */}
      {isReviewOpen && (
        <Modal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          title={selectedAttempt ? `Review: ${formatTopicName(selectedAttempt.topic)}` : 'Review Submission'}
        >
          {reviewLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <Spinner size="md" />
              <span style={{ marginTop: '0.75rem', display: 'block' }}>Loading question breakdown...</span>
            </div>
          ) : selectedAttempt ? (
            <div className={styles.examReviewModal}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Score Achieved</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: selectedAttempt.passed ? '#22c55e' : '#ef4444' }}>
                    {selectedAttempt.score} / {selectedAttempt.maxScore} ({selectedAttempt.percentage}%)
                  </div>
                </div>
                <span className={`${styles.statusPill} ${selectedAttempt.passed ? styles.statusPassed : styles.statusFailed}`}>
                  {selectedAttempt.passed ? 'PASSED' : 'NOT PASSED'}
                </span>
              </div>

              {selectedAttempt.answers && selectedAttempt.answers.map((ans: any, idx: number) => {
                const q = ans.questionId;
                if (!q) return null;

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem',
                      background: 'var(--color-bg-secondary)',
                      border: `1px solid ${ans.isCorrect ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                      borderLeft: `4px solid ${ans.isCorrect ? '#22c55e' : '#ef4444'}`,
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                        Question {idx + 1}
                      </span>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 700, 
                        color: ans.isCorrect ? '#22c55e' : '#ef4444',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {ans.isCorrect ? <><CheckCircle2 size={13} /> Correct (+1)</> : <><XCircle size={13} /> Incorrect (0)</>}
                      </span>
                    </div>

                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                      {q.question}
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {q.options && q.options.map((opt: string, optIdx: number) => {
                        const isCorrect = optIdx === q.correctAnswer;
                        const isSelected = optIdx === ans.selectedAnswer;

                        let optBg = 'var(--color-bg-tertiary)';
                        let optBorder = 'var(--color-border)';
                        let optColor = 'var(--color-text-primary)';

                        if (isCorrect) {
                          optBg = 'rgba(34, 197, 94, 0.12)';
                          optBorder = '#22c55e';
                          optColor = '#22c55e';
                        } else if (isSelected && !ans.isCorrect) {
                          optBg = 'rgba(239, 68, 68, 0.12)';
                          optBorder = '#ef4444';
                          optColor = '#ef4444';
                        }

                        return (
                          <div
                            key={optIdx}
                            style={{
                              padding: '8px 12px',
                              background: optBg,
                              border: `1px solid ${optBorder}`,
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              color: optColor,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <span style={{ fontWeight: 700 }}>{optionLetters[optIdx]}.</span>
                            <span style={{ flex: 1 }}>{opt}</span>
                            {isCorrect && <CheckCircle2 size={14} />}
                            {isSelected && !ans.isCorrect && <XCircle size={14} />}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div style={{ padding: '8px 10px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--color-text-secondary)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <strong>Explanation: </strong>{q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <Button variant="secondary" onClick={() => setIsReviewOpen(false)}>
                  Close Review
                </Button>
              </div>
            </div>
          ) : (
            <div>No attempt data available.</div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default ProfilePage;
