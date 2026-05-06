import { isRunningInExpoGo } from "expo";

type RNFSModule = typeof import("react-native-fs");

let cachedRNFS: RNFSModule | null | undefined;

export function getRNFS(): RNFSModule | null {
  if (cachedRNFS !== undefined) {
    return cachedRNFS ?? null;
  }

  // Never attempt to load RNFS in Expo Go (no native module available)
  if (isRunningInExpoGo()) {
    cachedRNFS = null;
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require("react-native-fs");
    // Verify the module has the expected API to catch partial/broken loads
    if (mod && typeof mod === "object") {
      cachedRNFS = mod;
    } else {
      cachedRNFS = null;
    }
  } catch (error) {
    // Silently fail; RNFS is not available in this runtime
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