import apiClient from '@/lib/apiClient';
import type {
  SubmitAssignmentRequest,
  SubmitAssignmentResponse,
  GetAssignmentsResponse,
  GetWeaknessesResponse,
  BehavioralFlags,
  TaskSubmission,
} from '@/types/api';
import type { SessionResults } from '@/types/intake';

/**
 * Assignment Management API Service
 * Handles assignment submission, retrieval, and weakness analysis
 */

/**
 * Submit assignment/assessment results for a user
 */
export const submitAssignment = async (
  data: SubmitAssignmentRequest
): Promise<SubmitAssignmentResponse> => {
  console.log('Submitting assignment payload:', JSON.stringify(data, null, 2));
  const response = await apiClient.post<SubmitAssignmentResponse>(
    '/submit_assignment',
    data
  );
  return response.data;
};

/**
 * Get all assignments for a specific user
 */
export const getUserAssignments = async (
  userId: string
): Promise<GetAssignmentsResponse> => {
  const response = await apiClient.get<GetAssignmentsResponse>(
    `/user/${userId}/assignments`
  );
  return response.data;
};

/**
 * Get AI-powered analysis of user's learning patterns and weaknesses
 */
export const analyzeUserWeaknesses = async (
  userId: string
): Promise<GetWeaknessesResponse> => {
  const response = await apiClient.get<GetWeaknessesResponse>(
    `/user/${userId}/weaknesses`
  );
  return response.data;
};

/**
 * Helper function to convert intake results to assignment submission format
 */
export const convertIntakeToAssignment = (
  userId: string,
  sessionResults: SessionResults,
  assignmentName: string = 'Initial Intake Assessment'
): SubmitAssignmentRequest => {
  
  // Map frontend task types to backend-accepted enum values
  const mapTaskType = (type: string): string => {
    switch (type) {
      case 'letter_sound':
      case 'phoneme_blend':
      case 'phoneme_segment':
        return 'phonics';
      case 'real_word':
      case 'nonword':
      case 'rapid_naming':
        return 'word_recognition';
      case 'comprehension':
        return 'reading_comprehension';
      case 'reading':
        return 'word_recognition'; // Fallback for general reading
      default:
        return 'word_recognition'; // Safe default
    }
  };

  // Convert intake tasks to backend task format
  let tasks: TaskSubmission[] = sessionResults.tasks.map((task) => {
    // Determine the prompt/target word
    const promptText = typeof task.taskId === 'string' ? task.taskId : `Task ${task.taskId}`;
    
    return {
      task_type: mapTaskType(task.type),
      prompt: `Task: ${promptText}`,
      // Backend expects non-empty strings
      user_response: task.transcript && task.transcript.trim() !== "" ? task.transcript : 'No oral response',
      // correct_answer should optimally be the target word. Using promptText as best guess for now.
      correct_answer: promptText,
      is_correct: task.correct ?? false,
      response_time_ms: Math.max(100, Math.round(task.responseTimeMs) || 1000), // Min 100ms
      difficulty_level: Math.max(1, Math.min(5, task.difficulty || 1)), // Clamp 1-5
    };
  });

  // Ensure at least one task is present to satisfy validation
  if (tasks.length === 0) {
    tasks = [{
      task_type: 'word_recognition',
      prompt: 'Calibration Task',
      user_response: 'Ready',
      correct_answer: 'Ready',
      is_correct: true,
      response_time_ms: 1000,
      difficulty_level: 1
    }];
  }

  // Convert flags to backend format
  const flags: BehavioralFlags = {
    avoid_reading_aloud: Boolean(sessionResults.flags?.avoidReadingAloud),
    high_anxiety_signals: Boolean(sessionResults.flags?.highAnxietySignals),
    frequent_breaks_needed: false,
    prefers_visual_aids: false,
    struggles_with_instructions: false,
    easily_distracted: false,
    low_confidence: false,
    frustration_evident: false,
    needs_encouragement: false,
    slow_processing_speed: false,
    difficulty_tracking_text: false,
    reverses_letters_numbers: false,
    trouble_with_sequencing: false,
    memory_issues: false,
  };

  return {
    user_id: userId,
    session_id: sessionResults.id || `session-${Date.now()}`,
    assignment_name: assignmentName,
    assignment_type: 'diagnostic',
    tasks,
    flags,
  };
};
