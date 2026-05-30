import { isRunningInExpoGo } from "expo";

type RNFSModule = typeof import("react-native-fs");

let cachedRNFS: RNFSModule | null | undefined;

export function getRNFS(): RNFSModule | null {
  if (cachedRNFS !== undefined) {
    return cachedRNFS ?? null;
  }

  if (isRunningInExpoGo()) {
    cachedRNFS = null;
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod: RNFSModule = require("react-native-fs");
    cachedRNFS = mod;
  } catch {
    cachedRNFS = null;
  }

  return cachedRNFS ?? null;
}

export function requireRNFS(): RNFSModule {
  const rnfs = getRNFS();
  if (!rnfs) {
    throw new Error("File system features require a dev client or native build.");
  }

  return rnfs;
}
