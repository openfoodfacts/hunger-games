import * as React from "react";
import { useLocation } from "react-router";

export const setUrlParams = (parameters, defaultParameters) => {
  const newRelativePathQuery = `${
    window.location.pathname
  }?${convertObjectParamsToUrlParams(parameters, defaultParameters)}`;
  window.history.pushState(null, "", newRelativePathQuery);
};

export const getDefaultizedUrlParams = (defaultParameters, synonyms = {}) => {
  const parameters = { ...defaultParameters };
  const urlParams = new URLSearchParams(window.location.search);
  Object.keys(defaultParameters).forEach((key) => {
    const value = urlParams.get(key);
    if (value !== null && JSON.stringify(defaultParameters[key]) !== value) {
      if (value === "true" || value === "false") {
        parameters[key] = JSON.parse(value);
      } else {
        parameters[key] = value;
      }
    }
  });

  Object.entries(synonyms).forEach(([valueKey, synonymKeys]) => {
    const toTest =
      typeof synonymKeys === "string" ? [synonymKeys] : synonymKeys;
    toTest.forEach((synonymKey) => {
      const value = urlParams.get(synonymKey);
      if (
        value !== null &&
        JSON.stringify(defaultParameters[valueKey]) !== value
      ) {
        if (value === "true" || value === "false") {
          parameters[valueKey] = JSON.parse(value);
        } else {
          parameters[valueKey] = value;
        }
      }
    });
  });

  return parameters;
};

export const convertObjectParamsToUrlParams = (
  parameters,
  defaultParameters,
) => {
  const urlParams = new URLSearchParams(window.location.search);

  Object.keys(parameters).forEach((key) => {
    if (
      JSON.stringify(parameters[key]) !== urlParams.get(key) &&
      parameters[key] !== ""
    ) {
      urlParams.set(key, parameters[key]);
    }
  });

  if (defaultParameters !== undefined) {
    Object.keys(defaultParameters).forEach((key) => {
      if (
        urlParams.get(key) !== null &&
        defaultParameters[key] === parameters[key]
      ) {
        // Already in default. We can remove it
        urlParams.delete(key);
      }
    });
  }

  return urlParams.toString();
};

/**
 * Hook that works as useState to keep in sync with URL query params
 * @param {object} defaultParams The object to get from the URL
 * @param {object} synonyms The synonmys under the form { valueKeyA: ['synonymA1', 'synsonymA2'], valueKeyB: 'synsonlymB1' }.
 * If the urls containg a paramter named `synonymA1` it will be used to override valueKeyA value.
 * @returns [state, setState]
 */
const useUrlParams = (defaultParams, synonyms) => {
  const [parameters, setParameters] = React.useState(() =>
    getDefaultizedUrlParams(defaultParams),
  );
  const { search } = useLocation();

  React.useEffect(() => {
    setParameters((prevParams) => {
      const newParams = getDefaultizedUrlParams(defaultParams, synonyms);

      const shouldUpdate = Object.keys(defaultParams).some(
        (key) => newParams[key] !== prevParams[key],
      );
      return shouldUpdate ? newParams : prevParams;
    });
  }, [search, defaultParams, synonyms]);

  const updateParameters = React.useCallback(
    (modifier) => {
      let newParams;
      if (typeof modifier === "function") {
        newParams = modifier(parameters);
      } else {
        newParams = modifier;
      }
      setParameters(newParams);
      setUrlParams(newParams, defaultParams);
    },
    [parameters, defaultParams],
  );
  return [parameters, updateParameters];
};

export default useUrlParams;
