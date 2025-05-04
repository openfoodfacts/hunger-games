import { getLang } from "./localeStorageManager";

type Shortcuts = {
  yes: string;
  no: string;
  skip: string;
};

type ShortcutLocalization = {
  en: Shortcuts;
  [locale: string]: Partial<Shortcuts>;
};

const SHORTCUT_LOCALISATION = {
  en: {
    yes: "y",
    no: "n",
    skip: "k",
  },
  fr: {
    yes: "o",
    no: "n",
    skip: "k",
  },
};

export const getShortcuts = (lang?: string): Shortcuts => {
  return {
    ...SHORTCUT_LOCALISATION.en,
    ...SHORTCUT_LOCALISATION[lang ?? getLang()],
  };
};
