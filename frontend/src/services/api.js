import axios from 'axios';

// API URL configuration for any hosting service
const getAPIBaseURL = () => {
  // Use environment variable if set (recommended for production)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Default to localhost for development
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getAPIBaseURL();

// Debug logging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Configuration:', {
    NODE_ENV: process.env.NODE_ENV,
    API_BASE_URL,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL
  });
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding token and logging
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
