import isEqual from "lodash.isequal";

const STORAGE_KEY = "hunger-game-settings";

export const localSettings = {
  fetch: function () {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
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
  return settings.devMode ?? false;
};

export const getLang = () => {
  const settings = localSettings.fetch();

  const urlParams = new URLSearchParams(window.location.search);
  const urlLanguage = urlParams.has("language") && urlParams.get("language");

  return (
    urlLanguage ||
    settings.lang ||
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
    const questionIndex = this.mem.questions.indexOf(
      ({ filterState: memFilterState }) => isEqual(memFilterState, filterState)
    );
    if (questionIndex < 0) {
      this.mem.questions.push({ filterState, imageSrc, title });
    } else {
      this.mem.questions[questionIndex] = { filterState, imageSrc, title };
    }
    console.log(this.mem);
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
