import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "./locales/en.json";
import ar from "./locales/ar.json";

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

// Get device locale, default to Arabic (primary language)
const getDeviceLocale = (): string => {
  const locales = Localization.getLocales();
  const deviceLang = locales[0]?.languageCode ?? "ar";
  return deviceLang === "ar" || deviceLang === "en" ? deviceLang : "ar";
};

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLocale(),
  fallbackLng: "ar", // Arabic-first as per IMPLEMENTATION-PLAN
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
