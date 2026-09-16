import { create } from 'zustand';
import { fetchProgress, updateProgress } from '../services/progressService';
import { topics as initialTopics, type Topic } from '../features/learn/data/topics';

interface LearnState {
  topics: Topic[];
  loading: boolean;
  error: string | null;
  loadProgress: () => Promise<void>;
  markTopicComplete: (topicId: string) => Promise<void>;
}

export const useLearnStore = create<LearnState>((set) => ({
  topics: initialTopics,
  loading: false,
  error: null,
  loadProgress: async () => {
    set({ loading: true, error: null });
    try {
      const backendProgress = await fetchProgress();
      const progressMap = new Map<string, boolean>(
        backendProgress.map((p: any) => [p.topic, p.completed])
      );
      
      set((state) => ({
        topics: state.topics.map(t => ({
          ...t,
          isComplete: progressMap.has(t.id) ? !!progressMap.get(t.id) : t.isComplete
        })),
        loading: false
      }));
    } catch (_err) {
      set({ error: 'Failed to load progress from server', loading: false });
    }
  },
  markTopicComplete: async (topicId) => {
    try {
      await updateProgress(topicId, true);
      set((state) => ({
        topics: state.topics.map(t => t.id === topicId ? { ...t, isComplete: true } : t)
      }));
    } catch (err) {
      console.error('Failed to save completion state', err);
    }
  }
}));
export default useLearnStore;
