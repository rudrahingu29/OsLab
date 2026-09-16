export interface IQuestionInput {
  stableId: string;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  marks?: number;
  reviewTopicSlug?: string;
  labSimulatorLink?: string;
}

export interface IPublicQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  difficulty: string;
  marks: number;
  reviewTopicSlug?: string;
  labSimulatorLink?: string;
}

export interface ISubmittedAnswer {
  questionId: string;
  answer: number;
}

export interface IQuizSubmission {
  answers: ISubmittedAnswer[];
}

export interface IQuizAnswerReview {
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

export interface IQuizResult {
  score: number;
  maxScore: number;
  percentage: number;
  correct: number;
  incorrect: number;
  attempted: number;
  passed: boolean;
  attemptId: string;
  topic: string;
  answersReview?: IQuizAnswerReview[];
}
