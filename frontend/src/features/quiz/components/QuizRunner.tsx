import React, { useState, useEffect, useCallback } from 'react';
import type { QuizQuestion, SubmittedAnswer } from '../types/quiz.types';
import { Button, ProgressBar, Modal } from '../../../components/common';
import { ChevronLeft, ChevronRight, Flag, CheckCircle, Clock, AlertTriangle, Send, Award } from 'lucide-react';
import styles from './QuizRunner.module.css';

interface QuizRunnerProps {
  topicTitle: string;
  questions: QuizQuestion[];
  isFinalExam?: boolean;
  timeLimitMinutes?: number;
  onSubmit: (answers: SubmittedAnswer[]) => void;
  submitting?: boolean;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  topicTitle,
  questions,
  isFinalExam = false,
  timeLimitMinutes = 20,
  onSubmit,
  submitting = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(isFinalExam ? timeLimitMinutes * 60 : 0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSubmit = useCallback(() => {
    const completePayload: SubmittedAnswer[] = questions.map((q) => ({
      questionId: q._id,
      answer: selectedAnswers[q._id] !== undefined ? selectedAnswers[q._id] : 0,
    }));

    onSubmit(completePayload);
  }, [questions, selectedAnswers, onSubmit]);

  // Timer logic for final exam
  useEffect(() => {
    if (!isFinalExam || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinalExam, timeLeft, handleSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (index: number) => {
    if (!currentQ) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ._id]: index,
    }));
  };

  const handleToggleFlag = () => {
    if (!currentQ) return;
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQ._id]: !prev[currentQ._id],
    }));
  };

  const isFlagged = currentQ ? Boolean(flaggedQuestions[currentQ._id]) : false;

  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  if (!currentQ) {
    return <div className={styles.questionCard}>No questions available.</div>;
  }

  return (
    <div className={styles.quizRunnerLayout}>
      {/* Left / Main Question Area */}
      <div className={styles.mainSection}>
        {/* Top bar info */}
        <div className={styles.quizTopBar}>
          <div className={styles.quizMeta}>
            <span className={styles.badge}>
              {isFinalExam ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Award size={13} /> Certification Exam
                </span>
              ) : (
                'Chapter Checkpoint'
              )}
            </span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {topicTitle}
            </span>
          </div>

          {isFinalExam && (
            <div className={`${styles.timer} ${timeLeft < 180 ? styles.timerWarning : ''}`}>
              <Clock size={16} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {/* Question Progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
            <span>Question {currentIndex + 1} of {totalQuestions}</span>
            <span>{answeredCount} of {totalQuestions} Answered</span>
          </div>
          <ProgressBar value={Math.round(((currentIndex + 1) / totalQuestions) * 100)} size="sm" />
        </div>

        {/* Question Card */}
        <div className={styles.questionCard}>
          <div className={styles.questionHeader}>
            <span className={styles.questionNumber}>
              Question {currentIndex + 1} • {currentQ.marks} Mark{currentQ.marks > 1 ? 's' : ''}
            </span>
            <button
              type="button"
              className={`${styles.flagBtn} ${isFlagged ? styles.flagBtnActive : ''}`}
              onClick={handleToggleFlag}
            >
              <Flag size={14} fill={isFlagged ? 'currentColor' : 'none'} />
              {isFlagged ? 'Flagged' : 'Mark for Review'}
            </button>
          </div>

          <h3 className={styles.questionText}>{currentQ.question}</h3>

          <div className={styles.optionsList}>
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentQ._id] === idx;
              return (
                <div
                  key={idx}
                  className={`${styles.optionCard} ${isSelected ? styles.optionCardSelected : ''}`}
                  onClick={() => handleSelectOption(idx)}
                >
                  <div className={styles.optionIndex}>{optionLetters[idx] || idx + 1}</div>
                  <div className={styles.optionLabel}>{opt}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className={styles.navigationBar}>
          <Button
            variant="secondary"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            leftIcon={<ChevronLeft size={16} />}
          >
            Previous
          </Button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {currentIndex < totalQuestions - 1 ? (
              <Button
                variant="primary"
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                rightIcon={<ChevronRight size={16} />}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => setShowSubmitConfirm(true)}
                isLoading={submitting}
                rightIcon={<Send size={16} />}
              >
                Finish & Submit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Right Question Palette Sidebar */}
      <aside className={styles.paletteCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 className={styles.paletteHeader}>Question Palette</h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>
            {answeredCount}/{totalQuestions}
          </span>
        </div>

        <div className={styles.paletteGrid}>
          {questions.map((q, idx) => {
            const isQAnswered = selectedAnswers[q._id] !== undefined;
            const isQFlagged = Boolean(flaggedQuestions[q._id]);
            const isQCurrent = idx === currentIndex;

            let statusClass = '';
            if (isQFlagged) {
              statusClass = styles.paletteBtnFlagged;
            } else if (isQAnswered) {
              statusClass = styles.paletteBtnAnswered;
            }

            return (
              <button
                key={q._id}
                type="button"
                className={`${styles.paletteBtn} ${statusClass} ${isQCurrent ? styles.paletteBtnCurrent : ''}`}
                onClick={() => setCurrentIndex(idx)}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className={styles.paletteLegend}>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendAnswered}`} />
            <span>Answered ({answeredCount})</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendFlagged}`} />
            <span>Flagged ({Object.values(flaggedQuestions).filter(Boolean).length})</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendUnanswered}`} />
            <span>Unanswered ({totalQuestions - answeredCount})</span>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowSubmitConfirm(true)}
          isLoading={submitting}
          style={{ width: '100%', marginTop: '0.5rem' }}
          leftIcon={<CheckCircle size={16} />}
        >
          Submit Quiz
        </Button>
      </aside>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <Modal
          isOpen={showSubmitConfirm}
          onClose={() => setShowSubmitConfirm(false)}
          title="Confirm Quiz Submission"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {answeredCount < totalQuestions && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '6px', color: '#f59e0b' }}>
                <AlertTriangle size={20} />
                <span style={{ fontSize: '0.9rem' }}>
                  You have <strong>{totalQuestions - answeredCount} unanswered</strong> question{totalQuestions - answeredCount > 1 ? 's' : ''}!
                </span>
              </div>
            )}
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: 0 }}>
              Are you sure you want to finalize your submission? Once submitted, your score will be recorded and detailed answer explanations will be displayed.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button variant="secondary" onClick={() => setShowSubmitConfirm(false)}>
                Back to Questions
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowSubmitConfirm(false);
                  handleSubmit();
                }}
                isLoading={submitting}
              >
                Yes, Submit Now
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
