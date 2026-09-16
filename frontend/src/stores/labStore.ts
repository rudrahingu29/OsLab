import { create } from 'zustand';
import { fetchExperiments, saveExperiment, deleteExperiment } from '../services/experimentService';

export interface SavedExperiment {
  _id: string;
  type: string;
  algorithm: string;
  input: any;
  results: any;
  createdAt: string;
}

interface LabState {
  experiments: SavedExperiment[];
  loading: boolean;
  error: string | null;
  loadExperiments: () => Promise<void>;
  saveNewExperiment: (data: { type: string; algorithm: string; input: any; results: any }) => Promise<SavedExperiment | null>;
  deleteSavedExperiment: (id: string) => Promise<void>;
}

export const useLabStore = create<LabState>((set) => ({
  experiments: [],
  loading: false,
  error: null,

  loadExperiments: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchExperiments();
      set({ experiments: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch saved experiments', loading: false });
    }
  },

  saveNewExperiment: async (data) => {
    try {
      const created = await saveExperiment(data);
      set((state) => ({
        experiments: [created, ...state.experiments]
      }));
      return created;
    } catch (err: any) {
      console.error('Failed to save experiment:', err);
      return null;
    }
  },

  deleteSavedExperiment: async (id: string) => {
    try {
      await deleteExperiment(id);
      set((state) => ({
        experiments: state.experiments.filter(e => e._id !== id)
      }));
    } catch (err: any) {
      console.error('Failed to delete experiment:', err);
    }
  }
}));

export default useLabStore;
