import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface UIState {
  theme: 'dark' | 'light';
  toasts: ToastMessage[];
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => {
  const savedTheme = localStorage.getItem('oslab-theme');
  const initialTheme = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';

  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', initialTheme);
  }

  return {
    theme: initialTheme,
    toasts: [],
    setTheme: (theme) => {
      localStorage.setItem('oslab-theme', theme);
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
      }
      set({ theme });
    },
    toggleTheme: () => {
      set((state) => {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('oslab-theme', nextTheme);
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', nextTheme);
        }
        return { theme: nextTheme };
      });
    },
    addToast: (message, type = 'info') => {
      const id = Math.random().toString(36).substr(2, 9);
      set((state) => ({
        toasts: [...state.toasts, { id, message, type }]
      }));
      // Auto-remove after 4 seconds
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter(t => t.id !== id)
        }));
      }, 4000);
    },
    removeToast: (id) => {
      set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }));
    }
  };
});
