import api from './api';

export const fetchExperiments = async () => {
  const response = await api.get('/experiments');
  return response.data;
};

export const saveExperiment = async (data: { type: string; algorithm: string; input: any; results: any }) => {
  const response = await api.post('/experiments', data);
  return response.data;
};

export const getExperimentById = async (id: string) => {
  const response = await api.get(`/experiments/${id}`);
  return response.data;
};

export const deleteExperiment = async (id: string) => {
  const response = await api.delete(`/experiments/${id}`);
  return response.data;
};
