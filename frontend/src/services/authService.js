import api from './api';

// Auth endpoints
export const register = data => api.post('/auth/register', data).then(res => res.data);
export const login = data => api.post('/auth/login', data).then(res => res.data);
export const getMe = () => api.get('/auth/me').then(res => res.data);
export const getCurrentUser = () => api.get('/auth/me').then(res => res.data);
export const updateProfile = data => api.put('/auth/profile', data).then(res => res.data);

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Check if token is expired (basic check)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
