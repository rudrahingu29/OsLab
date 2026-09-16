import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLearnStore } from '../../../stores/learnStore';
import { useUIStore } from '../../../stores/uiStore';
import { TopicContent as TopicContentComponent } from '../components/TopicContent';
import { Button, Card, Spinner } from '../../../components/common';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Circle, 
  Lock, 
  Menu, 
  X,
  Play,
  Settings,
  HelpCircle,
  BookOpen,
  FileQuestion
} from 'lucide-react';
import styles from './TopicPage.module.css';

interface ChapterGroup {
  id: string;
  name: string;
  topicIds: string[];
  quizSlug: string;
}

const CHAPTERS: ChapterGroup[] = [
  {
    id: 'ch1',
    name: 'Chapter 1: Foundations',
    topicIds: ['intro-to-os', 'hardware-architecture', 'user-vs-kernel-mode', 'system-calls'],
    quizSlug: 'foundations'
  },
  {
    id: 'ch2',
    name: 'Chapter 2: Processes & CPU Scheduling',
    topicIds: ['processes', 'process-states', 'threads-multithreading', 'inter-process-communication', 'cpu-scheduling'],
    quizSlug: 'processes-cpu'
  },
  {
    id: 'ch3',
    name: 'Chapter 3: Synchronization & Deadlocks',
    topicIds: ['synchronization-race-conditions', 'semaphores-mutexes', 'deadlocks'],
    quizSlug: 'synchronization-deadlocks'
  },
  {
    id: 'ch4',
    name: 'Chapter 4: Memory & Paging',
    topicIds: ['memory-management', 'paging-segmentation', 'virtual-memory'],
    quizSlug: 'memory-management'
  },
  {
    id: 'ch5',
    name: 'Chapter 5: Storage & File Systems',
    topicIds: ['disk-management', 'file-systems', 'io-management'],
    quizSlug: 'storage-disk'
  },
  {
    id: 'ch6',
    name: 'Chapter 6: Security & Virtualization',
    topicIds: ['security-protection', 'virtualization-containers'],
    quizSlug: 'security-virtualization'
  }
];

export const TopicPage: React.FC = () => {
  const { topicSlug } = useParams<{ topicSlug: string }>();
  const navigate = useNavigate();
  const { topics, loading, loadProgress, markTopicComplete } = useLearnStore();
  const { addToast } = useUIStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const currentIdx = topics.findIndex((t) => t.slug === topicSlug);
  const topic = topics[currentIdx];

  if (loading && topics.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
        <span style={{ marginTop: '1rem' }}>Loading course content...</span>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className={styles.notFound}>
        <h2>Topic not found</h2>
        <Button onClick={() => navigate('/learn')} variant="primary">
          Back to Learn
        </Button>
      </div>
    );
  }

  const prevTopic = currentIdx > 0 ? topics[currentIdx - 1] : null;
  const nextTopic = currentIdx < topics.length - 1 ? topics[currentIdx + 1] : null;

  const handleMarkComplete = async () => {
    await markTopicComplete(topic.id);
    addToast(`"${topic.title}" marked as completed!`, "success");
  };

  const handleNextClick = async () => {
    if (topic && !topic.isComplete) {
      await markTopicComplete(topic.id);
      addToast(`"${topic.title}" marked as completed!`, "success");
    }
    if (nextTopic) {
      navigate(`/learn/${nextTopic.slug}`);
    }
  };

  return (
    <div className={styles.learnLayout}>
      
      {/* Mobile Sidebar Toggle Header */}
      <div className={styles.mobileBar}>
        <button 
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
          className={styles.menuToggle}
          aria-label="Toggle curriculum sidebar"
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          <span>Course Contents</span>
        </button>
      </div>

      {/* Curriculum Sidebar */}
      <aside className={`${styles.sidebar} ${mobileSidebarOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h3>Operating Systems</h3>
          <p>Curriculum Chapters</p>
        </div>
        <nav className={styles.navStack}>
          {CHAPTERS.map((ch) => {
            const chTopics = topics.filter((t) => ch.topicIds.includes(t.id));
            const completedCount = chTopics.filter((t) => t.isComplete).length;

            return (
              <div key={ch.id} className={styles.chapterSection}>
                <div className={styles.chapterHeader}>
                  <span className={styles.chapterTitle}>{ch.name}</span>
                  <span className={styles.chapterCount}>
                    {completedCount}/{ch.topicIds.length}
                  </span>
                </div>

                {chTopics.map((t) => {
                  const isPlayable = t.content !== undefined;
                  const isActive = t.slug === topicSlug;

                  return (
                    <Link
                      key={t.id}
                      to={isPlayable ? `/learn/${t.slug}` : '#'}
                      onClick={(e) => {
                        if (!isPlayable) {
                          e.preventDefault();
                          addToast(`Topic "${t.title}" is coming soon!`, "info");
                        } else {
                          setMobileSidebarOpen(false);
                        }
                      }}
                      className={`${styles.sidebarItem} ${isActive ? styles.activeItem : ''} ${!isPlayable ? styles.lockedItem : ''}`}
                    >
                      <div className={styles.itemStatus}>
                        {t.isComplete ? (
                          <CheckCircle className={styles.completeIcon} size={15} />
                        ) : isPlayable ? (
                          <Circle className={styles.pendingIcon} size={15} />
                        ) : (
                          <Lock className={styles.lockIcon} size={13} />
                        )}
                      </div>
                      <div className={styles.itemDetails}>
                        <span className={styles.itemTitle}>{t.title}</span>
                      </div>
                    </Link>
                  );
                })}

                {(() => {
                  const isChapterComplete = ch.topicIds.every(id => topics.find(t => t.id === id)?.isComplete);
                  return isChapterComplete ? (
                    <Link
                      to={`/quiz/${ch.quizSlug}`}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={styles.chapterQuizLink}
                    >
                      <HelpCircle size={13} />
                      <span>Take Chapter Quiz</span>
                    </Link>
                  ) : (
                    <div
                      className={`${styles.chapterQuizLink} ${styles.chapterQuizLinkLocked}`}
                      title={`Complete all lessons in ${ch.name} to unlock quiz`}
                    >
                      <Lock size={13} />
                      <span>Quiz Locked</span>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Lesson Content Panel */}
      <main className={styles.lessonContainer}>
        <div className={styles.breadcrumbs}>
          <Link to="/learn" className={styles.breadLink}>Learn</Link>
          <span className={styles.breadDivider}>/</span>
          <span className={styles.breadCurrent}>{topic.title}</span>
        </div>

        <div className={styles.lessonContent}>
          {topic.content ? (
            <TopicContentComponent topic={topic} />
          ) : (
            <Card className={styles.comingSoonBox}>
              <div className={styles.comingSoonIcon}>
                <BookOpen size={36} color="var(--color-primary)" />
              </div>
              <h3>Overview & Concept Overview</h3>
              <p className={styles.comingSoonDesc}>{topic.overview || topic.description}</p>
              <div className={styles.infoBadge}>Topic Content Coming Soon</div>
            </Card>
          )}
        </div>

        {/* Labs & Simulation Shortcuts */}
        {(topic.miniOsScenario || topic.labLink) && (
          <Card className={styles.labCard}>
            <h3 className={styles.labCardTitle}>Hands-On Labs Available</h3>
            <p className={styles.labCardDesc}>Run simulations related to this chapter to bridge concept with observation.</p>
            <div className={styles.labActions}>
              {topic.miniOsScenario && (
                <Button 
                  onClick={() => navigate(`/mini-os?scenario=${topic.miniOsScenario}`)} 
                  variant="primary"
                  leftIcon={<Play size={16} />}
                >
                  Boot in Mini-OS Scenario
                </Button>
              )}
              {topic.labLink && (
                <Button 
                  onClick={() => navigate(topic.labLink!)} 
                  variant="secondary"
                  leftIcon={<Settings size={16} />}
                >
                  Open CPU Lab Simulator
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Chapter Quiz Checkpoint Card */}
        {(() => {
          const getSlug = (slug: string) => {
            if (['intro-to-os', 'hardware-architecture', 'user-vs-kernel-mode', 'system-calls'].includes(slug)) return 'foundations';
            if (['processes', 'process-states', 'threads-multithreading', 'inter-process-communication', 'cpu-scheduling'].includes(slug)) return 'processes-cpu';
            if (['synchronization-race-conditions', 'semaphores-mutexes', 'deadlocks'].includes(slug)) return 'synchronization-deadlocks';
            if (['memory-management', 'paging-segmentation', 'virtual-memory'].includes(slug)) return 'memory-management';
            if (['disk-management', 'file-systems', 'io-management'].includes(slug)) return 'storage-disk';
            if (['security-protection', 'virtualization-containers'].includes(slug)) return 'security-virtualization';
            return 'foundations';
          };
          const currentChapterSlug = getSlug(topic.slug);
          const currentChapter = CHAPTERS.find(ch => ch.quizSlug === currentChapterSlug || ch.topicIds.includes(topic.id));
          const chapterTopics = currentChapter ? topics.filter(t => currentChapter.topicIds.includes(t.id)) : [];
          const completedCount = chapterTopics.filter(t => t.isComplete).length;
          const totalCount = currentChapter ? currentChapter.topicIds.length : 1;
          const isChapterComplete = currentChapter ? completedCount === totalCount : false;

          return (
            <Card style={{ 
              marginTop: '1.5rem', 
              background: isChapterComplete ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255, 255, 255, 0.02)', 
              border: `1px solid ${isChapterComplete ? 'rgba(59, 130, 246, 0.25)' : 'var(--color-border)'}`, 
              padding: '1.25rem' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    background: isChapterComplete ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)', 
                    padding: '10px', 
                    borderRadius: '8px' 
                  }}>
                    {isChapterComplete ? (
                      <FileQuestion size={22} color="#3b82f6" />
                    ) : (
                      <Lock size={22} color="var(--color-text-muted)" />
                    )}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                      Chapter Knowledge Check {isChapterComplete ? '' : '(Locked)'}
                    </h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      {isChapterComplete 
                        ? "Test your understanding of this module's theory and calculations."
                        : `Complete all lessons in this chapter (${completedCount} of ${totalCount} completed) to unlock the chapter quiz.`}
                    </span>
                  </div>
                </div>
                <Button
                  variant={isChapterComplete ? "primary" : "secondary"}
                  disabled={!isChapterComplete}
                  onClick={isChapterComplete ? () => navigate(`/quiz/${currentChapterSlug}`) : undefined}
                  leftIcon={isChapterComplete ? <HelpCircle size={16} /> : <Lock size={16} />}
                  title={!isChapterComplete ? `Complete all lessons in this chapter (${completedCount}/${totalCount}) to unlock` : 'Take Chapter Quiz'}
                >
                  {isChapterComplete ? 'Take Chapter Quiz' : `Locked (${completedCount}/${totalCount})`}
                </Button>
              </div>
            </Card>
          );
        })()}

        {/* Bottom Actions Footer */}
        <footer className={styles.lessonFooter}>
          <div className={styles.footerNav}>
            {prevTopic && prevTopic.content ? (
              <Link to={`/learn/${prevTopic.slug}`} className={styles.navBtn}>
                <ChevronLeft size={16} />
                <span>Prev: {prevTopic.title.split('. ')[1]}</span>
              </Link>
            ) : (
              <div />
            )}
            
            {topic.content && !topic.isComplete && (
              <Button variant="primary" onClick={handleMarkComplete} className={styles.completeBtn}>
                Mark as Complete
              </Button>
            )}

            {topic.isComplete && (
              <span className={styles.completedBadge}>
                <CheckCircle size={16} /> Completed
              </span>
            )}

            {nextTopic && nextTopic.content ? (
              <button onClick={handleNextClick} className={styles.navBtn} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                <span>Next: {nextTopic.title.split('. ')[1]}</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <div />
            )}
          </div>
        </footer>
      </main>

    </div>
  );
};

export default TopicPage;
