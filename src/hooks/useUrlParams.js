import * as React from "react";
import { useLocation } from "react-router-dom";

export const setUrlParams = (parameters, defaultParameters) => {
  const newRelativePathQuery = `${
    window.location.pathname
  }?${convertObjectParamsToUrlParams(parameters, defaultParameters)}`;
  window.history.pushState(null, "", newRelativePathQuery);
};

export const getDefaultizedUrlParams = (defaultParameters) => {
  const parameters = { ...defaultParameters };
  const urlParams = new URLSearchParams(window.location.search);
  Object.keys(defaultParameters).forEach((key) => {
    const value = urlParams.get(key);
    if (
      value !== null &&
      JSON.stringify(defaultParameters[key]) !== urlParams.get(key)
    ) {
      if (value === "true" || value === "false") {
        parameters[key] = JSON.parse(value);
      } else {
        parameters[key] = value;
      }
    }
  });

  return parameters;
};

export const convertObjectParamsToUrlParams = (
  parameters,
  defaultParameters
) => {
  const urlParams = new URLSearchParams(window.location.search);

  Object.keys(parameters).forEach((key) => {
    if (JSON.stringify(parameters[key]) !== urlParams.get(key)) {
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

const useUrlParams = (defaultParams) => {
  const [parameters, setParameters] = React.useState(() =>
    getDefaultizedUrlParams(defaultParams)
  );
  const { search } = useLocation();

  React.useEffect(() => {
    setParameters((prevParams) => {
      const newParams = getDefaultizedUrlParams(defaultParams);
      const shouldUpdate = Object.keys(defaultParams).some(
        (key) => newParams[key] !== prevParams[key]
      );
      return shouldUpdate ? newParams : prevParams;
    });
  }, [search, defaultParams]);

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
    [parameters, defaultParams]
  );
  return [parameters, updateParameters];
};

export default useUrlParams;
