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
