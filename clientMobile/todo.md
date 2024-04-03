# Supabase

- Add back in jwt authorization checks "--no-verify-jwt"

1. Create recording
2. Send recording to edge function

3. Save recording to Supabase storage
4. Retrieve recording from storage

5. Send to OpenAI for transcription
6. Retrieve transcription

7. Send transcription back to OpenAI with prompt

- "System" header contains therapist profile for chat gpt

8. Retrieve response

9. Send response to 11Labs
10. Retrieve audio file from 11Labs

11. Send audio file response to react native
12. Play response
