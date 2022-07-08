import * as React from "react";

import { key2urlParam, DEFAULT_FILTER_STATE } from "./const";
import { useLocation } from "react-router-dom";
import { localFavorites } from "../../localeStorageManager";

export const getQuestionSearchParams = (filterState) => {
  const urlParams = new URLSearchParams(window.location.search);

  Object.keys(DEFAULT_FILTER_STATE).forEach((key) => {
    const urlKey = key2urlParam[key];
    if (urlParams.get(urlKey) !== undefined && !filterState[key]) {
      urlParams.delete(urlKey);
    } else if (filterState[key] && urlParams.get(urlKey) !== filterState[key]) {
      urlParams.set(urlKey, filterState[key]);
    }
  });
  return urlParams.toString();
};

const updateSearchSearchParams = (newState) => {
  const newRelativePathQuery = `${
    window.location.pathname
  }?${getQuestionSearchParams(newState)}`;
  window.history.pushState(null, "", newRelativePathQuery);
};

const getSearchFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const initialSearchParams = DEFAULT_FILTER_STATE;
  for (let key of Object.keys(DEFAULT_FILTER_STATE)) {
    const urlKey = key2urlParam[key];
    if (urlParams.has(urlKey)) {
      initialSearchParams[key] = urlParams.get(urlKey);
    }
  }

  return { ...initialSearchParams };
};

export function useFilterSearch() {
  const { search } = useLocation();

  const initialParams = getSearchFromUrl();
  const [searchParams, setInternSearchParams] = React.useState(
    () => initialParams
  );
  const [isFavorite, setIsFavorite] = React.useState(
    localFavorites.isSaved(initialParams)
  );

  React.useEffect(() => {
    setInternSearchParams(getSearchFromUrl());
  }, [search]);

  const setSearchParams = React.useCallback(
    (modifier) => {
      let newState;
      if (typeof modifier === "function") {
        newState = modifier(searchParams);
      } else {
        newState = modifier;
      }
      const isDifferent = Object.keys(DEFAULT_FILTER_STATE).some(
        (key) => newState[key] !== searchParams[key]
      );
      if (!isDifferent) {
        return;
      }

      setIsFavorite(localFavorites.isSaved(newState));
      setInternSearchParams(newState);
      updateSearchSearchParams(newState);
    },
    [searchParams]
  );

  const toggleFavorite = React.useCallback(
    (imageSrc = "", title = "") => {
      const isSaved = localFavorites.isSaved(searchParams);

      if (isSaved) {
        localFavorites.removeQuestion(searchParams);
      } else {
        localFavorites.addQuestion(searchParams, imageSrc, title);
      }

      setIsFavorite(!isSaved);
    },
    [searchParams]
  );

  return [searchParams, setSearchParams, isFavorite, toggleFavorite];
}
