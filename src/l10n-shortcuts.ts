import { getLang } from "./localeStorageManager";

type Shortcuts = {
  yes: string;
  no: string;
  skip: string;
};

const DEFAULT_SHORTCUTS: Shortcuts = {
  yes: "y",
  no: "n",
  skip: "k",
};

const SHORTCUT_LOCALISATION: Record<string, Partial<Shortcuts>> = {
  fr: {
    yes: "o",
    no: "n",
    skip: "k",
  },
};

export const getShortcuts = (lang?: string): Shortcuts => {
  const localizedShortcuts = SHORTCUT_LOCALISATION[lang ?? getLang() ?? "en"];
  return {
    yes: localizedShortcuts?.yes ?? DEFAULT_SHORTCUTS.yes,
    no: localizedShortcuts?.no ?? DEFAULT_SHORTCUTS.no,
    skip: localizedShortcuts?.skip ?? DEFAULT_SHORTCUTS.skip,
  };
};
