import { getLang } from "./localeStorageManager";

type Shortcuts = {
  yes: string;
  no: string;
  skip: string;
};

const SHORTCUT_LOCALISATION: Record<string, Shortcuts> = {
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
  const base: Shortcuts = SHORTCUT_LOCALISATION.en;
  // Ensure we never use undefined as an index
  const resolvedLang = lang ?? getLang() ?? "en";
  const local = SHORTCUT_LOCALISATION[resolvedLang];
  if (local) {
    return { ...base, ...local };
  }
  return base;
};
