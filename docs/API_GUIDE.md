# API Guide - Dyslexia Analysis Engine

Complete API reference with cURL examples, request/response formats, and sample data.

## Base URL

```
http://localhost:8001
```

---

## Table of Contents

1. [Health Check](#health-check)
2. [User Management](#user-management)
3. [Assignment Management](#assignment-management)
4. [Session Management](#session-management)
5. [Progress Tracking](#progress-tracking)
6. [Debug Endpoints](#debug-endpoints)

---

## Health Check

Check if the API server is running.

**Endpoint:** `GET /health`

**cURL:**
```bash
curl http://localhost:8001/health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "2.0-simplified"
}
```

---

## User Management

### Register User

Create a new user account.

**Endpoint:** `POST /register`

**cURL:**
```bash
curl -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "securepass123",
    "name": "John Doe",
    "age": 12,
    "grade_level": "7th Grade",
    "metadata": {"school": "Lincoln Elementary"}
  }'
```

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "securepass123",
  "name": "John Doe",
  "age": 12,
  "grade_level": "7th Grade",
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "user_id": "user_abc123",
    "email": "student@example.com",
    "name": "John Doe",
    "age": 12,
    "grade_level": "7th Grade",
    "created_at": "2026-01-28T10:30:00.123456",
    "last_login": null,
    "metadata": {"school": "Lincoln Elementary"}
  },
  "access_token": null
}
```

---

### Login User

Authenticate a user.

**Endpoint:** `POST /login`

**cURL:**
```bash
curl -X POST http://localhost:8001/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "securepass123"
  }'
```

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "user_id": "user_abc123",
    "email": "student@example.com",
    "name": "John Doe",
    "age": 12,
    "grade_level": "7th Grade",
    "created_at": "2026-01-28T10:30:00.123000",
    "last_login": "2026-01-28T11:00:00.456000",
    "metadata": {"school": "Lincoln Elementary"}
  },
  "access_token": null
}
```

---

### Get User Profile

Get user information by user ID.

**Endpoint:** `GET /user/{user_id}`

**cURL:**
```bash
curl http://localhost:8001/user/user_abc123
```

**Response:**
```json
{
  "user_id": "user_abc123",
  "email": "student@example.com",
  "name": "John Doe",
  "age": 12,
  "grade_level": "7th Grade",
  "created_at": "2026-01-28T10:30:00.123000",
  "last_login": "2026-01-28T11:00:00.456000",
  "metadata": {"school": "Lincoln Elementary"}
}
```

---

## Assignment Management

### Submit Assignment

Submit assignment/assessment results for a user.

**Endpoint:** `POST /submit_assignment`

**cURL:**
```bash
curl -X POST http://localhost:8001/submit_assignment \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_abc123",
    "session_id": "assessment_001",
    "assignment_name": "Initial Reading Assessment",
    "assignment_type": "diagnostic",
    "tasks": [
      {
        "task_type": "word_recognition",
        "prompt": "Read the word: cat",
        "user_response": "cat",
        "correct_answer": "cat",
        "is_correct": true,
        "response_time_ms": 1200,
        "difficulty_level": 1
      }
    ],
    "flags": {
      "avoid_reading_aloud": false,
      "high_anxiety_signals": true,
      "frequent_breaks_needed": false,
      "prefers_visual_aids": true,
      "struggles_with_instructions": false,
      "easily_distracted": false,
      "low_confidence": true,
      "frustration_evident": false,
      "needs_encouragement": true,
      "slow_processing_speed": false,
      "difficulty_tracking_text": false,
      "reverses_letters_numbers": false,
      "trouble_with_sequencing": false,
      "memory_issues": false
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "assignment_id": "697776b0addcf747ff42c18c",
  "metrics": {
    "accuracy": 1.0,
    "average_response_time_ms": 1675.0
  }
}
```

---

### Get User Assignments

Retrieve all assignment results for a user.

**Endpoint:** `GET /user/{user_id}/assignments`

**cURL:**
```bash
curl http://localhost:8001/user/user_abc123/assignments
```

**Response:**
```json
{
  "success": true,
  "user_id": "user_abc123",
  "total_assignments": 1,
  "assignments": [
    {
      "_id": "697776b0addcf747ff42c18c",
      "user_id": "user_abc123",
      "session_id": "assessment_001",
      "assignment_name": "Initial Reading Assessment",
      "assignment_type": "diagnostic",
      "accuracy": 1.0,
      "average_response_time_ms": 1675.0,
      "created_at": "2026-01-28T14:16:48.520000"
    }
  ]
}
```

---

### Analyze User Weaknesses

Get AI-powered analysis of user's learning patterns and weaknesses.

**Endpoint:** `GET /user/{user_id}/weaknesses`

**cURL:**
```bash
curl http://localhost:8001/user/user_abc123/weaknesses
```

**Response:**
```json
{
  "success": true,
  "user_id": "user_abc123",
  "analysis": {
    "overall_accuracy": 1.0,
    "behavioral_patterns": {
      "high_anxiety_signals": 1,
      "prefers_visual_aids": 1,
      "low_confidence": 1,
      "needs_encouragement": 1
    },
    "task_type_accuracy": {
      "word_recognition": 1.0,
      "phonics": 1.0
    },
    "recommendations": [
      "Student shows high anxiety. Provide a calm, supportive environment.",
      "Consider using more visual learning aids based on preference.",
      "Build confidence through positive reinforcement."
    ]
  }
}
```

---

## Session Management

### Start Session with File

Start a new reading session by uploading a study file (PDF, DOCX, or TXT).

**Endpoint:** `POST /start_session_with_file`

**cURL:**
```bash
curl -X POST http://localhost:8001/start_session_with_file \
  -F "study_file=@reading_material.pdf" \
  -F "user_id=user_abc123" \
  -F "session_id=session_001" \
  -F 'metadata={"grade": "5", "difficulty": "medium"}'
```

**Request (multipart/form-data):**
- `study_file` (file, required) - PDF, DOCX, or TXT file
- `user_id` (string, optional) - User identifier (defaults to "anonymous")
- `session_id` (string, optional) - Session identifier (auto-generated if not provided)
- `metadata` (string, optional) - JSON string with additional metadata

**Response:**
```json
{
  "success": true,
  "session_id": "session-5474c50831803224",
  "file_name": "reading_material.pdf",
  "study_text": "The quick brown fox jumps over the lazy dog...",
  "text_length": 157,
  "metadata": {"grade": "5", "difficulty": "medium"}
}
```

---

### Process Chunk

Process a reading chunk with gaze tracking and transcript data. Powered by Phi-4 AI.

**Endpoint:** `POST /process_chunk`

**cURL:**
```bash
curl -X POST http://localhost:8001/process_chunk \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session-5474c50831803224",
    "gaze": [
      {"x": 0.12, "y": 0.22, "t": 1706024400.0},
      {"x": 0.15, "y": 0.22, "t": 1706024400.5},
      {"x": 0.18, "y": 0.23, "t": 1706024401.0}
    ],
    "transcript": "The quick brown fox jumps over the lazy dog"
  }'
```

**Request Body:**
```json
{
  "session_id": "session-5474c50831803224",
  "gaze": [
    {"x": 0.12, "y": 0.22, "t": 1706024400.0},
    {"x": 0.15, "y": 0.22, "t": 1706024400.5}
  ],
  "transcript": "The quick brown fox jumps over the lazy dog"
}
```

**Gaze Point Format:**
- `x` (float, 0.0-1.0) - Normalized horizontal position
- `y` (float, 0.0-1.0) - Normalized vertical position
- `t` (float) - Unix timestamp in seconds

**Response:**
```json
{
  "success": true,
  "analysis": {
    "reading_score": 0.85,
    "performance_category": "good",
    "errors_detected": [],
    "concentration_analysis": {
      "focus_level": "moderate",
      "issues": [],
      "attention_span": "good"
    },
    "pronunciation_issues": [],
    "feedback": "Good reading! No errors detected.",
    "intervention_needed": false,
    "intervention_message": "Great job!"
  },
  "session_info": {
    "total_chunks_processed": 2,
    "average_score": 0.85
  }
}
```

**Performance Categories:**
- `excellent` - Score > 0.9
- `good` - Score 0.75-0.9
- `needs_improvement` - Score 0.5-0.75
- `struggling` - Score < 0.5

---

### End Session

Close a reading session and get final summary.

**Endpoint:** `POST /end_session`

**cURL:**
```bash
curl -X POST http://localhost:8001/end_session \
  -H "Content-Type: application/json" \
  -d '{"session_id": "session-5474c50831803224"}'
```

**Request Body:**
```json
{
  "session_id": "session-5474c50831803224"
}
```

**Response:**
```json
{
  "success": true,
  "session_id": "session-5474c50831803224",
  "user_id": "user_abc123",
  "file_name": "reading_material.pdf",
  "total_chunks_processed": 1,
  "total_errors": 0,
  "average_score": 0.85,
  "feedback_count": 1
}
```

---

### Get Session Analytics

Get detailed analytics for a specific session.

**Endpoint:** `GET /session/{session_id}/analytics`

**cURL:**
```bash
curl http://localhost:8001/session/session-5474c50831803224/analytics
```

**Response:**
```json
{
  "success": true,
  "analytics": {
    "session_id": "session-5474c50831803224",
    "user_id": "user_abc123",
    "total_chunks": 1,
    "average_score": 0.85,
    "total_errors": 0,
    "completed": true,
    "created_at": "2026-01-28T14:15:58.123000",
    "chunks": [
      {
        "chunk_number": 1,
        "transcript": "The quick brown fox...",
        "gaze_points_count": 3,
        "reading_score": 0.85,
        "errors_count": 0,
        "timestamp": "2026-01-28T14:16:05.456000"
      }
    ]
  }
}
```

---

## Progress Tracking

### Get User Sessions

Retrieve all sessions for a user.

**Endpoint:** `GET /user/{user_id}/sessions?limit=10`

**cURL:**
```bash
curl "http://localhost:8001/user/user_abc123/sessions?limit=10"
```

**Response:**
```json
{
  "success": true,
  "user_id": "user_abc123",
  "total_sessions": 1,
  "sessions": [
    {
      "session_id": "session-5474c50831803224",
      "user_id": "user_abc123",
      "file_name": "reading_material.pdf",
      "study_text_preview": "The quick brown fox...",
      "total_chunks_processed": 1,
      "average_score": 0.85,
      "total_errors": 0,
      "completed": true,
      "created_at": "2026-01-28T14:15:58.123000"
    }
  ]
}
```

---

### Get User Progress

Get overall progress overview for a user across all sessions.

**Endpoint:** `GET /user/{user_id}/progress`

**cURL:**
```bash
curl http://localhost:8001/user/user_abc123/progress
```

**Response:**
```json
{
  "success": true,
  "progress": {
    "user_id": "user_abc123",
    "total_sessions": 5,
    "completed_sessions": 4,
    "total_chunks_processed": 23,
    "overall_average_score": 0.78,
    "recent_sessions": [
      {
        "session_id": "session-5474c50831803224",
        "file_name": "reading_material.pdf",
        "average_score": 0.85,
        "chunks_processed": 1,
        "created_at": "2026-01-28T14:15:58.123000"
      }
    ]
  }
}
```

---

## Debug Endpoints

### List All Sessions

List all active sessions in memory.

**Endpoint:** `GET /debug/sessions`

**cURL:**
```bash
curl http://localhost:8001/debug/sessions
```

**Response:**
```json
{
  "active_sessions": 1,
  "sessions": {
    "session-5474c50831803224": {
      "session_id": "session-5474c50831803224",
      "user_id": "user_abc123",
      "file_name": "reading_material.pdf",
      "total_chunks_processed": 1,
      "total_errors": 0,
      "average_score": 0.85,
      "feedback_count": 1
    }
  }
}
```

---

### Clear All Sessions

Clear all sessions from memory (for testing).

**Endpoint:** `DELETE /debug/clear_all_sessions`

**cURL:**
```bash
curl -X DELETE http://localhost:8001/debug/clear_all_sessions
```

**Response:**
```json
{
  "ok": true,
  "cleared_sessions": 1
}
```

---

## Error Responses

**Standard Error Format:**
```json
{
  "detail": "Error message"
}
```

**Common Error Codes:**
- **200** - Success
- **400** - Bad Request (invalid input)
- **401** - Unauthorized (invalid credentials)
- **404** - Not Found (resource doesn't exist)
- **500** - Server Error

**Examples:**

```json
{"detail": "User not found"}
{"detail": "Invalid email or password"}
{"detail": "Email already registered"}
{"detail": "Only PDF, DOCX, and TXT files are supported"}
{"detail": "session session-123 not found"}
```

---

## Complete Workflow

```bash
# 1. Register
curl -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d '{"email": "student@example.com", "password": "pass123", "name": "John", "age": 12, "grade_level": "7th"}'

# 2. Login
curl -X POST http://localhost:8001/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@example.com", "password": "pass123"}'

# 3. Submit Assessment
curl -X POST http://localhost:8001/submit_assignment \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_abc123", "session_id": "test", "assignment_name": "Initial", "assignment_type": "diagnostic", "tasks": [], "flags": {}}'

# 4. Start Session
curl -X POST http://localhost:8001/start_session_with_file \
  -F "study_file=@material.pdf" \
  -F "user_id=user_abc123"

# 5. Process Chunk
curl -X POST http://localhost:8001/process_chunk \
  -H "Content-Type: application/json" \
  -d '{"session_id": "session-abc", "transcript": "Text here", "gaze": []}'

# 6. End Session
curl -X POST http://localhost:8001/end_session \
  -H "Content-Type: application/json" \
  -d '{"session_id": "session-abc"}'

# 7. Check Progress
curl http://localhost:8001/user/user_abc123/progress

# 8. Analyze Weaknesses
curl http://localhost:8001/user/user_abc123/weaknesses
```

---

## Notes

- All timestamps are in ISO 8601 format
- Gaze coordinates are normalized (0.0-1.0)
- Sessions stored in memory + MongoDB
- Phi-4 AI handles all reading analysis
- No authentication required (development mode)

**Last Updated:** January 28, 2026
