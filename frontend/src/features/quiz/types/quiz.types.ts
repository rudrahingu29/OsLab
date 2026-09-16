export interface QuizQuestion {
  _id: string;
  topic: string;
  question: string;
  options: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  reviewTopicSlug?: string;
  labSimulatorLink?: string;
}

export interface SubmittedAnswer {
  questionId: string;
  answer: number;
}

export interface QuizAnswerReview {
  questionId: string;
  question: string;
  options: string[];
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
  reviewTopicSlug?: string;
  labSimulatorLink?: string;
}

export interface QuizResult {
  score: number;
  maxScore: number;
  percentage: number;
  correct: number;
  incorrect: number;
  attempted: number;
  passed: boolean;
  attemptId: string;
  topic: string;
  answersReview?: QuizAnswerReview[];
}

export interface QuizAttemptItem {
  _id: string;
  topic: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  createdAt: string;
}
