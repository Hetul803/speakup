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
- Canva video assets in `docs/VIDEO_CANVA_LINKS.md`.

## Demo Flow

1. Open the app on the About page to explain who SpeakUp helps.
2. Open Profiles to show the named communicator list.
3. Open Parent Center, then show Emma Demo and Noah Demo with separate care plans, alerts, and dedicated device links.
4. Open Emma's dedicated device mode to show one iPad focused on one communicator.
5. Tap one common card and show SpeakUp asking Gemma 4, speaking the phrase, and offering caregiver confirmation.
6. Show the always-visible Gemma chat panel in dedicated device mode.
7. Open optional audio/camera tools only after the simple one-tap flow is clear.
8. Show progress and care-team export.
9. End with local Gemma 4/Ollama proof and the T4 fine-tuning notebook.

## Compliance Notes

- Do not call SpeakUp a medical device, diagnostic tool, or replacement for speech-language therapy.
- Do not claim clinical accuracy unless backed by a real validation study.
- Use the phrase "assistive communication companion" consistently.
- Keep all demo profiles synthetic unless explicit consent and releases exist.
- Show privacy plainly: local SQLite, local Ollama, browser speech synthesis, and no cloud inference once the Gemma 4 model is downloaded.
- Do not share Colab, Kaggle, Google, or GitHub passwords/tokens with collaborators. Use account-owned notebooks, Kaggle secrets, or publishable artifacts.

## Fine-Tuning Proof

Include these only after running the notebook/script:

- Base model name.
- Unsloth version or notebook link.
- Dataset size and categories.
- Training loss screenshot.
- Exported GGUF model name.
- Before/after JSON reliability and held-out scenario accuracy.
- If you only have Colab T4, use `finetune/SpeakUp_Gemma4_T4_Finetune.ipynb` and submit the LoRA adapter zip/logs as proof instead of trying to upload a large GGUF.

If fine-tuning is not completed before submission, say the repo includes a reproducible Unsloth fine-tuning pipeline and submit for the Ollama/Main/Impact tracks instead of overstating the Unsloth result.
