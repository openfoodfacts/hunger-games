export const getQuestionSearchParams = (logoSearchState) => {
  const urlParams = new URLSearchParams(window.location.search);

  Object.keys(DEFAULT_LOGO_SEARCH_STATE).forEach((key) => {
    if (urlParams.get(key) !== undefined && !logoSearchState[key]) {
      urlParams.delete(key);
    } else if (
      logoSearchState[key] &&
      urlParams.get(key) !== logoSearchState[key]
    ) {
      urlParams.set(key, logoSearchState[key]);
    }
  });
  return urlParams.toString();
};

export const DEFAULT_LOGO_SEARCH_STATE = {
  count: 50,
  logo_id: "",
  index: "",
};
