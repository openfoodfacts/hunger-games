import * as React from "react";
import useLocalStorageState from "../../utils/useLocalStorageState";
import CountryContext, { CountryCallback } from "./CountryContext";
import { useSearchParams } from "react-router";
import countries from "../../assets/countries.json";

const ValidCountryCodes = new Set(countries.map((c) => c.countryCode));

export function CountryProvider({ children }) {
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
    [setSearchParams],
  );

  const value = React.useMemo(() => {
    // Try from:
    // - searchParams
    // - localStorage
    // - empty

    const lowercasedCountry = ValidCountryCodes.has(searchParamsCountry)
      ? searchParamsCountry
      : ValidCountryCodes.has(country?.toLocaleLowerCase())
        ? country?.toLocaleLowerCase()
        : "";

    return {
      country: lowercasedCountry,
      setCountry: updateCountry,
    };
  }, [country, searchParamsCountry, updateCountry]);
  return (
    <CountryContext.Provider value={value}>{children}</CountryContext.Provider>
  );
}

export function useCountry(): [string, CountryCallback] {
  const { country, setCountry } = React.useContext(CountryContext);

  return [country, setCountry];
}
