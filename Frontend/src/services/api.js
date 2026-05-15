import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const predictCategory = async (message) => {
  const response = await api.post('/complaints/predict', { message, citizen_name: 'guest', city: 'Mumbai' });
  return response.data;
};

export const submitComplaint = async (message, category = null, citizen_name, city) => {
  const response = await api.post('/complaints/submit-complaint', { 
    message, 
    category, 
    citizen_name, 
    city 
  });
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getAllComplaints = async () => {
  // Assuming this exists based on the backend routes
  const response = await api.get('/dashboard/complaints');
  return response.data;
};

export const submitFeedback = async (complaintId, rating, feedback) => {
  const response = await api.post(`/complaints/${complaintId}/feedback`, { rating, feedback });
  return response.data;
};

export const workerLogin = async (email, password) => {
  const response = await api.post('/worker/login', { email, password });
  return response.data;
};

export const getWorkerTasks = async (email) => {
  const response = await api.get(`/worker/tasks?email=${email}`);
  return response.data;
};

export const uploadWorkerImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/worker/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateWorkerTask = async (complaint_id, status, completion_note, completion_image) => {
  const response = await api.put('/worker/update-task', {
    complaint_id, status, completion_note, completion_image
  });
  return response.data;
};

export default api;
