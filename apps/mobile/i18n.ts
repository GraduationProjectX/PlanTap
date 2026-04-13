import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "./locales/en.json";
import ar from "./locales/ar.json";

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

const getDeviceLocale = (): string => {
  const locales = Localization.getLocales();
  const deviceLang = locales[0]?.languageCode ?? "ar";
  return deviceLang === "ar" || deviceLang === "en" ? deviceLang : "ar";
};

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLocale(),
  fallbackLng: "ar",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
