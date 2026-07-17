## 2024-05-14 - Fix LLM Prompt Injection Risk
**Vulnerability:** Found multiple instances where untrusted user input (e.g., `moodPrompt`, `notes`, `comment`) was directly concatenated into the main prompt instruction block for Groq/OpenAI completions.
**Learning:** This concatenation allows for prompt injection, where malicious input can override the system instructions and manipulate the AI output.
**Prevention:** Always separate system instructions from user data by using distinct `system` and `user` roles in the messages array.
