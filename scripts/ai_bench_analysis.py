#!/usr/bin/env python3
"""
Simple analysis script for AI bench exports.

Usage:
  python scripts/ai_bench_analysis.py path/to/ai-bench-agg-*.json --out-dir results

Produces CSV summaries and simple boxplots per prompt.
"""
import json
import sys
import os
from pathlib import Path
import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt


def load_json(path):
    with open(path, 'r', encoding='utf8') as f:
        return json.load(f)


def df_from_raw(raw_runs):
    rows = []
    for r in raw_runs:
        rows.append({
            'provider': r.get('provider'),
            'prompt': r.get('prompt'),
            'promptLabel': r.get('promptLabel'),
            'iteration': r.get('iteration'),
            'latencyMs': r.get('latencyMs'),
            'success': bool(r.get('success')),
            'integrity_validIds': bool(r.get('integrity_validIds')),
            'accuracy_recall': r.get('accuracy_recall'),
        })
    return pd.DataFrame(rows)


def summarize(df, out_dir: Path):
    grouped = df.groupby(['provider', 'prompt'])
    summary_rows = []
    for (provider, prompt), g in grouped:
        lat_ok = g[g['success'] & g['latencyMs'].notnull()]['latencyMs'].astype(float)
        mean_lat = float(lat_ok.mean()) if not lat_ok.empty else None
        median_lat = float(lat_ok.median()) if not lat_ok.empty else None
        std_lat = float(lat_ok.std()) if not lat_ok.empty else None

        success_rate = float(g['success'].mean())
        integrity_rate = float(g['integrity_validIds'].mean())
        recall_mean = float(g['accuracy_recall'].dropna().mean()) if g['accuracy_recall'].dropna().size > 0 else None

        summary_rows.append({
            'provider': provider,
            'prompt': prompt,
            'mean_latency_ms': mean_lat,
            'median_latency_ms': median_lat,
            'std_latency_ms': std_lat,
            'success_rate': success_rate,
            'integrity_rate': integrity_rate,
            'recall_mean': recall_mean,
            'n': len(g),
        })

    summary_df = pd.DataFrame(summary_rows)
    summary_df.to_csv(out_dir / 'ai_bench_summary.csv', index=False)
    print(f'Wrote summary to {out_dir / "ai_bench_summary.csv"}')
    return summary_df


def pairwise_tests(df, out_dir: Path):
    prompts = df['prompt'].unique()
    providers = df['provider'].unique()
    tests = []
    for prompt in prompts:
        sub = df[df['prompt'] == prompt]
        for i in range(len(providers)):
            for j in range(i + 1, len(providers)):
                a = sub[sub['provider'] == providers[i]]
                b = sub[sub['provider'] == providers[j]]
                # aligned latencies for successful runs
                a_lat = a[a['success'] & a['latencyMs'].notnull()]['latencyMs'].astype(float)
                b_lat = b[b['success'] & b['latencyMs'].notnull()]['latencyMs'].astype(float)
                # Use Mann-Whitney U if sample sizes differ
                if len(a_lat) > 0 and len(b_lat) > 0:
                    try:
                        stat, p = stats.mannwhitneyu(a_lat, b_lat, alternative='two-sided')
                    except Exception:
                        stat, p = (None, None)
                else:
                    stat, p = (None, None)

                tests.append({
                    'prompt': prompt,
                    'A': providers[i],
                    'B': providers[j],
                    'nA': len(a_lat),
                    'nB': len(b_lat),
                    'stat': stat,
                    'p_value': p,
                })

    tests_df = pd.DataFrame(tests)
    tests_df.to_csv(out_dir / 'ai_bench_pairwise_tests.csv', index=False)
    print(f'Wrote pairwise tests to {out_dir / "ai_bench_pairwise_tests.csv"}')
    return tests_df


def boxplots(df, out_dir: Path):
    prompts = df['prompt'].unique()
    for prompt in prompts:
        sub = df[(df['prompt'] == prompt) & (df['success']) & (df['latencyMs'].notnull())]
        if sub.empty:
            continue
        fig, ax = plt.subplots(figsize=(8, 4))
        sub.boxplot(column='latencyMs', by='provider', ax=ax)
        ax.set_title(f'Latency by provider — prompt {prompt}')
        ax.set_ylabel('Latency (ms)')
        plt.suptitle('')
        out = out_dir / f'latency_boxplot_{prompt}.png'
        plt.savefig(out)
        plt.close(fig)
        print(f'Wrote plot {out}')


def main():
    if len(sys.argv) < 2:
        print('Usage: ai_bench_analysis.py path/to/export.json [out_dir]')
        sys.exit(1)

    path = Path(sys.argv[1])
    out_dir = Path(sys.argv[2]) if len(sys.argv) >= 3 else Path('results')
    out_dir.mkdir(parents=True, exist_ok=True)

    data = load_json(path)
    raw = data.get('rawRuns') or data.get('raw_runs') or []
    df = df_from_raw(raw)
    summarize(df, out_dir)
    pairwise_tests(df, out_dir)
    boxplots(df, out_dir)


if __name__ == '__main__':
    main()
