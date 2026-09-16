import { Question, QuizAttempt } from './quiz.model';
import { ISubmittedAnswer, IQuizResult } from './quiz.types';
import { LearningProgress } from '../progress/progress.model';
import { normalizeTopic } from '../progress/progress.validation';
import { ApiError } from '../../utils/ApiError';
import mongoose from 'mongoose';

export class QuizService {
  public static async getQuestionsByTopic(topicSlug: string, limit: number = 10) {
    const normalizedTopic = normalizeTopic(topicSlug);

    let questions;
    if (normalizedTopic === 'final-exam') {
      const explicitFinal = await Question.find({ topic: 'final-exam' }).limit(limit);
      if (explicitFinal.length >= limit) {
        questions = explicitFinal;
      } else {
        // Pull questions across all modules to reach target limit
        const otherQuestions = await Question.find({ topic: { $ne: 'final-exam' } }).limit(limit - explicitFinal.length);
        questions = [...explicitFinal, ...otherQuestions];
      }
    } else {
      questions = await Question.find({ topic: normalizedTopic }).limit(limit);
    }

    return {
      topic: normalizedTopic,
      questions,
    };
  }

  public static async gradeSubmission(
    userId: string,
    topicSlug: string,
    answers: ISubmittedAnswer[]
  ): Promise<IQuizResult> {
    const normalizedTopic = normalizeTopic(topicSlug);
    const questionIds = answers.map(a => a.questionId);

    // Explicitly select +correctAnswer +explanation to grade and provide answer review
    const questions = await Question.find({ _id: { $in: questionIds } })
      .select('+correctAnswer +explanation');

    if (questions.length !== answers.length) {
      throw new ApiError(400, 'One or more invalid question IDs provided in submission');
    }

    const questionMap = new Map<string, any>(questions.map(q => [q._id.toString(), q]));

    let score = 0;
    let maxScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;

    const answersReview: any[] = [];

    const attemptAnswers = answers.map(submitted => {
      const q = questionMap.get(submitted.questionId);
      if (!q) {
        throw new ApiError(400, `Question ID ${submitted.questionId} not found`);
      }

      if (submitted.answer < 0 || submitted.answer >= q.options.length) {
        throw new ApiError(400, `Answer index ${submitted.answer} out of bounds for question ${submitted.questionId}`);
      }

      const isCorrect = submitted.answer === q.correctAnswer;
      const questionMarks = q.marks || 1;

      maxScore += questionMarks;
      if (isCorrect) {
        score += questionMarks;
        correctCount++;
      } else {
        incorrectCount++;
      }

      answersReview.push({
        questionId: q._id.toString(),
        question: q.question,
        options: q.options,
        selectedAnswer: submitted.answer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
        reviewTopicSlug: q.reviewTopicSlug,
        labSimulatorLink: q.labSimulatorLink,
      });

      return {
        questionId: new mongoose.Types.ObjectId(submitted.questionId),
        selectedAnswer: submitted.answer,
        isCorrect,
      };
    });

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const passThreshold = normalizedTopic === 'final-exam' ? 80 : 60;
    const passed = percentage >= passThreshold;

    // 1. Save QuizAttempt record
    const attempt = await QuizAttempt.create({
      userId: new mongoose.Types.ObjectId(userId),
      topic: normalizedTopic,
      score,
      maxScore,
      percentage,
      passed,
      answers: attemptAnswers,
    });

    // 2. Update Progress atomically
    const existingProgress = await LearningProgress.findOne({ userId, topic: normalizedTopic });

    const updateFields: any = {
      lastAccessedAt: new Date(),
    };

    if (passed) {
      updateFields.quizCompleted = true;
    }

    if (!existingProgress) {
      updateFields.bestQuizPercentage = percentage;
      updateFields.completionPercentage = passed ? 100 : Math.min(percentage, 50);
      await LearningProgress.create({
        userId,
        topic: normalizedTopic,
        ...updateFields,
      });
    } else {
      if (percentage > (existingProgress.bestQuizPercentage || 0)) {
        updateFields.bestQuizPercentage = percentage;
      }
      if (passed && !existingProgress.quizCompleted) {
        updateFields.quizCompleted = true;
        updateFields.completionPercentage = 100;
      }
      await LearningProgress.updateOne({ userId, topic: normalizedTopic }, updateFields);
    }

    return {
      score,
      maxScore,
      percentage,
      correct: correctCount,
      incorrect: incorrectCount,
      attempted: answers.length,
      passed,
      attemptId: attempt._id.toString(),
      topic: normalizedTopic,
      answersReview,
    };
  }

  public static async getUserHistory(userId: string, topicSlug?: string, page: number = 1, limit: number = 20) {
    const query: any = { userId };
    if (topicSlug) {
      query.topic = normalizeTopic(topicSlug);
    }

    const pageNum = Math.max(1, page);
    const limitNum = Math.min(100, Math.max(1, limit));
    const skip = (pageNum - 1) * limitNum;

    const [attempts, total] = await Promise.all([
      QuizAttempt.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      QuizAttempt.countDocuments(query),
    ]);

    return {
      data: attempts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  public static async getAttemptById(userId: string, attemptId: string) {
    const attempt = await QuizAttempt.findOne({ _id: attemptId, userId }).populate({
      path: 'answers.questionId',
      select: '+correctAnswer +explanation question options marks difficulty reviewTopicSlug labSimulatorLink',
    });

    if (!attempt) {
      throw new ApiError(404, 'Quiz attempt not found');
    }
    return attempt;
  }
}
