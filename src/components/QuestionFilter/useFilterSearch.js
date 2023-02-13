import * as React from "react";

import { key2urlParam, urlParams2Key, DEFAULT_FILTER_STATE } from "./const";
import { localFavorites } from "../../localeStorageManager";
import logo from "../../assets/logo.png";
import useUrlParams, {
  convertObjectParamsToUrlParams,
} from "../../hooks/useUrlParams";

const convertParamsToUrl = (params) => {
  const rep = {};
  Object.keys(params).forEach((key) => {
    rep[key2urlParam[key]] = params[key];
  });
  return rep;
};

const convertUrlToParams = (params) => {
  const rep = {};
  Object.keys(params).forEach((key) => {
    rep[urlParams2Key[key]] = params[key];
  });
  return rep;
};

const DEFAULT_FILTER_URL_PARAMS = convertParamsToUrl(DEFAULT_FILTER_STATE);

export const getQuestionSearchParams = (params) =>
  convertObjectParamsToUrlParams(convertParamsToUrl(params));

export function useFilterSearch() {
  // Search filter is a bit special because it's the first API we created and url_params are reused in other applications.
  // To avoid breaking deep link, we maintainthe previouse search params in url, but use more detailed on in the app
  // This hook do the translation

  const [urlSearchParams, setUrlSearchParams] = useUrlParams(
    DEFAULT_FILTER_URL_PARAMS,
    { valueTag: ["value_tag", "value"] }
  );
  const exposedParameters = React.useMemo(
    () => convertUrlToParams(urlSearchParams),
    [urlSearchParams]
  );

  const [isFavorite, setIsFavorite] = React.useState(
    localFavorites.isSaved(exposedParameters)
  );

  const setSearchParams = React.useCallback(
    (modifier) => {
      let newExposedParameters;
      if (typeof modifier === "function") {
        newExposedParameters = modifier(exposedParameters);
      } else {
        newExposedParameters = modifier;
      }

      const isDifferent = Object.keys(DEFAULT_FILTER_STATE).some(
        (key) => newExposedParameters[key] !== exposedParameters[key]
      );

      if (!isDifferent) {
        return;
      }

      setIsFavorite(localFavorites.isSaved(newExposedParameters));
      setUrlSearchParams(convertParamsToUrl(newExposedParameters));
    },
    [exposedParameters, setUrlSearchParams]
  );

  const toggleFavorite = React.useCallback(
    (imageSrc = logo, title = "") => {
      const isSaved = localFavorites.isSaved(exposedParameters);

      if (isSaved) {
        localFavorites.removeQuestion(exposedParameters);
      } else {
        localFavorites.addQuestion(exposedParameters, logo, title);
      }

      setIsFavorite(!isSaved);
    },
    [exposedParameters]
  );

  return [exposedParameters, setSearchParams, isFavorite, toggleFavorite];
}
