import api from '../../../services/api';
import type { QuizQuestion, QuizResult, SubmittedAnswer } from '../types/quiz.types';

export const quizService = {
  async getQuestions(topic: string, limit: number = 10): Promise<QuizQuestion[]> {
    const response = await api.get(`/quizzes/${topic}`, {
      params: { limit },
    });
    return response.data?.data?.questions || [];
  },

  async submitQuiz(topic: string, answers: SubmittedAnswer[]): Promise<QuizResult> {
    const response = await api.post(`/quizzes/${topic}/submit`, { answers });
    return response.data?.data;
  },

  async getAttemptById(attemptId: string) {
    const response = await api.get(`/quizzes/attempts/${attemptId}`);
    return response.data?.data;
  },

  async getUserHistory(topic?: string) {
    const response = await api.get('/quizzes/history', {
      params: topic ? { topic } : {},
    });
    return response.data;
  },
};
