import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLang } from "./localeStorageManager";
import resources from "./i18n/messages";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: "en",
    lng: getLang(),
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
