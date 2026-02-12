import apiClient, { createFormData } from '@/lib/apiClient';
import type {
  StartSessionResponse,
  ProcessChunkRequest,
  ProcessChunkResponse,
  EndSessionRequest,
  EndSessionResponse,
  GetSessionAnalyticsResponse,
  GazePoint,
} from '@/types/api';

/**
 * Session Management API Service
 * Handles reading sessions with file uploads, chunk processing, and analytics
 */

/**
 * Start a new reading session by uploading a study file (PDF, DOCX, or TXT)
 * @param file - The file to upload
 * @param userId - Optional user ID (defaults to "anonymous")
 * @param sessionId - Optional session ID (auto-generated if not provided)
 * @param metadata - Optional metadata object
 */
export const startSessionWithFile = async (
  file: File,
  userId?: string,
  sessionId?: string,
  metadata?: Record<string, unknown>
): Promise<StartSessionResponse> => {
  const formData = createFormData({
    study_file: file,
    ...(userId && { user_id: userId }),
    ...(sessionId && { session_id: sessionId }),
    ...(metadata && { metadata }),
  });

  const response = await apiClient.post<StartSessionResponse>(
    '/start_session_with_file',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data;
};

/**
 * Process a reading chunk with gaze tracking and transcript data
 * Powered by Phi-4 AI for intelligent analysis
 * @param sessionId - The session ID
 * @param transcript - The reading transcript
 * @param gaze - Array of gaze tracking points (optional)
 */
export const processChunk = async (
  sessionId: string,
  transcript: string,
  gaze: GazePoint[] = []
): Promise<ProcessChunkResponse> => {
  const data: ProcessChunkRequest = {
    session_id: sessionId,
    gaze,
    transcript,
  };

  console.log('Sending process_chunk payload:', JSON.stringify(data, null, 2));

  const response = await apiClient.post<ProcessChunkResponse>(
    '/process_chunk',
    data
  );
  
  return response.data;
};

/**
 * End a reading session and get final summary
 * @param sessionId - The session ID to end
 */
export const endSession = async (
  sessionId: string
): Promise<EndSessionResponse> => {
  const data: EndSessionRequest = {
    session_id: sessionId,
  };

  const response = await apiClient.post<EndSessionResponse>(
    '/end_session',
    data
  );
  
  return response.data;
};

/**
 * Get detailed analytics for a specific session
 * @param sessionId - The session ID
 */
export const getSessionAnalytics = async (
  sessionId: string
): Promise<GetSessionAnalyticsResponse> => {
  const response = await apiClient.get<GetSessionAnalyticsResponse>(
    `/session/${sessionId}/analytics`
  );
  
  return response.data;
};

/**
 * Helper function to validate file type
 */
export const isValidFileType = (file: File): boolean => {
  const validTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
  ];
  return validTypes.includes(file.type);
};

/**
 * Helper function to get file extension
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};
