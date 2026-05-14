import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8005';

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

export default api;
