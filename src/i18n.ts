import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLang } from "./localeStorageManager";
import resourcesToBackend from "i18next-resources-to-backend";

void i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(
    resourcesToBackend((language: string) => import(`./i18n/${language}.json`)),
  )
  .init({
    fallbackLng: "en",
    lng: getLang(),
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
