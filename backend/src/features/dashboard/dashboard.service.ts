import mongoose from 'mongoose';
import { LearningProgress } from '../progress/progress.model';
import { CANONICAL_TOPICS } from '../progress/progress.validation';
import { QuizAttempt } from '../quiz/quiz.model';
import { Experiment } from '../experiment/experiment.model';
import {
  DashboardData,
  TopicDashboardProgress,
  QuizAnalytics,
  ExperimentAnalytics,
  PopularAlgorithm,
  RecentActivityItem,
} from './dashboard.types';

export class DashboardService {
  public static async getDashboardData(userId: string): Promise<DashboardData> {
    const userObjId = new mongoose.Types.ObjectId(userId);

    // Run independent database operations in parallel using Promise.all()
    const [
      progressDocs,
      quizOverallAgg,
      quizTopicAgg,
      expTotalCount,
      expTypeAgg,
      expAlgoAgg,
      recentExperiments,
      recentQuizAttempts,
    ] = await Promise.all([
      // 1. Learning Progress
      LearningProgress.find({ userId: userObjId }).select(
        'topic completionPercentage quizCompleted bestQuizPercentage'
      ),

      // 2a. Quiz Overall Aggregation
      QuizAttempt.aggregate([
        { $match: { userId: userObjId } },
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: 1 },
            passedAttempts: { $sum: { $cond: ['$passed', 1, 0] } },
            totalPercentageSum: { $sum: '$percentage' },
            bestPercentage: { $max: '$percentage' },
          },
        },
      ]),

      // 2b. Quiz Topic Aggregation
      QuizAttempt.aggregate([
        { $match: { userId: userObjId } },
        {
          $group: {
            _id: '$topic',
            attempts: { $sum: 1 },
            bestPercentage: { $max: '$percentage' },
            totalPercentageSum: { $sum: '$percentage' },
            passedAttempts: { $sum: { $cond: ['$passed', 1, 0] } },
          },
        },
      ]),

      // 3a. Experiment Total Count
      Experiment.countDocuments({ userId: userObjId }),

      // 3b. Experiment Type Breakdown
      Experiment.aggregate([
        { $match: { userId: userObjId } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),

      // 3c. Popular Algorithms
      Experiment.aggregate([
        { $match: { userId: userObjId } },
        { $group: { _id: '$algorithm', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      // 4a. Recent Experiments
      Experiment.find({ userId: userObjId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('_id type algorithm createdAt'),

      // 4b. Recent Quiz Attempts
      QuizAttempt.find({ userId: userObjId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('_id topic score maxScore percentage passed createdAt'),
    ]);

    // --- Process Learning Progress & Topics ---
    const progressMap = new Map<string, any>(progressDocs.map(p => [p.topic, p]));

    let totalPercentageSum = 0;
    let topicsCompletedCount = 0;

    const topicProgressList: TopicDashboardProgress[] = CANONICAL_TOPICS.map(topic => {
      const p = progressMap.get(topic);
      const completionPercentage = p ? p.completionPercentage || 0 : 0;
      const quizCompleted = p ? Boolean(p.quizCompleted) : false;
      const bestQuizPercentage = p ? p.bestQuizPercentage || 0 : 0;

      totalPercentageSum += completionPercentage;
      if (completionPercentage >= 100) {
        topicsCompletedCount++;
      }

      return {
        topic,
        completionPercentage,
        quizCompleted,
        bestQuizPercentage,
      };
    });

    const overallProgress = Math.round((totalPercentageSum / CANONICAL_TOPICS.length) * 10) / 10;

    // --- Process Quiz Analytics ---
    const quizSummary = quizOverallAgg[0] || {
      totalAttempts: 0,
      passedAttempts: 0,
      totalPercentageSum: 0,
      bestPercentage: 0,
    };

    const quizzesTaken = quizSummary.totalAttempts;
    const passedAttempts = quizSummary.passedAttempts;
    const failedAttempts = quizzesTaken - passedAttempts;
    const averageQuizPercentage =
      quizzesTaken > 0 ? Math.round(quizSummary.totalPercentageSum / quizzesTaken) : 0;
    const bestQuizPercentage = quizSummary.bestPercentage || 0;
    const passRate = quizzesTaken > 0 ? Math.round((passedAttempts / quizzesTaken) * 100) : 0;

    const quizByTopic = quizTopicAgg.map(t => ({
      topic: t._id,
      attempts: t.attempts,
      bestPercentage: t.bestPercentage,
      averagePercentage: Math.round(t.totalPercentageSum / t.attempts),
      passedAttempts: t.passedAttempts,
    }));

    const quizAnalytics: QuizAnalytics = {
      totalAttempts: quizzesTaken,
      passedAttempts,
      failedAttempts,
      averagePercentage: averageQuizPercentage,
      bestPercentage: bestQuizPercentage,
      passRate,
      byTopic: quizByTopic,
    };

    // --- Process Experiment Analytics ---
    const expByType: Record<string, number> = {};
    expTypeAgg.forEach(item => {
      if (item._id) expByType[item._id] = item.count;
    });

    const expByAlgorithm: Record<string, number> = {};
    const popularAlgorithms: PopularAlgorithm[] = expAlgoAgg.map(item => {
      expByAlgorithm[item._id] = item.count;
      return {
        algorithm: item._id,
        count: item.count,
      };
    });

    const experimentAnalytics: ExperimentAnalytics = {
      total: expTotalCount,
      byType: expByType,
      byAlgorithm: expByAlgorithm,
    };

    // --- Process Unified Recent Activity ---
    const expActivities: RecentActivityItem[] = recentExperiments.map(e => ({
      id: e._id.toString(),
      type: 'experiment',
      title: `${String(e.algorithm).toUpperCase()} Simulation`,
      algorithm: e.algorithm,
      timestamp: e.createdAt,
      details: { type: e.type },
    }));

    const quizActivities: RecentActivityItem[] = recentQuizAttempts.map(q => ({
      id: q._id.toString(),
      type: 'quiz',
      title: `${q.topic} Quiz`,
      topic: q.topic,
      timestamp: q.createdAt,
      details: {
        score: q.score,
        maxScore: q.maxScore,
        percentage: q.percentage,
        passed: q.passed,
      },
    }));

    const combinedActivities = [...expActivities, ...quizActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return {
      overview: {
        overallProgress,
        topicsCompleted: topicsCompletedCount,
        totalTopics: CANONICAL_TOPICS.length,
        experimentsCompleted: expTotalCount,
        quizzesTaken,
        averageQuizPercentage,
        bestQuizPercentage,
      },
      topics: topicProgressList,
      quiz: quizAnalytics,
      experiments: experimentAnalytics,
      popularAlgorithms,
      recentActivity: combinedActivities,
    };
  }
}
