import { I18nManager } from "react-native";
import * as Localization from "expo-localization";
import { useTranslation } from "react-i18next";
import i18n from "./i18n";

/**
 * RTL Configuration for PlanTap
 * Handles RTL layout switching based on language
 */

// Get the current language
export const getCurrentLanguage = (): "ar" | "en" => {
  return i18n.language === "en" ? "en" : "ar";
};

// Check if current language is RTL
export const isRTL = (): boolean => {
  return getCurrentLanguage() === "ar";
};

// Get text direction
export const getDirection = (): "rtl" | "ltr" => {
  return isRTL() ? "rtl" : "ltr";
};

/**
 * Configure RTL based on current language
 * Call this when language changes
 */
export const configureRTL = (language: "ar" | "en") => {
  const shouldBeRTL = language === "ar";

  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
    // Note: App will need to reload for RTL changes to take effect
    return true; // Indicates reload is needed
  }
  return false;
};

/**
 * Initialize RTL on app start
 * Should be called before rendering
 */
export const initializeRTL = () => {
  const locales = Localization.getLocales();
  const deviceLang = locales[0]?.languageCode ?? "ar";
  const isArabic = deviceLang === "ar";

  I18nManager.allowRTL(isArabic);
  I18nManager.forceRTL(isArabic);
};

/**
 * Hook for getting direction-aware styles
 */
export const useDirection = () => {
  const { i18n: i18nInstance } = useTranslation();
  const isRtl = i18nInstance.dir(i18nInstance.language) === "rtl";
  const direction = isRtl ? "rtl" : "ltr";
  const textAlign: "left" | "right" = isRtl ? "right" : "left";
  const flexDirection: "row" | "row-reverse" = isRtl ? "row-reverse" : "row";

  return {
    direction,
    isRTL: isRtl,
    // Utility for flipping horizontal values
    flipIfRTL: (value: number) => (isRtl ? -value : value),
    // Text alignment
    textAlign,
    // Flex direction
    flexDirection,
  };
};

export default {
  getCurrentLanguage,
  isRTL,
  getDirection,
  configureRTL,
  initializeRTL,
  useDirection,
};
