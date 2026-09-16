import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { QuizResult } from '../types/quiz.types';
import { Button } from '../../../components/common';
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  BookOpen, 
  FlaskConical, 
  ArrowRight,
  Sparkles,
  UserCheck,
  Award
} from 'lucide-react';
import styles from './QuizResultView.module.css';

interface QuizResultViewProps {
  result: QuizResult;
  topicTitle?: string;
  isFinalExam?: boolean;
  onRetake: () => void;
}

export const QuizResultView: React.FC<QuizResultViewProps> = ({
  result,
  topicTitle,
  isFinalExam = false,
  onRetake,
}) => {
  const navigate = useNavigate();

  const isMasterBadgeUnlocked = isFinalExam && result.passed && result.percentage >= 80;
  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className={styles.resultContainer}>
      {/* Top Score Banner */}
      <div className={styles.scoreBanner}>
        <div className={styles.scoreLeft}>
          <div className={`${styles.scoreCircle} ${result.passed ? styles.scorePassed : styles.scoreFailed}`}>
            <span className={styles.percentageNum}>{result.percentage}%</span>
          </div>
          <div className={styles.scoreText}>
            <h2 className={styles.statusTitle}>
              {result.passed ? 'Assessment Passed' : 'Assessment Not Passed'}
            </h2>
            <p className={styles.statusDesc}>
              {topicTitle ? `${topicTitle}: ` : ''}
              {result.passed
                ? `Great job! You achieved ${result.score} out of ${result.maxScore} marks.`
                : `You scored ${result.score}/${result.maxScore}. Pass threshold is ${isFinalExam ? '80%' : '60%'}. Review the answers below and try again!`}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className={styles.actionRow}>
          <Button variant="secondary" onClick={onRetake} leftIcon={<RotateCcw size={16} />}>
            Retake Assessment
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/learn')}
            rightIcon={<ArrowRight size={16} />}
          >
            Back to Curriculum
          </Button>
        </div>
      </div>

      {/* OS Master Badge Unlock Banner */}
      {isMasterBadgeUnlocked && (
        <div className={styles.badgeUnlockedCard}>
          <div className={styles.badgeIcon}>
            <Award size={36} color="#f59e0b" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 className={styles.badgeTitle}>
              <Sparkles size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              OS Master Certification Badge Unlocked!
            </h3>
            <p className={styles.badgeSub}>
              Congratulations! You passed the comprehensive Certification Exam with {result.percentage}%. Your "OS Master" badge is now permanently displayed on your Profile and Dashboard.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/profile')}
            leftIcon={<UserCheck size={16} />}
            style={{ background: '#d97706', borderColor: '#b45309' }}
          >
            View My Badge
          </Button>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <span className={styles.statValue} style={{ color: '#22c55e' }}>{result.correct}</span>
          <span className={styles.statLabel}>Correct</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue} style={{ color: '#ef4444' }}>{result.incorrect}</span>
          <span className={styles.statLabel}>Incorrect</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue} style={{ color: 'var(--color-primary)' }}>{result.score}/{result.maxScore}</span>
          <span className={styles.statLabel}>Total Marks</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{isFinalExam ? '80%' : '60%'}</span>
          <span className={styles.statLabel}>Passing Mark</span>
        </div>
      </div>

      {/* Detailed Question Review List */}
      {result.answersReview && result.answersReview.length > 0 && (
        <div className={styles.reviewSection}>
          <h3 className={styles.reviewSectionHeader}>Question Breakdown & Explanations</h3>

          {result.answersReview.map((rev, idx) => {
            return (
              <div
                key={rev.questionId || idx}
                className={`${styles.reviewCard} ${rev.isCorrect ? styles.reviewCardCorrect : styles.reviewCardIncorrect}`}
              >
                <div className={styles.reviewTop}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    Question {idx + 1}
                  </span>
                  <span
                    className={`${styles.reviewStatusBadge} ${
                      rev.isCorrect ? styles.statusBadgeCorrect : styles.statusBadgeIncorrect
                    }`}
                  >
                    {rev.isCorrect ? (
                      <>
                        <CheckCircle2 size={14} /> Correct (+1)
                      </>
                    ) : (
                      <>
                        <XCircle size={14} /> Incorrect (0)
                      </>
                    )}
                  </span>
                </div>

                <h4 className={styles.reviewQuestionText}>{rev.question}</h4>

                {/* Options with state */}
                <div className={styles.reviewOptionsList}>
                  {rev.options.map((opt, oIdx) => {
                    const isCorrectOpt = oIdx === rev.correctAnswer;
                    const isUserSelected = oIdx === rev.selectedAnswer;

                    let optClass = styles.reviewOption;
                    if (isCorrectOpt) {
                      optClass += ` ${styles.reviewOptionCorrect}`;
                    } else if (isUserSelected && !rev.isCorrect) {
                      optClass += ` ${styles.reviewOptionWrongSelected}`;
                    }

                    return (
                      <div key={oIdx} className={optClass}>
                        <span style={{ fontWeight: 700, width: '20px' }}>
                          {optionLetters[oIdx] || oIdx + 1}.
                        </span>
                        <span style={{ flex: 1 }}>{opt}</span>
                        {isCorrectOpt && <CheckCircle2 size={16} style={{ color: '#22c55e' }} />}
                        {isUserSelected && !rev.isCorrect && (
                          <XCircle size={16} style={{ color: '#ef4444' }} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {rev.explanation && (
                  <div className={styles.explanationBox}>
                    <strong style={{ color: 'var(--color-text-primary)' }}>Explanation: </strong>
                    {rev.explanation}
                  </div>
                )}

                {/* Jump to Review shortcuts (especially for missed questions) */}
                {(rev.reviewTopicSlug || rev.labSimulatorLink) && (
                  <div className={styles.reviewActionRow}>
                    {rev.reviewTopicSlug && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/learn/${rev.reviewTopicSlug}`)}
                        leftIcon={<BookOpen size={14} />}
                      >
                        Review Lesson
                      </Button>
                    )}
                    {rev.labSimulatorLink && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(rev.labSimulatorLink!)}
                        leftIcon={<FlaskConical size={14} />}
                      >
                        Open in Simulator
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
