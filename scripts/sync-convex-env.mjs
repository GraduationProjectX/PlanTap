import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function readFileIfExists(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function stripInlineComment(value) {
  const idx = value.indexOf(" #");
  if (idx === -1) return value.trim();
  return value.slice(0, idx).trim();
}

function parseEnv(content) {
  const map = new Map();
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) continue;

    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;

    const key = trimmed.slice(0, eqIdx).trim();
    const rawValue = trimmed.slice(eqIdx + 1).trim();
    map.set(key, stripInlineComment(rawValue));
  }
  return map;
}

function setEnvKeysKeepingFormatting(original, updates) {
  const lines = original.split(/\r?\n/);
  const seen = new Set();

  const nextLines = lines.map((line) => {
    const match = /^\s*([A-Za-z0-9_]+)\s*=/.exec(line);
    if (!match) return line;

    const key = match[1];
    const value = updates[key];
    if (!value) return line;

    seen.add(key);
    return `${key}=${value}`;
  });

  for (const [key, value] of Object.entries(updates)) {
    if (seen.has(key)) continue;
    if (nextLines.length && nextLines[nextLines.length - 1].trim() !== "") {
      nextLines.push("");
    }
    nextLines.push(`${key}=${value}`);
  }

  const next = nextLines.join("\n");
  // Preserve trailing newline convention.
  return next.endsWith("\n") ? next : `${next}\n`;
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");

const backendEnvPath = path.join(repoRoot, "backend", ".env.local");
const mobileEnvPath = path.join(repoRoot, "apps", "mobile", ".env.local");

const backendEnv = readFileIfExists(backendEnvPath);
if (!backendEnv) {
  process.exit(0);
}

const backend = parseEnv(backendEnv);
const deployment = backend.get("CONVEX_DEPLOYMENT");
const url = backend.get("CONVEX_URL");
const siteUrl = backend.get("CONVEX_SITE_URL");

if (!deployment || !url || !siteUrl) {
  process.exit(0);
}

const desired = {
  CONVEX_DEPLOYMENT: deployment,
  EXPO_PUBLIC_CONVEX_URL: url,
  EXPO_PUBLIC_CONVEX_SITE_URL: siteUrl,
};

const mobileOriginal = readFileIfExists(mobileEnvPath) ?? "";
const mobileNext = setEnvKeysKeepingFormatting(mobileOriginal, desired);

if (mobileNext !== (mobileOriginal.endsWith("\n") ? mobileOriginal : `${mobileOriginal}\n`)) {
  fs.mkdirSync(path.dirname(mobileEnvPath), { recursive: true });
  fs.writeFileSync(mobileEnvPath, mobileNext, "utf8");
  // Only log when we actually changed something to avoid noisy dev output.
  // eslint-disable-next-line no-console
  console.log("Synced apps/mobile/.env.local Convex settings from backend/.env.local");
}
