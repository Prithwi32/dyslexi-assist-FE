/**
 * Backend API Services Index
 * 
 * This file provides a centralized export of all API services
 * for easy importing throughout the application.
 * 
 * Base URL: http://localhost:8001 (configurable via VITE_API_BASE_URL)
 * 
 * Usage:
 * ```typescript
 * import { userService, assignmentService, sessionService } from '@/services/backendApi';
 * 
 * // Health check
 * const health = await userService.healthCheck();
 * 
 * // Register user
 * const result = await userService.registerUser({
 *   email: "student@example.com",
 *   password: "pass123",
 *   name: "John Doe",
 *   age: 12,
 *   grade_level: "7th Grade"
 * });
 * 
 * // Submit assignment
 * const response = await assignmentService.submitAssignment(data);
 * 
 * // Start session with file
 * const session = await sessionService.startSessionWithFile(file, userId);
 * ```
 */

// User Management
export * as userService from './userService';

// Assignment Management
export * as assignmentService from './assignmentService';

// Session Management
export * as sessionService from './sessionService';

// Progress Tracking
export * as progressService from './progressService';

// Debug Tools
export * as debugService from './debugService';

// Re-export types for convenience
export type {
  // User types
  RegisterRequest,
  LoginRequest,
  User,
  RegisterResponse,
  LoginResponse,
  
  // Assignment types
  SubmitAssignmentRequest,
  SubmitAssignmentResponse,
  TaskSubmission,
  BehavioralFlags,
  Assignment,
  GetAssignmentsResponse,
  GetWeaknessesResponse,
  
  // Session types
  StartSessionResponse,
  ProcessChunkRequest,
  ProcessChunkResponse,
  EndSessionRequest,
  EndSessionResponse,
  GetSessionAnalyticsResponse,
  GazePoint,
  ChunkAnalysis,
  
  // Progress types
  GetUserSessionsResponse,
  GetUserProgressResponse,
  SessionSummary,
  UserProgress,
  
  // Common types
  HealthResponse,
  ApiResponse,
  ErrorResponse,
} from '@/types/api';
