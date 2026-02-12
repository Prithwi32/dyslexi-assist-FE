Build a web app MVP called “Dyslexi-Assist” for dyslexic learners. The app starts with simple username/password registration and then shows an intake questionnaire as a carousel / slide wizard. After the final slide, compile all answers into a single JSON object (schema below) and show it in a “Review + Export” screen with a copy-to-clipboard button and a “Send to backend” button (POST to a placeholder endpoint).

Design / style requirements (must follow)

Global theme: “old newspaper”.

Background: yellowed paper texture (use CSS background image OR CSS gradient + subtle noise overlay; must look like aged paper).

Typography: bold black headlines + readable serif body (e.g., Georgia / Times New Roman).

Components: cards look like clipped newspaper columns; thick black separators; minimal color besides paper yellow and black.

Accessibility: large default font, strong contrast, generous line spacing, and never show red error text; use neutral wording.

Pages / routes /register

Username + password + confirm password.

Button: “Create account”.

After success: route to /intake.

Store the user session locally for now (localStorage is fine for MVP).

Show a link “Already have an account? Log in” which goes to /login.

/login

Username + password.

Button: “Log in”.

After success: route to /intake.

Add a “Log out” button accessible from /intake and /export.

/intake (carousel / slides)

A multi-step carousel wizard with a progress indicator (Step X of Y) and large “Next”, “Back”, “Skip” buttons.

One task per screen.

Each screen stores answers into a single state object.

Include a persistent helper text: “This is not a test. Skip anything. This helps personalize reading support.”

/export

Show a “Results JSON” panel with formatted JSON.

Buttons: “Copy JSON”, “Download .json”, “Send to backend”.

“Send to backend” posts JSON to: POST /api/intake (create a placeholder mock handler or service function; it can just console.log in MVP).

Intake carousel screens (one per slide) Make each slide a component with: title, short supportive instruction, input, and optional audio play button. Keep everything short and gentle.

Slide 0: Consent + setup

Question: “Do you want to enable microphone to help personalization?” (Yes / Not now)

Language/locale dropdown (default en-IN).

Grade band dropdown: primary, middle_school, high_school, adult.

Store as modalities_enabled.mic, locale, grade_band.

Slide 1: Comfort + preferences

Multiple choice: preferred mode: listening_first, silent_reading, reading_aloud, mixed.

UI prefs: font size (small/medium/large), theme (light/dark/soft), highlight mode (word/line/none).

Store in ui_preferences.

Slide 2: Letter–sound (MCQ)

Show 6 quick items, one at a time (still one slide): prompt “Tap the letter that makes the /b/ sound.” Options: b d p q.

Repeat similar with other confusions (m/n, a/e).

Record per item: choice, correctness, response time.

Slide 3: Phoneme blending (MCQ)

6 items: show 4 options each. Prompt text: “Listen to the sounds and pick the word.”

Provide an audio play button (mocked is fine).

Record correctness + response time.

Slide 4: Phoneme segmentation (MCQ)

6 items: prompt “How many sounds do you hear?” options 2–5.

Record correctness + response time.

Slide 5: Rapid naming (RAN-like)

Show a 4x5 grid of digits or simple icons.

Two modes:

Voice mode: user presses Start, speaks, presses Stop (MVP: just record timing + whether mic enabled; no real ASR needed).

Quiet mode: “Tap each item in order” and measure total time + mis-taps.

Store total_time_ms and mode.

Slide 6: Real word reading

10 words shown one-by-one with Next.

Two modes:

Voice: “Read aloud” (MVP record audio blob optional; else just “attempted”).

No-voice: play audio (mock) and user selects correct spelling among 4.

Store per item attempt.

Slide 7: Nonword reading

8 pseudowords. Same structure as Slide 6.

Store per item attempt.

Slide 8: Short passage reading (fluency)

Show a short passage (80–120 words placeholder text).

If mic enabled: Start/Stop timer for 45 seconds reading aloud.

If mic disabled: allow TTS play (mock) and record listen duration.

Store duration_s, mode.

Slide 9: Comprehension questions

5 questions total (can be 5 mini-steps inside this slide, but still presented like sub-slides within the carousel).

Mix:

2 literal

2 inferential

1 vocab-in-context

Use MCQ with 4 options.

Store per question: choice, correct, response time, question_type.

Slide 10: Self-report

Multi-select: “What feels hardest right now?” with options:

Mixing up letters

Sounding out new words

Reading speed

Remembering what was read

Reading aloud anxiety

Other (text)

Store as self_report.

End slide: Finish

Button: “Generate results JSON” → navigate to /export.

Data model and export JSON (must match exactly) Create TypeScript types/interfaces and build a single JSON payload like:

json { "user_id": "local-uuid", "intake_session_id": "uuid", "created_at": "ISO_TIMESTAMP", "locale": "en-IN", "grade_band": "middle_school", "modalities_enabled": { "mic": true, "eye": false }, "ui_preferences": { "font_size": "large", "theme": "soft", "highlight_mode": "word", "tts_default_rate": 1.0 }, "attempts": [ { "screen_id": "PHONEME_BLEND_01", "task_type": "phoneme_blending_mcq", "item_id": "blend_cat_v1", "presented_at": 1734500000.12, "response": { "choice_id": "cat", "text": null, "audio_blob_id": null }, "timing": { "rt_ms": 4210, "time_on_screen_ms": 9800 }, "scoring": { "is_correct": true, "error_type": null, "partial_credit": 0.0, "expected": "cat" }, "features": { "distractor_type": "vowel_confusion", "difficulty_level": 2 }, "quality": { "asr_confidence": null, "device_lag_ms": 30 } } ], "derived_profile_v1": { "phonological_awareness_score": null, "ran_speed_score": null, "decoding_accuracy_score": null, "decoding_fluency_score": null, "comprehension_literal": null, "comprehension_inferential": null, "vocab_in_context": null, "confidence_calibration": null }, "flags": { "avoid_reading_aloud": false, "high_anxiety_signals": false, "low_asr_quality": false } } Rules:

attempts[] must include one entry per item (not just per slide) for slides that have multiple items.

For MVP, it’s okay if audio_blob_id is null and asr_confidence is null.

derived_profile_v1 can be left as nulls for now; just include the keys so backend can depend on schema stability.

Implementation details (must do) Use a single global state store for the intake (React state or a simple store).

Each slide should write into attempts[] with timestamps and response times.

On /export, generate intake_session_id + user_id UUIDs and set created_at.

Provide JSON validation before allowing “Send to backend” (simple runtime checks).

Add “Resume later”: save in-progress intake state to localStorage every time the user clicks Next.