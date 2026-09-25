import React, { useState } from 'react';
import { Card, Button } from '../../../components/common';
import type { AdminQuestion, QuestionDifficulty } from '../types';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import AdminAddQuestionModal from './AdminAddQuestionModal';
import styles from '../AdminPage.module.css';

interface AdminQuizzesProps {
  questions: AdminQuestion[];
  onAddQuestion: (q: Omit<AdminQuestion, 'id' | 'successRate'>) => void;
  onDeleteQuestion: (qId: string) => void;
}

const TOPICS = [
  { slug: 'processes-and-threads', name: 'Processes & Threads' },
  { slug: 'cpu-scheduling', name: 'CPU Scheduling' },
  { slug: 'deadlocks-and-synchronization', name: 'Deadlocks & Sync' },
  { slug: 'memory-management', name: 'Memory Management' },
  { slug: 'disk-scheduling', name: 'Disk Scheduling' },
];

export const AdminQuizzes: React.FC<AdminQuizzesProps> = ({
  questions,
  onAddQuestion,
  onDeleteQuestion,
}) => {
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0].slug);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const currentTopicObj = TOPICS.find((t) => t.slug === selectedTopic) || TOPICS[0];
  const topicQuestions = questions.filter((q) => q.topicSlug === selectedTopic);

  const getDifficultyBadge = (difficulty: QuestionDifficulty) => {
    switch (difficulty) {
      case 'easy':
        return <span className={`${styles.diffBadge} ${styles.diffEasy}`}>Easy</span>;
      case 'hard':
        return <span className={`${styles.diffBadge} ${styles.diffHard}`}>Hard</span>;
      default:
        return <span className={`${styles.diffBadge} ${styles.diffMedium}`}>Medium</span>;
    }
  };

  return (
    <div className={styles.tabContent}>
      {/* Topic Switcher Bar */}
      <div className={styles.topicSelectorRow}>
        {TOPICS.map((topic) => {
          const count = questions.filter((q) => q.topicSlug === topic.slug).length;
          const isActive = selectedTopic === topic.slug;
          return (
            <button
              key={topic.slug}
              type="button"
              className={`${styles.topicTabBtn} ${isActive ? styles.activeTopicTab : ''}`}
              onClick={() => setSelectedTopic(topic.slug)}
            >
              <span>{topic.name}</span>
              <span className={styles.topicCountPill}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <Card className={styles.panelCard}>
        <div className={styles.panelHeader}>
          <div>
            <h3>{currentTopicObj.name} Questions</h3>
            <p className={styles.panelSub}>
              Manage multiple-choice assessment questions and view student success rates.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Question
          </Button>
        </div>

        <div className={styles.questionList}>
          {topicQuestions.map((q, idx) => (
            <div key={q.id} className={styles.questionItemCard}>
              <div className={styles.qHeader}>
                <div className={styles.qNumRow}>
                  <span className={styles.qIndex}>#{idx + 1}</span>
                  {getDifficultyBadge(q.difficulty)}
                  <span className={styles.qSuccessRate}>
                    <CheckCircle2 size={12} /> {q.successRate}% student pass rate
                  </span>
                </div>
                <button
                  className={`${styles.iconActionBtn} ${styles.dangerBtn}`}
                  onClick={() => onDeleteQuestion(q.id)}
                  title="Delete Question"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <p className={styles.questionPrompt}>{q.question}</p>

              <div className={styles.optionsGrid}>
                {q.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === q.correctAnswer;
                  return (
                    <div
                      key={optIdx}
                      className={`${styles.optionItem} ${isCorrect ? styles.correctOption : ''}`}
                    >
                      <span className={styles.optionLetter}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className={styles.optionText}>{opt}</span>
                      {isCorrect && <CheckCircle2 size={14} className={styles.correctIcon} />}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className={styles.explanationBox}>
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}

          {topicQuestions.length === 0 && (
            <div className={styles.emptyTableState}>
              No questions found for this topic. Click "Add Question" to create one.
            </div>
          )}
        </div>
      </Card>

      <AdminAddQuestionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddQuestion={onAddQuestion}
        topicSlug={currentTopicObj.slug}
        topicName={currentTopicObj.name}
      />
    </div>
  );
};

export default AdminQuizzes;
