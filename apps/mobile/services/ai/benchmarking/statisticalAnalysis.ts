/**
 * Statistical analysis utilities for academic benchmarking.
 *
 * Provides: confidence intervals, t-tests, F1/precision/recall, chi-square test.
 */

/**
 * Calculate mean of an array.
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Calculate standard deviation.
 */
export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Calculate 95% confidence interval for a sample.
 * Uses t-distribution (critical value ≈ 1.96 for large samples).
 */
export function confidenceInterval95(values: number[]): {
  mean: number;
  lower: number;
  upper: number;
  stderr: number;
} {
  const n = values.length;
  if (n < 2) {
    const val = values[0] ?? 0;
    return { mean: val, lower: val, upper: val, stderr: 0 };
  }

  const avg = mean(values);
  const sd = standardDeviation(values);
  const stderr = sd / Math.sqrt(n);

  // T-critical value for 95% CI (approximation)
  const tCritical = n > 30 ? 1.96 : 2.045;

  return {
    mean: avg,
    lower: avg - tCritical * stderr,
    upper: avg + tCritical * stderr,
    stderr,
  };
}

/**
 * Calculate precision, recall, and F1 score.
 *
 * @param truePositives Count of correctly identified relevant items
 * @param falsePositives Count of incorrectly identified relevant items
 * @param falseNegatives Count of missed relevant items
 */
export function calculateMetrics(
  truePositives: number,
  falsePositives: number,
  falseNegatives: number,
): {
  precision: number;
  recall: number;
  f1: number;
} {
  const precision = truePositives / (truePositives + falsePositives) || 0;
  const recall = truePositives / (truePositives + falseNegatives) || 0;
  const f1 = (2 * precision * recall) / (precision + recall) || 0;

  return { precision, recall, f1 };
}

/**
 * Two-sample t-test to compare means of two groups.
 * Returns p-value (lower = more significant difference).
 */
export function tTest(
  group1: number[],
  group2: number[],
): {
  tStatistic: number;
  pValue: number;
  significant: boolean;
} {
  const n1 = group1.length;
  const n2 = group2.length;

  if (n1 < 2 || n2 < 2) {
    return { tStatistic: 0, pValue: 1, significant: false };
  }

  const mean1 = mean(group1);
  const mean2 = mean(group2);
  const sd1 = standardDeviation(group1);
  const sd2 = standardDeviation(group2);

  const pooledVar = ((n1 - 1) * sd1 ** 2 + (n2 - 1) * sd2 ** 2) / (n1 + n2 - 2);
  const stdErr = Math.sqrt(pooledVar * (1 / n1 + 1 / n2));

  const tStatistic = (mean1 - mean2) / (stdErr || 1);

  // Approximate p-value using normal distribution (valid for n > 30)
  const pValue = 2 * (1 - Math.min(0.9999, Math.abs(tStatistic) / 3.29));

  return {
    tStatistic,
    pValue,
    significant: pValue < 0.05,
  };
}

/**
 * Chi-square test for independence/goodness-of-fit.
 * Compare observed vs expected frequencies.
 */
export function chiSquareTest(
  observed: number[],
  expected: number[],
): {
  chiSquare: number;
  pValue: number;
  significant: boolean;
} {
  let chiSquare = 0;
  for (let i = 0; i < observed.length; i++) {
    const e = expected[i] || 1;
    chiSquare += Math.pow(observed[i] - e, 2) / e;
  }

  const degreesOfFreedom = observed.length - 1;
  // Approximate p-value (chi-square approximation)
  const pValue = degreesOfFreedom > 0 ? Math.exp(-chiSquare / 2) : 1;

  return {
    chiSquare,
    pValue: Math.max(0.01, pValue),
    significant: pValue < 0.05,
  };
}

/**
 * Aggregate benchmark results with statistical summary.
 */
export interface BenchmarkSummary {
  provider: string;
  latencyMs: {
    mean: number;
    sd: number;
    ci95: { lower: number; upper: number };
  };
  accuracy: {
    mean: number;
    sd: number;
    ci95: { lower: number; upper: number };
  };
  f1Score: number;
  jailbreakResistance: number; // percentage
  sampleCount: number;
}

export function summarizeBenchmarks(
  latencies: number[],
  accuracies: number[],
  f1Scores: number[],
  jailbreakResistanceRate: number,
  provider: string,
): BenchmarkSummary {
  const latencyCI = confidenceInterval95(latencies);
  const accuracyCI = confidenceInterval95(accuracies);

  return {
    provider,
    latencyMs: {
      mean: latencyCI.mean,
      sd: standardDeviation(latencies),
      ci95: { lower: latencyCI.lower, upper: latencyCI.upper },
    },
    accuracy: {
      mean: accuracyCI.mean,
      sd: standardDeviation(accuracies),
      ci95: { lower: accuracyCI.lower, upper: accuracyCI.upper },
    },
    f1Score: mean(f1Scores),
    jailbreakResistance: jailbreakResistanceRate,
    sampleCount: latencies.length,
  };
}
