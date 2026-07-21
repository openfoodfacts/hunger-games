import * as React from "react";
import CountryContext, { CountryCallback } from "./CountryContext";

export function useCountry(): [string, CountryCallback] {
  const { country, setCountry } = React.useContext(CountryContext);
  return [country, setCountry];
}
