import { isEqual } from "lodash";
import { FilterState } from "./robotoff";

// Parameters added and to take in consideration to avoid breaking al the saved filter state
const ADDED_PARAMS = {
  // The 2022-10-12 adding a parameter campaign defaultized to an empty sting.
  campaign: "",
};

const areSameFilterState = (filterState: FilterState, memFilterState: FilterState) =>
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
};

export const localSettings = {
  fetch: function <T>(): Record<string, T | undefined> {
    let storedValue = {};

    try {
      storedValue = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (error: any) {
      console.error(error);
      /* empty */
    }

    return typeof storedValue === "object" ? storedValue : {};
  },

  save: function <T>(settings: T): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  },
  update: function <T>(key: string, value: T): void {
    const settings = this.fetch<T>();
    settings[key] = value;
    this.save(settings);
  },
};

export const getIsDevMode = (): boolean => {
  const settings = localSettings.fetch<boolean | undefined>();
  return settings[localSettingsKeys.isDevMode] ?? false;
};

export const getVisiblePages: () => {
  nutriscore: boolean;
  insights: boolean;
} = () => {
  const settings = localSettings.fetch<undefined | Record<string, boolean | undefined>>();
  return (
    {
      nutriscore: true,
      insights: true,
      ...settings[localSettingsKeys.visiblePages]
    }
  );
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
export const getHideImages = () => {
  const settings = localSettings.fetch();
  return settings[localSettingsKeys.hideImages] ?? true;
};

export const getTour = () => {
  const settings = localSettings.fetch();
  return settings[localSettingsKeys.showTour] ?? true;
};

export const getLang = () => {
  const settings = localSettings.fetch();

  const urlParams = new URLSearchParams(window.location.search);
  const urlLanguage = urlParams.has("language") && urlParams.get("language");

  return (
    urlLanguage ||
    settings[localSettingsKeys.language] ||
    // @ts-expect-error Property 'userLanguage' does not exist on type 'Navigator'.
    (navigator.language || navigator.userLanguage).split("-")[0]
  );
};

export const getColor = (): "light" | "dark" => {
  const settings = localSettings.fetch<"light" | "dark">();

  const browserSetting =
    window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  return settings[localSettingsKeys.colorMode] || browserSetting || "light";
};

const FAVORITE_STORAGE_KEY = "hunger-game-favorites";

export const localFavorites = {
  mem: null,
  fetch: function () {
    return JSON.parse(localStorage.getItem(FAVORITE_STORAGE_KEY) || "{}");
  },
  save: function (favorites) {
    localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(favorites));
  },
  addQuestion: function (filterState, imageSrc, title) {
    if (this.mem == null) {
      this.mem = this.fetch();
    }
    if (!this.mem.questions) {
      this.mem.questions = [];
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
  removeQuestion: function (filterState) {
    if (this.mem == null) {
      this.mem = this.fetch();
    }
    if (!this.mem.questions) {
      return;
    }
    this.mem.questions = this.mem.questions.filter(
      ({ filterState: memFilterState }) =>
        !areSameFilterState(memFilterState, filterState),
    );
    this.save(this.mem);
  },
  isSaved: function (filterState) {
    if (this.mem == null) {
      this.mem = this.fetch();
    }

    if (!this.mem.questions) {
      return false;
    }

    return (
      this.mem.questions.filter(({ filterState: memFilterState }) =>
        areSameFilterState(memFilterState, filterState),
      ).length > 0
    );
  },
};
