# Backend API Integration

Complete integration with FastAPI backend for Dyslexi-Assist application.

## Overview

This integration provides a comprehensive TypeScript/React interface to the FastAPI backend running on `http://localhost:8001`.

## Features

✅ **Full Type Safety** - Complete TypeScript interfaces for all requests and responses  
✅ **Axios Client** - Pre-configured HTTP client with interceptors  
✅ **Service Modules** - Organized by feature (users, assignments, sessions, progress)  
✅ **Error Handling** - Automatic error interception and logging  
✅ **Testing Suite** - Built-in test functions for all endpoints  
✅ **Helper Functions** - Utilities for data conversion and validation  

## Project Structure

```
src/
├── types/
│   └── api.ts                    # All API type definitions
├── lib/
│   └── apiClient.ts              # Axios client configuration
└── services/
    ├── backendApi.ts             # Main export index
    ├── userService.ts            # User management APIs
    ├── assignmentService.ts      # Assignment APIs
    ├── sessionService.ts         # Session management APIs
    ├── progressService.ts        # Progress tracking APIs
    ├── debugService.ts           # Debug endpoints
    └── apiTests.ts               # Testing utilities
```

## Quick Start

### 1. Install Dependencies

```bash
npm install axios
```

### 2. Set Environment Variable (Optional)

Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8001
```

Default is `http://localhost:8001` if not specified.

### 3. Import and Use

```typescript
import { userService, assignmentService, sessionService } from '@/services/backendApi';

// Health check
const health = await userService.healthCheck();

// Register user
const result = await userService.registerUser({
  email: "student@example.com",
  password: "pass123",
  name: "John Doe",
  age: 12,
  grade_level: "7th Grade"
});

// Submit assignment
await assignmentService.submitAssignment(assignmentData);

// Start session with file
const session = await sessionService.startSessionWithFile(file, userId);
```

## Service Modules

### User Service (`userService`)

**Available Functions:**
- `healthCheck()` - Check if backend is running
- `registerUser(data)` - Register new user
- `loginUser(data)` - Authenticate user
- `getUserProfile(userId)` - Get user profile
- `storeUserSession(user, token)` - Save session locally
- `clearUserSession()` - Clear local session
- `getCurrentUser()` - Get current user from localStorage

**Example:**
```typescript
import { userService } from '@/services/backendApi';

// Register
const result = await userService.registerUser({
  email: "student@example.com",
  password: "securepass123",
  name: "Jane Doe",
  age: 12,
  grade_level: "7th Grade",
  metadata: { school: "Lincoln Elementary" }
});

// Store session
userService.storeUserSession(result.user, result.access_token);

// Login
const loginResult = await userService.loginUser({
  email: "student@example.com",
  password: "securepass123"
});
```

### Assignment Service (`assignmentService`)

**Available Functions:**
- `submitAssignment(data)` - Submit assessment results
- `getUserAssignments(userId)` - Get all user assignments
- `analyzeUserWeaknesses(userId)` - Get AI analysis of weaknesses
- `convertIntakeToAssignment(userId, sessionResults, name)` - Helper to convert intake results

**Example:**
```typescript
import { assignmentService } from '@/services/backendApi';

// Submit assignment
const response = await assignmentService.submitAssignment({
  user_id: "user_abc123",
  session_id: "test_session",
  assignment_name: "Initial Assessment",
  assignment_type: "diagnostic",
  tasks: [
    {
      task_type: "word_recognition",
      prompt: "Read the word: cat",
      user_response: "cat",
      correct_answer: "cat",
      is_correct: true,
      response_time_ms: 1200,
      difficulty_level: 1
    }
  ],
  flags: {
    high_anxiety_signals: false,
    prefers_visual_aids: true
  }
});

// Get user assignments
const assignments = await assignmentService.getUserAssignments("user_abc123");

// Analyze weaknesses
const analysis = await assignmentService.analyzeUserWeaknesses("user_abc123");
```

### Session Service (`sessionService`)

**Available Functions:**
- `startSessionWithFile(file, userId?, sessionId?, metadata?)` - Start reading session
- `processChunk(sessionId, transcript, gaze?)` - Process reading chunk
- `endSession(sessionId)` - End session
- `getSessionAnalytics(sessionId)` - Get session analytics
- `isValidFileType(file)` - Validate file type (PDF, DOCX, TXT)

**Example:**
```typescript
import { sessionService } from '@/services/backendApi';

// Start session with file
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const file = fileInput.files[0];

const session = await sessionService.startSessionWithFile(
  file,
  "user_abc123",
  undefined,
  { grade: "5", difficulty: "medium" }
);

// Process reading chunk
const analysis = await sessionService.processChunk(
  session.session_id,
  "The quick brown fox jumps over the lazy dog",
  [
    { x: 0.12, y: 0.22, t: 1706024400.0 },
    { x: 0.15, y: 0.22, t: 1706024400.5 }
  ]
);

// End session
const summary = await sessionService.endSession(session.session_id);

// Get analytics
const analytics = await sessionService.getSessionAnalytics(session.session_id);
```

### Progress Service (`progressService`)

**Available Functions:**
- `getUserSessions(userId, limit?)` - Get all user sessions
- `getUserProgress(userId)` - Get overall progress
- `calculateProgressPercentage(completed, total)` - Helper
- `getPerformanceRating(score)` - Helper
- `formatScoreAsPercentage(score)` - Helper

**Example:**
```typescript
import { progressService } from '@/services/backendApi';

// Get user sessions
const sessions = await progressService.getUserSessions("user_abc123", 10);

// Get overall progress
const progress = await progressService.getUserProgress("user_abc123");

// Use helpers
const percentage = progressService.calculateProgressPercentage(
  progress.progress.completed_sessions,
  progress.progress.total_sessions
);

const rating = progressService.getPerformanceRating(
  progress.progress.overall_average_score
);
```

### Debug Service (`debugService`)

**Available Functions:**
- `listAllSessions()` - List all active sessions
- `clearAllSessions()` - Clear all sessions (testing only)

**Example:**
```typescript
import { debugService } from '@/services/backendApi';

// List sessions
const sessions = await debugService.listAllSessions();

// Clear sessions (be careful!)
const result = await debugService.clearAllSessions();
```

## Testing

### Built-in Test Suite

Access the test page at `/api-test` route or run tests programmatically:

```typescript
import { testBackendIntegration } from '@/services/apiTests';

// Run all tests
const results = await testBackendIntegration();
```

### Individual Tests

```typescript
import { 
  testHealthCheck,
  testUserRegistration,
  testUserLogin,
  testSubmitAssignment 
} from '@/services/apiTests';

// Test health
await testHealthCheck();

// Test registration
await testUserRegistration();
```

### Test Page UI

Visit `http://localhost:5173/api-test` to access the visual test interface.

## Type Definitions

All types are defined in `src/types/api.ts`:

```typescript
import type {
  User,
  RegisterRequest,
  LoginRequest,
  SubmitAssignmentRequest,
  ProcessChunkRequest,
  GazePoint,
  // ... and many more
} from '@/types/api';
```

## Error Handling

The API client automatically handles errors:

```typescript
try {
  const result = await userService.registerUser(userData);
} catch (error) {
  if (axios.isAxiosError(error)) {
    // Handle axios error
    console.error(error.response?.data?.detail);
  }
}
```

Errors are logged to console with helpful messages:
- **401** - Unauthorized (login required)
- **404** - Resource not found
- **500** - Server error
- **Network** - Backend not running

## Integration with Intake System

Convert intake results to backend assignment format:

```typescript
import { assignmentService } from '@/services/backendApi';
import { useIntakeStore } from '@/store/intakeStore';

// Get intake results
const { generateResults } = useIntakeStore();
const sessionResults = generateResults();

// Convert and submit
const assignmentData = assignmentService.convertIntakeToAssignment(
  userId,
  sessionResults,
  "Initial Reading Assessment"
);

const response = await assignmentService.submitAssignment(assignmentData);
```

## Prerequisites

1. **Backend Running** - FastAPI server must be running on `http://localhost:8001`
2. **MongoDB Connected** - Database connection required for full functionality
3. **CORS Enabled** - Backend must allow requests from frontend origin

## Common Issues

### "No response from server"
- Check if backend is running: `http://localhost:8001/health`
- Verify port 8001 is not in use by another service

### CORS Errors
- Ensure FastAPI has CORS middleware configured for `http://localhost:5173`

### Type Errors
- Ensure all TypeScript types match API_GUIDE.md specifications
- Check for null/undefined values in required fields

## API Endpoints Reference

Full list of available endpoints:

**User Management:**
- `GET /health` - Health check
- `POST /register` - Register user
- `POST /login` - Login user
- `GET /user/{user_id}` - Get user profile

**Assignment Management:**
- `POST /submit_assignment` - Submit assignment
- `GET /user/{user_id}/assignments` - Get assignments
- `GET /user/{user_id}/weaknesses` - Analyze weaknesses

**Session Management:**
- `POST /start_session_with_file` - Start session
- `POST /process_chunk` - Process chunk
- `POST /end_session` - End session
- `GET /session/{session_id}/analytics` - Get analytics

**Progress Tracking:**
- `GET /user/{user_id}/sessions` - Get user sessions
- `GET /user/{user_id}/progress` - Get user progress

**Debug:**
- `GET /debug/sessions` - List sessions
- `DELETE /debug/clear_all_sessions` - Clear sessions

## Next Steps

1. ✅ All API services are implemented and ready
2. ✅ Type definitions match API specifications
3. ✅ Error handling is configured
4. ✅ Test suite is available
5. 🔄 Integrate services into existing components
6. 🔄 Add authentication flow with tokens
7. 🔄 Create session management UI
8. 🔄 Build progress tracking dashboard

## License

Part of Dyslexi-Assist application.
