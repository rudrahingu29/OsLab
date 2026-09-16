import api from './api';

export const fetchProgress = async () => {
  const response = await api.get('/progress');
  return response.data;
};

export const updateProgress = async (topic: string, completed: boolean, progress = 100) => {
  const response = await api.post('/progress', { topic, completed, progress });
  return response.data;
};
