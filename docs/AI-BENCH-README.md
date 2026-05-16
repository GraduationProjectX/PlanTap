# AI Benchmark Screen

This document describes the in-app AI benchmarking screen added for evaluating providers (Gemini, OpenAI, Claude) and the local on-device provider.

Location
- React Native screen: `apps/mobile/app/(main)/dev-ai-bench.tsx` (route: `/dev-ai-bench`).

Purpose
- Run a small, repeatable set of prompts (normal, precision, jailbreak/out-of-candidate) across all available providers.
- Measure latency, basic accuracy (recall vs a small ground truth), and integrity (whether returned event IDs are within candidate events).
- Export results as JSON for offline analysis and academic reporting.

Prerequisites
- Run a dev build of the mobile app (Expo / pnpm). Ensure cloud provider API keys are configured via Settings → API Keys or environment fallbacks.
- If testing local provider, download and activate a local GGUF model in Settings → Local Model.

How to use
1. Start the mobile app in a development build:
```bash
pnpm --filter mobile dev -- -c
```
2. Open the app and navigate to the `dev-ai-bench` route (you can open the path directly in the Expo router or add a temporary link from Settings).
3. Press `Run Benchmark` and wait for tests to complete. Results will appear on screen.
4. Press `Export JSON` to save results to the device Documents folder. The path will be shown in an alert.

Options
- **Iterations:** run each prompt multiple times (1/3/5/10) to measure variance; the bench computes mean, median and std for latency and aggregated rates for success and integrity.
- **Record raw responses:** (in the screen) you can optionally keep raw provider outputs in the per-run records for deeper analysis; the exported JSON contains both aggregated summaries and raw runs.

JSON schema (output)
The exported JSON contains an object with `meta` and `results` fields. Each result entry includes:
- `provider`: provider name (Gemini / OpenAI / Claude / Local)
- `prompt`: prompt id
- `promptLabel`: human label for the prompt
- `latencyMs`: measured round-trip time in ms
- `success`: boolean
- `eventIds`: returned event ID array (if any)
- `integrity_validIds`: whether all returned IDs were present among the candidate events
- `invalidIds`: list of invalid IDs (if any)
- `accuracy_recall`: optional recall vs supplied ground truth (0–1)
- `error`: error message (if failed)

Notes & limitations
- The benchmark runs against your live Convex dataset; for academic experiments you may want to curate your own dataset and ground-truth labels.
- Local-provider tests run on-device and measure the on-device inference latency, which will vary greatly between devices.
- Cloud provider latency includes network time from device to provider and back; for reproducible experiments use a stable network or run from a consistent host.
- The jailbreak prompts included are simple and intended only to illustrate pipeline detection; for formal safety evaluation use a curated set of adversarial prompts and safety labels.

Next steps
- Curate representative datasets and ground-truth labels for your experiments.
- Add additional metrics (e.g., token usage, response length, confidence scores) if supported by providers.
- Add automated export/upload to a backend or S3 for centralized collection.
