# SpeakUp Kaggle Submission Checklist

Deadline: May 18, 2026 at 11:59 PM UTC (6:59 PM CDT in Chicago).

## Highest-Value Track Positioning

- Main Track: complete local-first product loop, not only a model demo.
- Digital Equity & Inclusivity: free AAC-style communication support for families who cannot access expensive devices.
- Health & Sciences: assistive communication support for disabled communicators, clearly framed as non-diagnostic.
- Ollama Special Track: Gemma 4 runs locally through Ollama.
- Unsloth Special Track: submit only if the LoRA run is completed and the resulting `speakup-gemma4` model is loaded or published.

## Must-Have Submission Assets

- Public repo with setup instructions.
- Working local demo URL or runnable instructions.
- Public YouTube video, 3 minutes or less.
- Kaggle write-up with architecture, model choice, limitations, and impact story.
- Clear mention that demo data is synthetic and no real profile data was used.

## Demo Flow

1. Open the app and click `Open Demo`.
2. Show the synthetic Emma profile and existing learned patterns.
3. Start a new communication with visual card + gesture + sound + camera frame.
4. Hit `Interpret with Gemma 4`.
5. Show the spoken phrase, confidence, explanation, alternatives, input channels, and model tag.
6. Tap `That's right` or correct it.
7. Open the dashboard, Gemma chat, and care-team view to show learned patterns, signal mix, urgent counts, progress questions, and export.

## Compliance Notes

- Do not call SpeakUp a medical device, diagnostic tool, or replacement for speech-language therapy.
- Do not claim clinical accuracy unless backed by a real validation study.
- Use the phrase "assistive communication companion" consistently.
- Keep all demo profiles synthetic unless explicit consent and releases exist.
- Show privacy plainly: local SQLite, local Ollama, browser speech synthesis, and no cloud inference once the Gemma 4 model is downloaded.

## Fine-Tuning Proof

Include these only after running the notebook/script:

- Base model name.
- Unsloth version or notebook link.
- Dataset size and categories.
- Training loss screenshot.
- Exported GGUF model name.
- Before/after JSON reliability and held-out scenario accuracy.

If fine-tuning is not completed before submission, say the repo includes a reproducible Unsloth fine-tuning pipeline and submit for the Ollama/Main/Impact tracks instead of overstating the Unsloth result.
