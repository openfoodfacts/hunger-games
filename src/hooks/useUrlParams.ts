import * as React from "react";
import { useSearchParams } from "react-router";
import { UrlParamsContext } from "../contexts/UrlParamsContext";

type UrlParameterValue = string | number | boolean | undefined;
type UrlParameterRecord = Record<string, UrlParameterValue>;
type UrlParameterStateValue<Value> =
  | (Value extends boolean
      ? boolean | string
      : Value extends number
        ? number | string
        : string)
  | Extract<Value, undefined>;
type UrlParameterState<Defaults extends UrlParameterRecord> = {
  [Key in keyof Defaults]: UrlParameterStateValue<Defaults[Key]>;
};
type UrlParameterSynonyms = Record<string, string | readonly string[]>;

export const getDefaultizedUrlParams = <Defaults extends UrlParameterRecord>(
  defaultParameters: Defaults,
  synonyms: UrlParameterSynonyms = {},
  urlParams = new URLSearchParams(window.location.search),
): UrlParameterState<Defaults> => {
  const parameters = { ...defaultParameters } as UrlParameterState<Defaults>;
  const mutableParameters = parameters as UrlParameterRecord;

  Object.keys(defaultParameters).forEach((key) => {
    const value = urlParams.get(key);
    if (value !== null && JSON.stringify(defaultParameters[key]) !== value) {
      mutableParameters[key] = parseUrlParameter(value);
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
        mutableParameters[valueKey] = parseUrlParameter(value);
      }
    });
  });

  return parameters;
};

const parseUrlParameter = (value: string): string | boolean => {
  if (value === "true" || value === "false") {
    return JSON.parse(value) as boolean;
  }
  return value;
};

export const convertObjectParamsToUrlParams = (
  parameters: UrlParameterRecord,
  defaultParameters?: UrlParameterRecord,
  currentSearch = window.location.search,
): string => {
  const urlParams = new URLSearchParams(currentSearch);

  Object.keys(parameters).forEach((key) => {
    const value = parameters[key];
    if (
      JSON.stringify(value) !== urlParams.get(key) &&
      value !== "" &&
      value !== undefined
    ) {
      urlParams.set(key, String(value));
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
 * Hook that works as useState to keep in sync with URL query params.
 * Values read from the URL are strings, except "true" and "false", which
 * are parsed as booleans.
 */
const useUrlParams = <Defaults extends UrlParameterRecord>(
  defaultParams: Defaults,
  synonyms: UrlParameterSynonyms = {},
): [
  UrlParameterState<Defaults>,
  React.Dispatch<React.SetStateAction<UrlParameterState<Defaults>>>,
] => {
  const [searchParams] = useSearchParams();
  const updateSearchParams = React.useContext(UrlParamsContext);
  if (!updateSearchParams) {
    throw new Error("useUrlParams must be used within UrlParamsProvider");
  }
  const parameters = getDefaultizedUrlParams(
    defaultParams,
    synonyms,
    searchParams,
  );

  const updateParameters = React.useCallback<
    React.Dispatch<React.SetStateAction<UrlParameterState<Defaults>>>
  >(
    (modifier) => {
      updateSearchParams((currentSearchParams) => {
        const currentParameters = getDefaultizedUrlParams(
          defaultParams,
          synonyms,
          currentSearchParams,
        );
        const newParams =
          typeof modifier === "function"
            ? modifier(currentParameters)
            : modifier;
        const serializedParams = convertObjectParamsToUrlParams(
          newParams,
          defaultParams,
          currentSearchParams.toString(),
        );
        return new URLSearchParams(serializedParams);
      });
    },
    [defaultParams, synonyms, updateSearchParams],
  );
  return [parameters, updateParameters];
};

export default useUrlParams;
