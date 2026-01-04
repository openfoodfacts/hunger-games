import * as React from "react";

export type CountryCallback = (
  /**
   * The new country code to save.
   * Can either be a 2 letters code, empty string or "world"
   */
  newCountry: string,
  /**
   * The scope of the update:
   * - page: update only the search params. Will be sharable but does not impact other pages.
   * - global: update the current page and the locale storage. It's the new default for other pages.
   */
  scope: "page" | "global",
) => void;

export const CountryContext = React.createContext<{
  setCountry: CountryCallback;
  country: string;
}>({
  country: "world",
  setCountry: () => {},
});

export function useCountry(): [string, CountryCallback] {
  const { country, setCountry } = React.useContext(CountryContext);
  return [country, setCountry];
}

export default CountryContext;
