# AI QA Checklist

This checklist helps QA the AI features (local models, cloud providers, downloads, and keys).

## Manual tests

- [ ] API Key validation
  - Enter invalid API key for each provider in Settings → API Keys → Save.
  - Run "Run Test Prompt" and verify an error is shown.
  - Replace with a valid key and verify success.

- [ ] Local model download / cancel / resume
  - Settings → Local Model → choose a small model (TinyLlama) → Download Selected Model.
  - While downloading, press Cancel. Verify no partial file remains in `DocumentDirectoryPath/models`.
  - Re-download and let it finish. Verify the model shows as Downloaded and "Use Selected Model" activates it.

- [ ] Model integrity
  - After download, verify that the app reports no integrity issues.
  - Corrupt a downloaded file (if possible) and re-run download: app should re-download or report mismatch.

- [ ] Local LLM inference
  - Select provider Local and run Test Recommendations.
  - Verify that results are returned or meaningful error (OOM, missing model).

- [ ] Cloud providers (Gemini/OpenAI/Claude)
  - For each provider: configure API key, select provider, run Test Recommendations, and verify that provider responses are parsed into event IDs.
  - Test rate-limit behavior by making repeated requests; verify retries/backoff (Gemini) and consistent error messages.

- [ ] Advanced/Dev checks
  - Use the debug screen (if available) to force-init local model, show raw provider output, and validate keys.

## Automated unit test ideas

- `safeParseRecommendation`:
  - Valid JSON string -> returns expected object.
  - Malformed JSON -> throws.
  - Object missing `eventIds` -> throws.

- `fetchWithTimeout`:
  - Simulate slow endpoint -> rejects on timeout.
  - Fast endpoint -> resolves.

- `modelDownloader` integration (CI)
  - Serve a small file with known size and ETag; verify HEAD reads size, download writes `.download` then renames, and metadata persisted.

## Notes

- Telemetry must be opt-in.
- For reproducible QA, use a dev build with `EXPO_PUBLIC_*` env keys pre-populated.
