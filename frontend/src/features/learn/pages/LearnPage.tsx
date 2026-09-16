import React, { useState, useEffect } from 'react';
import { useLearnStore } from '../../../stores/learnStore';
import { ProgressBar, Card, Button } from '../../../components/common';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Search, 
  BookOpen, 
  Layers, 
  Cpu, 
  Award, 
  Sparkles, 
  HelpCircle,
  RotateCcw,
  Eye,
  Check,
  FlaskConical,
  Terminal,
  Medal,
  Lock
} from 'lucide-react';
import { TopicIcon } from '../components/TopicIcon';
import { quizService } from '../../quiz/services/quizService';
import type { QuizAttemptItem } from '../../quiz/types/quiz.types';
import styles from './LearnPage.module.css';

interface ModuleCategory {
  id: string;
  name: string;
  badge: string;
  topicIds: string[];
  description: string;
  quizSlug: string;
}

const MODULE_CATEGORIES: ModuleCategory[] = [
  {
    id: 'foundations',
    name: 'Module 1: Foundations & Kernel Architecture',
    badge: 'Module 1',
    topicIds: ['intro-to-os', 'hardware-architecture', 'user-vs-kernel-mode', 'system-calls'],
    description: 'Hardware registers, system calls, interrupt service routines, and dual-mode CPU protection.',
    quizSlug: 'foundations'
  },
  {
    id: 'processes',
    name: 'Module 2: Processes, Threads & CPU Scheduling',
    badge: 'Module 2',
    topicIds: ['processes', 'process-states', 'threads-multithreading', 'inter-process-communication', 'cpu-scheduling'],
    description: 'Process Control Blocks (PCB), state transitions, POSIX multithreading, IPC pipes, and CPU scheduling.',
    quizSlug: 'processes-cpu'
  },
  {
    id: 'synchronization',
    name: 'Module 3: Synchronization & Concurrency Problems',
    badge: 'Module 3',
    topicIds: ['synchronization-race-conditions', 'semaphores-mutexes', 'deadlocks'],
    description: 'Race conditions, critical sections, Mutex locks, Counting Semaphores, and Banker\'s deadlock algorithm.',
    quizSlug: 'synchronization-deadlocks'
  },
  {
    id: 'memory',
    name: 'Module 4: Memory Management & Virtual Paging',
    badge: 'Module 4',
    topicIds: ['memory-management', 'paging-segmentation', 'virtual-memory'],
    description: 'RAM partitioning, fragmentation, Page Tables, TLB hardware caching, and Page Fault swapping.',
    quizSlug: 'memory-management'
  },
  {
    id: 'storage',
    name: 'Module 5: Storage Hardware & File Systems',
    badge: 'Module 5',
    topicIds: ['disk-management', 'file-systems', 'io-management'],
    description: 'Physical disk arm seek scheduling (SCAN/C-LOOK), Inode file metadata, journaling, and DMA controllers.',
    quizSlug: 'storage-disk'
  },
  {
    id: 'security',
    name: 'Module 6: OS Security & Virtualization',
    badge: 'Module 6',
    topicIds: ['security-protection', 'virtualization-containers'],
    description: 'Access Control Lists (ACLs), user permission bits, Hypervisors, Docker containers, and cgroups.',
    quizSlug: 'security-virtualization'
  }
];

export const LearnPage: React.FC = () => {
  const { topics, loading, loadProgress } = useLearnStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [quizAttempts, setQuizAttempts] = useState<QuizAttemptItem[]>([]);

  useEffect(() => {
    loadProgress();
    // Load quiz history to display exam and checkpoint status
    quizService.getUserHistory()
      .then(res => {
        if (res?.data) {
          setQuizAttempts(res.data);
        }
      })
      .catch(err => {
        console.error('Failed to load quiz history on Learn page:', err);
      });
  }, [loadProgress]);

  const completedTopicsCount = topics.filter(t => t.isComplete).length;
  const totalTopics = topics.length;
  const progressPercentage = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;

  // Filter topics based on search and category
  const filteredTopics = topics.filter(topic => {
    const matchesSearch = searchQuery === '' || 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeCategory === 'all') return true;

    const categoryObj = MODULE_CATEGORIES.find(c => c.id === activeCategory);
    return categoryObj ? categoryObj.topicIds.includes(topic.id) : true;
  });

  // Helper to find highest scoring attempt for a topic/module
  const getBestAttempt = (slug: string) => {
    const topicAttempts = quizAttempts.filter(a => a.topic === slug);
    if (topicAttempts.length === 0) return null;
    return topicAttempts.reduce((prev, curr) => (curr.percentage > prev.percentage ? curr : prev));
  };

  const finalExamAttempt = getBestAttempt('final-exam');
  const hasPassedFinalExam = finalExamAttempt ? (finalExamAttempt.passed && finalExamAttempt.percentage >= 80) : false;

  if (loading && topics.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <span>Loading Operating Systems Curriculum...</span>
      </div>
    );
  }

  return (
    <div className="container-width animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Hero Course Banner */}
      <div className={styles.heroBanner}>
        <div className={styles.heroHeader}>
          <div className={styles.heroTitleGroup}>
            <h1 className={styles.heroTitle}>
              <Cpu size={28} style={{ color: 'var(--color-primary)' }} />
              Operating Systems Academic Course
            </h1>
            <p className={styles.heroSubtitle}>
              Master computer system architectures, kernels, concurrency, virtual memory, and storage systems.
            </p>
          </div>

          <div className={styles.progressBox}>
            <div className={styles.progressLabel}>
              <span>Curriculum Completion</span>
              <span>{completedTopicsCount} / {totalTopics} Topics</span>
            </div>
            <ProgressBar value={progressPercentage} size="sm" showValue />
          </div>
        </div>

        <div className={styles.statsBar} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className={styles.statBadge}>
              <BookOpen size={14} style={{ color: 'var(--color-primary)' }} /> 20 Professional Topics
            </span>
            <span className={styles.statBadge}>
              <Layers size={14} style={{ color: '#10b981' }} /> 6 Academic Modules
            </span>
            <span className={styles.statBadge}>
              <Award size={14} style={{ color: '#8b5cf6' }} /> Interactive OS Labs Included
            </span>
          </div>

          {quizAttempts.length > 0 && (
            <button
              onClick={() => navigate('/profile?tab=quizzes')}
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: 'var(--color-primary)',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Eye size={13} /> View Exam Results in Profile ({quizAttempts.length}) →
            </button>
          )}
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search curriculum topics or concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterPills}>
          <button
            className={`${styles.filterPill} ${activeCategory === 'all' ? styles.filterPillActive : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All Topics ({topics.length})
          </button>
          {MODULE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`${styles.filterPill} ${activeCategory === cat.id ? styles.filterPillActive : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.badge}
            </button>
          ))}
        </div>
      </div>

      {/* Certification Exam Feature Banner */}
      <Card style={{
        marginBottom: '2rem',
        background: hasPassedFinalExam
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(59, 130, 246, 0.15) 100%)'
          : 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(147, 51, 234, 0.18) 100%)',
        border: hasPassedFinalExam
          ? '2px solid rgba(16, 185, 129, 0.5)'
          : '2px solid rgba(147, 51, 234, 0.4)',
        padding: '1.75rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: 'rgba(255, 255, 255, 0.05)', 
              padding: '16px', 
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {hasPassedFinalExam ? <Award size={36} color="#10b981" /> : <Medal size={36} color="#f59e0b" />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em', 
                  padding: '3px 8px', 
                  borderRadius: '12px', 
                  background: hasPassedFinalExam ? '#10b981' : '#eab308', 
                  color: hasPassedFinalExam ? '#fff' : '#000' 
                }}>
                  {hasPassedFinalExam ? 'Master Certified' : 'Certification'}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>20 Comprehensive Questions • 20 Mins</span>
                {finalExamAttempt && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '2px 8px', 
                    borderRadius: '6px', 
                    fontWeight: 600,
                    background: hasPassedFinalExam ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: hasPassedFinalExam ? '#10b981' : '#ef4444'
                  }}>
                    {hasPassedFinalExam ? `Best Score: ${finalExamAttempt.percentage}% (Passed)` : `Latest Score: ${finalExamAttempt.percentage}% (80% needed)`}
                  </span>
                )}
              </div>
              <h2 style={{ margin: '6px 0', fontSize: '1.35rem', color: 'var(--color-text-primary)' }}>
                OSLab Certification Exam
              </h2>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', maxWidth: '650px' }}>
                {hasPassedFinalExam 
                  ? 'Congratulations! You have passed the certification examination and earned the OS Master badge. Results and breakdown are saved in your profile.'
                  : 'Test your mastery across CPU scheduling, memory, synchronization, storage, and security. Score ≥ 80% to earn the prestigious OS Master badge!'}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {finalExamAttempt && (
              <Button
                variant="secondary"
                onClick={() => navigate('/profile?tab=quizzes')}
                leftIcon={<Eye size={16} />}
              >
                View in Profile
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => navigate('/quiz/final-exam')}
              leftIcon={hasPassedFinalExam ? <RotateCcw size={16} /> : <Sparkles size={16} />}
              rightIcon={<ArrowRight size={16} />}
              style={{ 
                background: hasPassedFinalExam 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                  : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
                border: 'none' 
              }}
            >
              {finalExamAttempt ? 'Retake Exam' : 'Take Certification Exam'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Module Grouped Render */}
      {MODULE_CATEGORIES.map(module => {
        const moduleTopics = filteredTopics.filter(t => module.topicIds.includes(t.id));
        if (moduleTopics.length === 0) return null;

        const moduleCompletedCount = topics
          .filter(t => module.topicIds.includes(t.id) && t.isComplete).length;
        const isModuleComplete = moduleCompletedCount === module.topicIds.length;
        const bestModuleAttempt = getBestAttempt(module.quizSlug);

        return (
          <div key={module.id} className={styles.moduleSection}>
            <div className={styles.moduleHeader}>
              <div className={styles.moduleTitleGroup}>
                <span className={styles.moduleBadge}>{module.badge}</span>
                <div>
                  <h2 className={styles.moduleTitle}>{module.name}</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{module.description}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span className={styles.moduleMeta}>
                  {moduleCompletedCount} of {module.topicIds.length} Completed
                </span>
                {bestModuleAttempt && (
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: bestModuleAttempt.passed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: bestModuleAttempt.passed ? '#22c55e' : '#ef4444',
                    border: `1px solid ${bestModuleAttempt.passed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                  }}>
                    {bestModuleAttempt.passed ? <Check size={12} style={{ display: 'inline', marginRight: 3 }} /> : null}
                    Quiz: {bestModuleAttempt.percentage}%
                  </span>
                )}
                <Button
                  variant={isModuleComplete ? "secondary" : "ghost"}
                  size="sm"
                  disabled={!isModuleComplete}
                  onClick={isModuleComplete ? () => navigate(`/quiz/${module.quizSlug}`) : undefined}
                  leftIcon={!isModuleComplete ? <Lock size={14} /> : bestModuleAttempt ? <RotateCcw size={14} /> : <HelpCircle size={14} />}
                  title={!isModuleComplete ? `Complete all ${module.topicIds.length} lessons in this module to unlock the quiz` : bestModuleAttempt ? 'Retake Quiz' : 'Take Module Quiz'}
                  style={!isModuleComplete ? { opacity: 0.65, cursor: 'not-allowed' } : undefined}
                >
                  {!isModuleComplete ? 'Quiz Locked' : bestModuleAttempt ? 'Retake Quiz' : 'Take Module Quiz'}
                </Button>
              </div>
            </div>

            <div className={styles.grid}>
              {moduleTopics.map(topic => {
                const isPlayable = topic.content !== undefined;

                return (
                  <Card
                    key={topic.id}
                    variant={isPlayable ? "interactive" : "default"}
                    onClick={isPlayable ? () => navigate(`/learn/${topic.slug}`) : undefined}
                    className={styles.topicCard}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.titleArea}>
                        <span className={styles.icon}><TopicIcon icon={topic.icon} size={20} /></span>
                        <h3 className={styles.cardTitle}>{topic.title}</h3>
                      </div>
                      <div className={styles.statusArea}>
                        {topic.isComplete ? (
                          <span className={styles.statusComplete} title="Completed">
                            <CheckCircle2 size={18} />
                          </span>
                        ) : (
                          <span className={styles.statusPending} title="Available">
                            <Circle size={18} />
                          </span>
                        )}
                      </div>
                    </div>

                    <p className={styles.cardDesc}>{topic.description}</p>

                    {/* Feature Badges */}
                    <div className={styles.badgeRow}>
                      {topic.labLink && (
                        <span className={`${styles.tagBadge} ${styles.tagLab}`}>
                          <FlaskConical size={12} style={{ display: 'inline', marginRight: 4 }} /> Lab Included
                        </span>
                      )}
                      {topic.miniOsScenario && (
                        <span className={`${styles.tagBadge} ${styles.tagScenario}`}>
                          <Terminal size={12} style={{ display: 'inline', marginRight: 4 }} /> Mini-OS Scenario
                        </span>
                      )}
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={styles.actionBtn}>
                        Start Lesson <ArrowRight size={14} />
                      </span>
                      {topic.isComplete && (
                        <span className={styles.completedLabel}>
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

    </div>
  );
};

export default LearnPage;
