import apiClient from '@/lib/apiClient';
import type {
  HealthResponse,
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  User,
} from '@/types/api';

/**
 * User Management API Service
 * Handles user registration, authentication, and profile management
 */

/**
 * Check if the API server is running
 */
export const healthCheck = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
};

/**
 * Register a new user
 */
export const registerUser = async (
  data: RegisterRequest
): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>('/register', data);
  return response.data;
};

/**
 * Login user with email and password
 */
export const loginUser = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/login', data);
  return response.data;
};

/**
 * Get user profile by user ID
 */
export const getUserProfile = async (userId: string): Promise<User> => {
  const response = await apiClient.get<User>(`/user/${userId}`);
  return response.data;
};

/**
 * Helper function to store user session after login/register
 */
export const storeUserSession = (user: User, accessToken: string | null) => {
  localStorage.setItem('user', JSON.stringify(user));
  if (accessToken) {
    localStorage.setItem('access_token', accessToken);
  }
};

/**
 * Helper function to clear user session on logout
 */
export const clearUserSession = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('access_token');
};

/**
 * Helper function to get current user from localStorage
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};
