import axios, { AxiosInstance, AxiosError } from 'axios';

// Default to localhost:8001 as specified in API_GUIDE.md
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 150000, // 150 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens (if needed later)
apiClient.interceptors.request.use(
  (config) => {
    // Future: Add authentication token here if needed
    // const token = localStorage.getItem('access_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data as { detail?: string };
      console.error('API Error:', errorData.detail || 'Unknown error');
      
      // You can add custom error handling here
      if (error.response.status === 401) {
        // Handle unauthorized - maybe redirect to login
        console.error('Unauthorized - please login');
      } else if (error.response.status === 404) {
        console.error('Resource not found');
      } else if (error.response.status === 500) {
        console.error('Server error');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('No response from server. Is the backend running?');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to create FormData for file uploads
export const createFormData = (data: Record<string, unknown>): FormData => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (typeof value === 'object' && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  
  return formData;
};

export default apiClient;
