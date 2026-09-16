export interface TopicDashboardProgress {
  topic: string;
  completionPercentage: number;
  quizCompleted: boolean;
  bestQuizPercentage: number;
}

export interface QuizTopicAnalytics {
  topic: string;
  attempts: number;
  bestPercentage: number;
  averagePercentage: number;
  passedAttempts: number;
}

export interface QuizAnalytics {
  totalAttempts: number;
  passedAttempts: number;
  failedAttempts: number;
  averagePercentage: number;
  bestPercentage: number;
  passRate: number;
  byTopic: QuizTopicAnalytics[];
}

export interface ExperimentAnalytics {
  total: number;
  byType: Record<string, number>;
  byAlgorithm: Record<string, number>;
}

export interface PopularAlgorithm {
  algorithm: string;
  count: number;
}

export interface RecentActivityItem {
  id: string;
  type: 'experiment' | 'quiz';
  title: string;
  topic?: string;
  algorithm?: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface DashboardOverview {
  overallProgress: number;
  topicsCompleted: number;
  totalTopics: number;
  experimentsCompleted: number;
  quizzesTaken: number;
  averageQuizPercentage: number;
  bestQuizPercentage: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  topics: TopicDashboardProgress[];
  quiz: QuizAnalytics;
  experiments: ExperimentAnalytics;
  popularAlgorithms: PopularAlgorithm[];
  recentActivity: RecentActivityItem[];
}
