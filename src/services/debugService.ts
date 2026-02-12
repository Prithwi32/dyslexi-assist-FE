import apiClient from '@/lib/apiClient';
import type {
  DebugSessionsResponse,
  ClearSessionsResponse,
} from '@/types/api';

/**
 * Debug API Service
 * Development tools for testing and debugging (not for production use)
 */

/**
 * List all active sessions in memory
 * Use this for debugging and testing
 */
export const listAllSessions = async (): Promise<DebugSessionsResponse> => {
  const response = await apiClient.get<DebugSessionsResponse>('/debug/sessions');
  return response.data;
};

/**
 * Clear all sessions from memory
 * WARNING: This will delete all session data. Use only for testing.
 */
export const clearAllSessions = async (): Promise<ClearSessionsResponse> => {
  const response = await apiClient.delete<ClearSessionsResponse>(
    '/debug/clear_all_sessions'
  );
  return response.data;
};
