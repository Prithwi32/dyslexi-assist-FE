# Speech-to-Text Transcript Capture Fix

## Problem Identified

The STT (Speech-to-Text) functionality was properly implemented, but transcripts were appearing as `null` in the final results JSON for verbal tasks due to two main issues:

1. **Skip Button Issue**: When users skipped verbal tasks in voice mode, the skip handlers were setting `transcript: null` without attempting to capture whatever speech had been recorded up to that point.

2. **Error Handling**: When `stopAndTranscribe()` encountered errors, the transcript was lost instead of falling back to the `liveTranscript` value.

## Root Cause

In components like `SlideRealWords` and `SlideNonwords`, the skip handler looked like:

```typescript
const handleSkip = async () => {
  if (isRecordingItem) {
    await stopAndTranscribe();  // Result was discarded
  }
  
  const taskResult: TaskResult = {
    // ...
    transcript: null,  // ❌ Always null!
  };
}
```

## Solution Implemented

### 1. Enhanced Skip Handlers

Updated all verbal task skip handlers to capture available transcripts:

**Files Modified:**
- `SlideRealWords.tsx`
- `SlideNonwords.tsx`

**Changes:**
```typescript
const handleSkip = async () => {
  let transcript: string | null = null;
  
  // If recording in voice mode, try to capture whatever transcript exists
  if (isRecordingItem && useVoiceMode) {
    try {
      const result = await stopAndTranscribe();
      const text = (result?.text ?? '').trim();
      transcript = text ? text : (liveTranscript.trim() ? liveTranscript.trim() : null);
    } catch (e) {
      console.error('Error capturing transcript on skip:', e);
      // Use live transcript as fallback
      transcript = liveTranscript.trim() || null;
    }
  }
  
  const taskResult: TaskResult = {
    // ...
    transcript,  // ✅ Captures available speech
  };
}
```

### 2. Improved Error Handling

Added try-catch blocks and fallback logic to all `stopAndTranscribe()` calls:

**Files Modified:**
- `SlideRealWords.tsx`
- `SlideNonwords.tsx`
- `SlidePassage.tsx`
- `SlideRAN.tsx`

**Changes:**
```typescript
try {
  const result = await stopAndTranscribe();
  const text = (result?.text ?? '').trim();
  transcript = text ? text : (liveTranscript.trim() ? liveTranscript.trim() : null);
} catch (error) {
  console.error('Error during stopAndTranscribe:', error);
  // Fallback to liveTranscript
  transcript = liveTranscript.trim() || null;
}
```

### 3. Added Skip Button UI

Added skip functionality to `SlideNonwords` to match `SlideRealWords`:

```tsx
<div>
  <button
    type="button"
    onClick={handleSkip}
    disabled={isTranscribing}
    className="text-muted-foreground hover:text-foreground underline text-sm"
  >
    Skip this word
  </button>
</div>
```

## Expected Behavior After Fix

### For Verbal Tasks (when mic is enabled):

1. **Normal Completion**: Transcript captures the full speech
2. **Skip with Speech**: Transcript captures whatever was said before skipping
3. **Skip without Speech**: Transcript is `null` (correct behavior - no speech to capture)
4. **Error Recovery**: Falls back to `liveTranscript` to preserve partial results

### For Non-Verbal Tasks (when mic is disabled):

- Transcript remains `null` (expected and correct)

## Verification

All verbal task components now follow this pattern:

1. ✅ **SlidePassage** - Captures full passage reading transcript
2. ✅ **SlideRealWords** - Captures word reading attempts with skip support
3. ✅ **SlideNonwords** - Captures nonword reading attempts with skip support
4. ✅ **SlideRAN** - Captures rapid naming transcript

## Impact

- **Before**: Skipped verbal tasks always had `transcript: null`
- **After**: Skipped verbal tasks preserve any captured speech
- **Before**: STT errors resulted in lost transcripts
- **After**: STT errors fall back to live transcript before failing
- **Result**: More complete and accurate results JSON for analysis

## Testing Recommendations

1. Complete verbal tasks normally ✅ Should have transcripts
2. Skip verbal tasks after speaking ✅ Should preserve partial transcripts
3. Skip verbal tasks without speaking ✅ Transcript will be null (expected)
4. Test with poor network/mic ✅ Should use fallback transcript
5. Complete non-verbal tasks ✅ Transcript should be null (expected)
