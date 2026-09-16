import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, BookOpen } from 'lucide-react';
import { quizService } from '../services/quizService';
import type { QuizQuestion, QuizResult, SubmittedAnswer } from '../types/quiz.types';
import { QuizRunner } from '../components/QuizRunner';
import { QuizResultView } from '../components/QuizResultView';
import { PageHeader, Spinner, Button } from '../../../components/common';
import { useUIStore } from '../../../stores/uiStore';
import { useLearnStore } from '../../../stores/learnStore';
import styles from './QuizPage.module.css';

const TOPIC_TITLES: Record<string, string> = {
  'foundations': 'Module 1: Foundations & Kernel Architecture',
  'processes-cpu': 'Module 2: Processes, Threads & CPU Scheduling',
  'cpu-scheduling': 'Module 2: Processes, Threads & CPU Scheduling',
  'synchronization-deadlocks': 'Module 3: Synchronization & Deadlocks',
  'deadlocks': 'Module 3: Synchronization & Deadlocks',
  'process-synchronization': 'Module 3: Synchronization & Deadlocks',
  'memory-management': 'Module 4: Memory Management & Virtual Paging',
  'storage-disk': 'Module 5: Storage Hardware & Disk Scheduling',
  'disk-scheduling': 'Module 5: Storage Hardware & Disk Scheduling',
  'security-virtualization': 'Module 6: Security, Protection & Virtualization',
  'final-exam': 'OSLab Certification Examination',
};

const MODULE_TOPIC_MAP: Record<string, string[]> = {
  'foundations': ['intro-to-os', 'hardware-architecture', 'user-vs-kernel-mode', 'system-calls'],
  'processes-cpu': ['processes', 'process-states', 'threads-multithreading', 'inter-process-communication', 'cpu-scheduling'],
  'cpu-scheduling': ['processes', 'process-states', 'threads-multithreading', 'inter-process-communication', 'cpu-scheduling'],
  'synchronization-deadlocks': ['synchronization-race-conditions', 'semaphores-mutexes', 'deadlocks'],
  'deadlocks': ['synchronization-race-conditions', 'semaphores-mutexes', 'deadlocks'],
  'process-synchronization': ['synchronization-race-conditions', 'semaphores-mutexes', 'deadlocks'],
  'memory-management': ['memory-management', 'paging-segmentation', 'virtual-memory'],
  'storage-disk': ['disk-management', 'file-systems', 'io-management'],
  'disk-scheduling': ['disk-management', 'file-systems', 'io-management'],
  'security-virtualization': ['security-protection', 'virtualization-containers'],
};

export const QuizPage: React.FC = () => {
  const { topicSlug } = useParams<{ topicSlug: string }>();
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const { topics, loadProgress } = useLearnStore();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const topicKey = topicSlug?.toLowerCase() || 'foundations';
  const isFinalExam = topicKey === 'final-exam' || topicKey === 'certification-exam';
  const topicTitle = TOPIC_TITLES[topicKey] || `OS Assessment: ${topicSlug}`;

  const requiredTopicIds = MODULE_TOPIC_MAP[topicKey];
  const requiredTopics = requiredTopicIds ? topics.filter(t => requiredTopicIds.includes(t.id)) : [];
  const completedCount = requiredTopics.filter(t => t.isComplete).length;
  const isUnlocked = isFinalExam || !requiredTopicIds || requiredTopics.length === 0 || completedCount === requiredTopics.length;

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setResult(null);
    try {
      const limit = isFinalExam ? 20 : 5;
      const data = await quizService.getQuestions(topicKey, limit);
      setQuestions(data);
    } catch (err: any) {
      console.error('Failed to load quiz questions:', err);
      addToast('Failed to load quiz questions. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [topicKey, isFinalExam, addToast]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSubmit = async (answers: SubmittedAnswer[]) => {
    setSubmitting(true);
    try {
      const res = await quizService.submitQuiz(topicKey, answers);
      setResult(res);
      await loadProgress(); // Sync learn and progress store
      if (res.passed) {
        addToast(
          isFinalExam
            ? 'Congratulations! You earned the OS Master Certification Badge!'
            : 'Chapter quiz passed successfully!',
          'success'
        );
      } else {
        addToast('Quiz submitted. Review your answers below!', 'info');
      }
    } catch (err: any) {
      console.error('Error submitting quiz:', err);
      addToast(err?.response?.data?.message || 'Failed to submit quiz.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    fetchQuestions();
  };

  return (
    <div className={`container-width animate-fade-in ${styles.quizPageContainer}`}>
      <PageHeader
        title={topicTitle}
        description={
          isFinalExam
            ? 'Test your complete mastery of Operating Systems across CPU scheduling, memory, synchronization, storage, and security. Passing (≥ 80%) unlocks the prestigious OS Master badge!'
            : 'Test your understanding of the concepts and algorithms covered in this module.'
        }
        breadcrumbs={[
          { label: 'Curriculum', to: '/learn' },
          { label: topicTitle }
        ]}
      />

      {loading ? (
        <div className={styles.loadingContainer}>
          <Spinner size="lg" />
          <span>Preparing assessment questions...</span>
        </div>
      ) : !isUnlocked ? (
        <div className={styles.emptyState}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '50%', marginBottom: '1rem', display: 'inline-flex' }}>
            <Lock size={36} color="#ef4444" />
          </div>
          <h3>Module Quiz Locked</h3>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '520px', lineHeight: '1.6', margin: '0.5rem auto 1.5rem auto' }}>
            You must complete all lessons in <strong>{topicTitle}</strong> before taking this quiz ({completedCount} of {requiredTopics.length} lessons completed).
          </p>
          <Button variant="primary" onClick={() => navigate('/learn')} leftIcon={<BookOpen size={16} />}>
            Go to Curriculum & Complete Lessons
          </Button>
        </div>
      ) : questions.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No Questions Found</h3>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '500px' }}>
            There are currently no active questions for this module. Please check back soon or explore other modules.
          </p>
          <Button variant="primary" onClick={() => navigate('/learn')}>
            Return to Curriculum
          </Button>
        </div>
      ) : result ? (
        <QuizResultView
          result={result}
          topicTitle={topicTitle}
          isFinalExam={isFinalExam}
          onRetake={handleRetake}
        />
      ) : (
        <QuizRunner
          topicTitle={topicTitle}
          questions={questions}
          isFinalExam={isFinalExam}
          timeLimitMinutes={20}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
};

export default QuizPage;
