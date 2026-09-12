import { isEqual } from "lodash-es";
import { FilterState } from "./robotoff";

// Parameters added and to take in consideration to avoid breaking al the saved filter state
const ADDED_PARAMS = {
  // The 2022-10-12 adding a parameter campaign defaultized to an empty sting.
  campaign: "",
};

const areSameFilterState = (
  filterState: FilterState,
  memFilterState: FilterState,
) =>
  isEqual(
    { ...ADDED_PARAMS, ...memFilterState },
    { ...ADDED_PARAMS, ...filterState },
  );

const STORAGE_KEY = "hunger-game-settings";

export const localSettingsKeys = {
  language: "lang",
  colorMode: "colorMode",
  isDevMode: "devMode",
  visiblePages: "visiblePages",
  hideImages: "questions_hideImages",
  showTour: "showTour",
  showDatabase: "showDatabase",
  showNutriscore: "showNutriscore",
  pageCustomization: "pageCustomization",
} as const;

type VisiblePages = Record<string, boolean | undefined>;

interface LocalSettings {
  lang: string;
  colorMode: "light" | "dark";
  devMode: boolean;
  visiblePages: VisiblePages;
  questions_hideImages: boolean;
  showTour: boolean;
  showDatabase: boolean;
  showNutriscore: boolean;
  pageCustomization: {
    questionPage?: {
      showDebug?: boolean;
      showOtherQuestions?: boolean;
    };
  };
}

type LocalSettingsKey = keyof LocalSettings;

const parseStoredObject = (value: string | null): Record<string, unknown> => {
  if (value === null) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch (error: unknown) {
    console.error(error);
    return {};
  }
};

export const localSettings = {
  fetch(): Partial<LocalSettings> {
    return parseStoredObject(localStorage.getItem(STORAGE_KEY));
  },

  save(settings: Partial<LocalSettings>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  },
  update<Key extends LocalSettingsKey>(
    key: Key,
    value: LocalSettings[Key],
  ): void {
    const settings = this.fetch();
    settings[key] = value;
    this.save(settings);
  },
};

export const getIsDevMode = (): boolean => {
  const settings = localSettings.fetch();
  return settings[localSettingsKeys.isDevMode] ?? false;
};

export const getVisiblePages: () => {
  nutriscore: boolean;
  insights: boolean;
} = () => {
  const settings = localSettings.fetch();
  return {
    nutriscore: true,
    insights: true,
    ...settings[localSettingsKeys.visiblePages],
  };
};

export const getPageCustomization: () => {
  questionPage: {
    showDebug: boolean;
    showOtherQuestions: boolean;
  };
} = () => {
  // const settings = localSettings.fetch();
  return {
    questionPage: {
      showDebug: true,
      showOtherQuestions: true,
    },
  };
};

/** Questions page: returns a boolean for hiding the images. Uses local storage.  */
export const getHideImages = (): boolean => {
  const settings = localSettings.fetch();
  return settings[localSettingsKeys.hideImages] ?? true;
};

export const getTour = () => {
  const settings = localSettings.fetch();
  return settings[localSettingsKeys.showTour] ?? true;
};

export const getLang = () => {
  // 1. Check URL params
  const urlParams = new URLSearchParams(window.location.search);
  const urlLanguage = urlParams.has("language") && urlParams.get("language");
  if (urlLanguage) {
    return urlLanguage;
  }

  // 2. Check local storage
  const settings = localSettings.fetch();
  const settingsLanguage = settings[localSettingsKeys.language];
  if (settingsLanguage) {
    return settingsLanguage;
  }

  // 3. Use browser language
  if (navigator && navigator.language) {
    return navigator.language.split("-")[0];
  }

  return undefined;
};

export const getStoredColorPreference = (): "light" | "dark" | undefined => {
  const settings = localSettings.fetch();
  return settings[localSettingsKeys.colorMode];
};

export const getColor = (): "light" | "dark" => {
  const storedPreference = getStoredColorPreference();

  const browserSetting =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  return storedPreference || browserSetting || "light";
};

const FAVORITE_STORAGE_KEY = "hunger-game-favorites";

interface FavoriteQuestion {
  filterState: FilterState;
  imageSrc?: string;
  title: string;
}

interface Favorites {
  questions: FavoriteQuestion[];
}

export const localFavorites = {
  mem: null as Favorites | null,
  fetch(): Partial<Favorites> {
    return parseStoredObject(localStorage.getItem(FAVORITE_STORAGE_KEY));
  },
  save(favorites: Favorites) {
    localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(favorites));
  },
  addQuestion(filterState: FilterState, imageSrc: string, title: string) {
    if (this.mem == null) {
      this.mem = { questions: this.fetch().questions ?? [] };
    }

    const questionIndex = this.mem.questions.findIndex(
      ({ filterState: memFilterState }) =>
        areSameFilterState(memFilterState, filterState),
    );

    if (questionIndex < 0) {
      let defaultiszedTitle = title;
      if (!title) {
        const usedTitles = this.mem.questions.map((q) => q.title);
        defaultiszedTitle = "saved filter";
        let counter = 0;

        while (usedTitles.includes(defaultiszedTitle)) {
          counter += 1;
          defaultiszedTitle = `saved filter ${counter}`;
        }
      }
      this.mem.questions.push({
        filterState,
        imageSrc,
        title: defaultiszedTitle,
      });
    } else {
      this.mem.questions[questionIndex] = {
        filterState,
        imageSrc: imageSrc || this.mem.questions[questionIndex].imageSrc,
        title: title || this.mem.questions[questionIndex].title,
      };
    }
    this.save(this.mem);
  },
  removeQuestion(filterState: FilterState) {
    if (this.mem == null) {
      this.mem = { questions: this.fetch().questions ?? [] };
    }
    this.mem.questions = this.mem.questions.filter(
      ({ filterState: memFilterState }) =>
        !areSameFilterState(memFilterState, filterState),
    );
    this.save(this.mem);
  },
  isSaved(filterState: FilterState) {
    if (this.mem == null) {
      this.mem = { questions: this.fetch().questions ?? [] };
    }

    return (
      this.mem.questions.filter(({ filterState: memFilterState }) =>
        areSameFilterState(memFilterState, filterState),
      ).length > 0
    );
  },
};
