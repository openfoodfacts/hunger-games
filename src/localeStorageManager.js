import isEqual from "lodash.isequal";

const STORAGE_KEY = "hunger-game-settings";

export const localSettingsKeys = {
  language: "lang",
  isDevMode: "devMode",
  hideImages: "questions_hideImages",
  showTour: "showTour",
};

export const localSettings = {
  fetch: function () {
    let storedValue = {};

    try {
      storedValue = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (e) {}

    return typeof storedValue === "object" ? storedValue : {};
  },
  save: function (settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  },
  update: function (key, value) {
    const settings = this.fetch();
    settings[key] = value;
    this.save(settings);
  },
};

export const getIsDevMode = () => {
  const settings = localSettings.fetch();
  return settings[localSettingsKeys.isDevMode] ?? false;
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
    (navigator.language || navigator.userLanguage).split("-")[0]
  );
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
      ({ filterState: memFilterState }) => isEqual(memFilterState, filterState)
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
      ({ filterState: memFilterState }) => !isEqual(memFilterState, filterState)
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
        isEqual(memFilterState, filterState)
      ).length > 0
    );
  },
};
