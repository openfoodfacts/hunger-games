import * as React from "react";

import { key2urlParam, DEFAULT_FILTER_STATE } from "./const";

const updateSearchSearchParams = (newState) => {
  const urlParams = new URLSearchParams(window.location.search);

  Object.keys(DEFAULT_FILTER_STATE).forEach((key) => {
    const urlKey = key2urlParam[key];
    if (urlParams.get(urlKey) !== undefined && !newState[key]) {
      urlParams.delete(urlKey);
    } else if (newState[key] && urlParams.get(urlKey) !== newState[key]) {
      urlParams.set(urlKey, newState[key]);
    }
  });
  const newRelativePathQuery = `${window.location.pathname}?${urlParams.toString()}`;
  window.history.pushState(null, "", newRelativePathQuery);
};

export function useFilterSearch() {
  const [searchParams, setInternSearchParams] = React.useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialSearchParams = DEFAULT_FILTER_STATE;
    for (let key of Object.keys(DEFAULT_FILTER_STATE)) {
      const urlKey = key2urlParam[key];
      if (urlParams.has(urlKey)) {
        initialSearchParams[key] = urlParams.get(urlKey);
      }
    }

    return initialSearchParams;
  });

  const setSearchParams = React.useCallback(
    (modifier) => {
      let newState;
      if (typeof modifier === "function") {
        newState = modifier(searchParams);
      } else {
        newState = modifier;
      }
      const isDifferent = Object.keys(DEFAULT_FILTER_STATE).some((key) => newState[key] !== searchParams[key]);
      if (!isDifferent) {
        return;
      }

      setInternSearchParams(newState);
      updateSearchSearchParams(newState);
    },
    [searchParams]
  );
  return [searchParams, setSearchParams];
}
