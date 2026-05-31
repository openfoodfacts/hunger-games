import * as React from "react";
import { useSearchParams } from "react-router";

import useLocalStorageState from "../../utils/useLocalStorageState";
import CountryContext, { CountryCallback } from "./CountryContext";
import countries from "../../assets/countries.json";

const ValidCountryCodes = new Set(countries.map((c) => c.countryCode));

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [localStorageCountry, setLocalStorageCountry] = useLocalStorageState(
    "country",
    "",
  );
  const [searchParams, setSearchParams] = useSearchParams();

  const updateCountry: CountryCallback = React.useCallback(
    (newCountry, scope) => {
      if (scope === "global") {
        setLocalStorageCountry(newCountry);
      }
      setSearchParams((prev) => {
        prev.set("country", newCountry);

        return prev;
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
