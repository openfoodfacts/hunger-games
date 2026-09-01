import * as React from "react";
import { useSearchParams } from "react-router";

import useLocalStorageState from "../../utils/useLocalStorageState";
import CountryContext, { CountryCallback } from "./CountryContext";
import countries from "../../assets/countries.json";

const ValidCountryCodes = new Set(countries.map((c) => c.countryCode));

type SearchParamsSetter = (
  update: (previous: URLSearchParams) => URLSearchParams,
) => void;

const useTypedSearchParams = useSearchParams as unknown as () => [
  URLSearchParams,
  SearchParamsSetter,
];

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [localStorageCountry, setLocalStorageCountry] = useLocalStorageState(
    "country",
    "",
  );
  const [searchParams, setSearchParams] = useTypedSearchParams();

  const updateCountry: CountryCallback = React.useCallback(
    (newCountry, scope) => {
      if (scope === "global") {
        setLocalStorageCountry(newCountry);
      }
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("country", newCountry);
        return next;
      });
    },
    [setLocalStorageCountry, setSearchParams],
  );

  const value = React.useMemo(() => {
    // Try from:
    // - searchParams
    // - localStorage
    // - empty
    let country = "";

    const searchParamsCountry = searchParams.get("country")?.toLowerCase();
    if (searchParamsCountry && ValidCountryCodes.has(searchParamsCountry)) {
      country = searchParamsCountry;
    }

    if (
      country === "" &&
      localStorageCountry &&
      ValidCountryCodes.has(localStorageCountry?.toLocaleLowerCase())
    ) {
      country = localStorageCountry.toLocaleLowerCase();
    }

    return {
      country: country,
      setCountry: updateCountry,
    };
  }, [localStorageCountry, searchParams, updateCountry]);

  return (
    <CountryContext.Provider value={value}>{children}</CountryContext.Provider>
  );
}
