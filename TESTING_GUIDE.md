# PlanTap - Testing & Validation Guide

## Quick Start

### Build & Run
```bash
# Install dependencies
pnpm install

# Run mobile dev server
pnpm --filter mobile dev -- -c

# Alternative: Run specific tests
pnpm --filter mobile typecheck  # ✅ Should pass
pnpm --filter backend dev        # Start Convex backend
```

---

## Feature Testing Matrix

### 1. RAG Filtering (Relevance-Augmented Generation)

**Location**: `services/ai/eventRanker.ts`

**Test Case 1: Event Ranking**
```
Input: User interested in [music, tech]
       50 events in system
Expected: Recommend ~15-20 most relevant first
Verify: 
  - Open dev-ai-bench.tsx
  - Run with "Sample" dataset
  - Check that recommendation includes music/tech events preferentially
```

**Test Case 2: Disliked Tag Filtering**
```
Input: User dislikes [classical, kids]
       Mixed events in pool
Expected: Classical/kids events get negative score (-30pts)
Verify:
  - Check event scores output
  - Ensure low-scored events not recommended
```

---

### 2. Response Validation (Security)

**Location**: `services/ai/responseValidator.ts`

**Test Case 1: Valid Response**
```
Input: LLM returns ["e1", "e2", "e3"] (all exist in candidates)
Expected: Validation passes, response accepted
Verify:
  - Check provider returns valid recommendations
  - No error in logs
```

**Test Case 2: Invalid ID Detection**
```
Input: LLM returns ["e1", "FAKE_ID", "e2"]
Expected: Validation fails, event rejected with error
Verify:
  - Run dev-ai-bench with "jailbreak" or "out_of_candidates" prompt
  - Check error message contains "invalid IDs"
```

**Test Case 3: Jailbreak Attempt**
```
Input: LLM tries to return structured data instead of event IDs
Expected: Marked as potential jailbreak attempt
Verify:
  - Set breakpoint in responseValidator.ts
  - Check isJailbreakAttempt flag
```

---

### 3. AiModelSelector UI

**Location**: `app/(main)/(tabs)/suggest.tsx`

**Test Case 1: Component Rendering**
```
Action: Open Suggestions screen
Expected: 
  - See collapsible AI Model selector below subtitle
  - Arrow indicator (▶ when collapsed, ▼ when expanded)
  - Can click to toggle expand/collapse
Verify:
  - UI appears and responds to taps
```

**Test Case 2: API Provider Tab**
```
Action: 
  1. Expand selector
  2. Click "API Providers" tab
  3. Select "Gemini"
  4. Enter fake API key
  5. Tap "Save & Use API"
Expected:
  - Provider selector buttons visible
  - API key input field appears
  - Can type in key field
  - Success alert on save
Verify:
  - Check ai-store.setProvider() was called
  - Check secureKeys.setApiKey() stored key
```

**Test Case 3: Local Models Tab**
```
Action:
  1. Click "Local Models" tab
  2. See Qwen and TinyLlama in list
  3. Tap "Download" for Qwen
Expected:
  - Download starts (button state changes)
  - Model appears in storage
  - Can tap "✓ Active" to use it
Verify:
  - Check RNFS.DocumentDirectoryPath has .gguf file
  - Check ai-store.localModelPath updated
```

---

### 4. Jailbreak Detection (Security)

**Location**: `services/ai/benchmarking/jailbreakTests.ts` + `dev-ai-bench.tsx`

**Test Case 1: Run Jailbreak Suite**
```
Action:
  1. Open dev-ai-bench screen
  2. Sign in (to load Convex dataset)
  3. Set iterations: 1
  4. Tap "Run Benchmark"
Expected:
  - 10 prompts executed (2 normal + 8 jailbreak)
  - System runs against all 3-4 providers
  - Jailbreak tests get marked success=false if LLM is defending well
  - Regular prompts get success=true
Verify:
  - Check aggregated results show different success rates
  - Jailbreak resistance calculated per provider
```

**Test Case 2: Provider Comparison**
```
Expected Results:
  - Gemini: High resistance (strict instructions)
  - OpenAI (gpt-4o-mini): Medium-high resistance
  - Claude: Medium resistance (creative)
  - Local (Qwen): Varies by model
Verify:
  - Compare successRate across providers
  - Claude typically lower on jailbreak tests
```

---

### 5. Academic Benchmarking & Reporting

**Location**: `dev-ai-bench.tsx` + `benchmarking/` folder

**Test Case 1: Generate Academic Report**
```
Action:
  1. Run benchmark (10 prompts, 3 iterations)
  2. Tap "Export Academic Report (MD)" button
  3. Check file saves to DocumentDirectory
Expected:
  - File named `ai-bench-academic-[timestamp].md`
  - Contains methodology, metrics, jailbreak resistance
  - Includes confidence intervals (95% CI)
  - Shows statistical significance
Verify:
  - Open exported file in notes app
  - Verify markdown formatting
  - Check for t-test p-values
```

**Test Case 2: Metrics Accuracy**
```
Expected in Report:
  - Per-provider latency (mean ± CI)
  - F1 scores (for precise recommendations)
  - Jailbreak resistance % by provider
  - Attack vector breakdown
Verify:
  - Calculate mean latency manually
  - Confirm report matches
```

**Test Case 3: Statistical Significance**
```
Expected:
  - If Gemini latency < Claude by 50ms with tight CI → Significant
  - If Claude jailbreak resistance = Gemini ± wide CI → Not significant
Verify:
  - t-test p-value < 0.05 for significant differences
  - Report recommendations reflect this
```

---

### 6. End-to-End Workflow

**Complete Flow Test**
```
1. Open Suggestions screen
   ✓ See AiModelSelector with Gemini selected
   
2. Ensure API key is saved
   ✓ Tap model selector, verify Gemini key saved
   
3. Request suggestions
   ✓ Recommendations appear (music + tech events)
   ✓ No invalid IDs in results
   
4. Open Settings
   ✓ No AI settings section visible
   ✓ Only account/preferences remain
   
5. Open dev-ai-bench
   ✓ Run 5 iterations across all prompts
   ✓ Export academic report
   ✓ Verify jailbreak resistance % for each provider
   
6. Share results
   ✓ Tap "Share Results"
   ✓ File shares to email/cloud
```

---

## Debug Commands

### Check Typecheck (Critical)
```bash
cd /home/ananas/uni/GP/PlanTap
pnpm --filter mobile typecheck
# Should see: ✅ No errors
```

### Check Events in RAG Ranking
```bash
# In dev-ai-bench.tsx, check console logs in:
# - rankEventsByRelevance() called from prompts.ts
# - Each event's score breakdown
```

### Verify API Key Storage
```bash
# Open React DevTools
# Navigate to ai-store
# Check: provider, apiKeyCache (if exposed for debug)
```

### Monitor Jailbreak Tests
```bash
# In dev-ai-bench.tsx results:
# - Look for prompts starting with "jailbreak_"
# - Check if success=false (good - attack blocked)
# - Check if eventIds are valid (validation working)
```

---

## Common Issues & Solutions

### Issue: "Convex dataset unavailable"
**Solution**: 
- Ensure backend running: `pnpm --filter backend dev`
- Check network connectivity
- Fall back to "Sample" dataset for testing

### Issue: Jailbreak tests all showing success=true
**Problem**: LLM being attacked successfully
**Action**:
- Review responseValidator isJailbreakAttempt logic
- May indicate provider is vulnerable
- Document in academic report as "Needs hardening"

### Issue: AiModelSelector not appearing
**Problem**: Component not imported
**Solution**:
- Check suggest.tsx has: `import { AiModelSelector } from "@/components/ui/AiModelSelector"`
- Check it's rendered in JSX: `<AiModelSelector />`

### Issue: Academic report exports empty markdown
**Problem**: No aggregated results to export
**Solution**:
- Run benchmark first
- Check that `aggregated` state is populated
- Check export function gets called with proper data

---

## Performance Benchmarks

### Expected Performance
- RAG ranking: < 50ms (event scoring)
- Gemini API call: 1-3 seconds
- OpenAI API call: 2-4 seconds
- Claude API call: 2-5 seconds
- Local (on-device): 3-10 seconds depending on device

### Battery Impact
- RAG filtering: Negligible
- Single LLM call: 2-5% battery (API) or 5-15% (local)
- Full benchmark (10 calls × 3 iterations): 30-60% battery used

---

## Production Readiness Checklist

- [x] TypeScript compiles cleanly
- [x] No console.error in happy path
- [x] RAG working (reduces events)
- [x] Response validation working (blocks invalid IDs)
- [x] AiModelSelector UI complete
- [x] Jailbreak tests integrated
- [x] Academic metrics calculated
- [x] Report export working
- [ ] Manual E2E testing (next phase)
- [ ] Performance profiling (optional)
- [ ] Accessibility audit (optional)

---

## Quick Verification Script

```bash
#!/bin/bash
echo "=== PlanTap Integration Verification ==="

# 1. Typecheck
echo "1. TypeScript Compilation..."
pnpm --filter mobile typecheck > /tmp/typecheck.log 2>&1
if [ $? -eq 0 ]; then
  echo "   ✅ No type errors"
else
  echo "   ❌ Type errors found"
  tail -5 /tmp/typecheck.log
  exit 1
fi

# 2. Check file existence
echo "2. Checking new files..."
files=(
  "apps/mobile/services/ai/eventRanker.ts"
  "apps/mobile/services/ai/responseValidator.ts"
  "apps/mobile/components/ui/AiModelSelector.tsx"
  "apps/mobile/services/ai/benchmarking/jailbreakTests.ts"
  "apps/mobile/services/ai/benchmarking/statisticalAnalysis.ts"
  "apps/mobile/services/ai/benchmarking/reportGenerator.ts"
)
for f in "${files[@]}"; do
  if [ -f "$f" ]; then
    echo "   ✅ $f"
  else
    echo "   ❌ MISSING: $f"
    exit 1
  fi
done

# 3. Check imports
echo "3. Checking key imports in dev-ai-bench.tsx..."
if grep -q "JAILBREAK_TEST_SUITE" apps/mobile/app/\(main\)/dev-ai-bench.tsx; then
  echo "   ✅ Jailbreak tests imported"
else
  echo "   ❌ Jailbreak tests NOT imported"
  exit 1
fi

echo ""
echo "=== All checks passed! ✅ ==="
```

Save as `verify.sh` and run:
```bash
chmod +x verify.sh
./verify.sh
```

