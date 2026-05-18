# SpeakUp Kaggle Submission Checklist

Deadline: May 18, 2026 at 11:59 PM UTC (6:59 PM CDT in Chicago).

## Highest-Value Track Positioning

- Main Track: complete local-first product loop, not only a model demo.
- Digital Equity & Inclusivity: free AAC-style communication support for families who cannot access expensive devices.
- Health & Sciences: assistive communication support for disabled communicators, clearly framed as non-diagnostic.
- Ollama Special Track: Gemma 4 runs locally through Ollama.
- Unsloth Special Track: T4 LoRA run is completed; submit the notebook, proof files, and adapter artifact link.

## Must-Have Submission Assets

- Public repo with setup instructions.
- Working local demo URL or runnable instructions. Use `./scripts/judge_run.sh` from the repo root.
- Public YouTube video, 3 minutes or less.
- Kaggle write-up with architecture, model choice, limitations, and impact story.
- Clear mention that demo data is synthetic and no real profile data was used.
- Canva video assets in `docs/VIDEO_CANVA_LINKS.md`.
- Submission thumbnail and app icon in `docs/submission_assets/`.

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

Include these in the Kaggle write-up:

- Base model: `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`.
- Notebook: `finetune/GEMMA4HACKATHON.ipynb`.
- Dataset size and categories.
- Completed metrics: 3 epochs, 24 steps, final logged loss 0.1734.
- Proof files: `finetune/FINE_TUNE_PROOF.md` and `finetune/proof/`.
- Adapter zip: upload `/Users/hetulpatel/Downloads/speakup-gemma4-t4-lora.zip` as a Kaggle Dataset or model artifact, then link it from the write-up.

## Live Demo Recommendation

For a stable final submission, use the GitHub repo plus the one-command local run path as the primary live demo. SpeakUp is intentionally local-first and needs Ollama plus Gemma 4, so a static frontend host such as Vercel is not enough by itself.

If Kaggle requires an online URL field, the safest options are:

1. Use the GitHub repo URL and clearly state: "Run locally with `./scripts/judge_run.sh`."
2. Use a GPU/large-RAM VM and run Ollama, FastAPI, and the Vite frontend together.
3. Do not submit a Vercel-only frontend unless it points to a real backend with Ollama/Gemma 4.

## Final Submit Steps

1. Push the final GitHub repo.
2. Upload the captioned demo video to YouTube as public or unlisted.
3. Upload the LoRA zip to Kaggle as a public Dataset or model artifact if the form allows artifact links.
4. Create the Kaggle write-up with the repo link, video link, architecture diagram, local setup, and limitations.
5. Add the media gallery images from `docs/demo_assets/screenshots/` and `docs/submission_assets/`.
6. Submit before May 18, 2026 at 11:59 PM UTC.
