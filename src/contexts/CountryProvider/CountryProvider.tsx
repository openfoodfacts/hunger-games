import * as React from "react";
import { useSearchParams } from "react-router";

import useLocalStorageState from "../../utils/useLocalStorageState";
import { CountryContext, CountryCallback } from "./CountryContext";

import countries from "../../assets/countries.json";

const ValidCountryCodes = new Set(countries.map((c) => c.countryCode));

type CountryProviderProps = { children: React.ReactNode };

export function CountryProvider({ children }: CountryProviderProps) {
  const [country, setCountry] = useLocalStorageState("country", "");
  const [searchParams, setSearchParams] = useSearchParams();

  const searchParamsCountry = searchParams.get("country")?.toLowerCase();

  const updateCountry: CountryCallback = React.useCallback(
    (newCountry, scope) => {
      if (scope === "global") {
        setCountry(newCountry);
      }
      setSearchParams((prev) => {
        prev.set("country", newCountry);

        return prev;
      });
    },
    [setCountry, setSearchParams],
  );

  const value = React.useMemo(() => {
    // Priority order: searchParams > localStorage > empty string
    let resolvedCountry = "";

    if (searchParamsCountry && ValidCountryCodes.has(searchParamsCountry)) {
      resolvedCountry = searchParamsCountry;
    } else if (country) {
      const lowercasedCountry = country.toLocaleLowerCase();
      if (ValidCountryCodes.has(lowercasedCountry)) {
        resolvedCountry = lowercasedCountry;
      }
    }

    return {
      country: resolvedCountry,
      setCountry: updateCountry,
    };
  }, [country, searchParamsCountry, updateCountry]);
  return (
    <CountryContext.Provider value={value}>{children}</CountryContext.Provider>
  );
}
