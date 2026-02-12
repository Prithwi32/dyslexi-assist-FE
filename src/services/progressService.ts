import apiClient from '@/lib/apiClient';
import type {
  GetUserSessionsResponse,
  GetUserProgressResponse,
} from '@/types/api';

/**
 * Progress Tracking API Service
 * Handles user progress, session history, and performance tracking
 */

/**
 * Get all sessions for a specific user
 * @param userId - The user ID
 * @param limit - Optional limit for number of sessions to return
 */
export const getUserSessions = async (
  userId: string,
  limit?: number
): Promise<GetUserSessionsResponse> => {
  const params = limit ? { limit } : {};
  
  const response = await apiClient.get<GetUserSessionsResponse>(
    `/user/${userId}/sessions`,
    { params }
  );
  
  return response.data;
};

/**
 * Get overall progress overview for a user across all sessions
 * @param userId - The user ID
 */
export const getUserProgress = async (
  userId: string
): Promise<GetUserProgressResponse> => {
  const response = await apiClient.get<GetUserProgressResponse>(
    `/user/${userId}/progress`
  );
  
  return response.data;
};

/**
 * Helper function to calculate progress percentage
 */
export const calculateProgressPercentage = (
  completedSessions: number,
  totalSessions: number
): number => {
  if (totalSessions === 0) return 0;
  return Math.round((completedSessions / totalSessions) * 100);
};

/**
 * Helper function to get performance rating based on score
 */
export const getPerformanceRating = (score: number): string => {
  if (score >= 0.9) return 'excellent';
  if (score >= 0.75) return 'good';
  if (score >= 0.5) return 'needs_improvement';
  return 'struggling';
};

/**
 * Helper function to format score as percentage
 */
export const formatScoreAsPercentage = (score: number): string => {
  return `${Math.round(score * 100)}%`;
};
