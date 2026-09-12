import React from "react";
import CountryContext, { type CountryCallback } from "./CountryContext";

export function useCountry(): [string, CountryCallback] {
  const { country, setCountry } = React.useContext(CountryContext);
  if (country === undefined || setCountry === undefined) {
    throw new Error("useCountry must be used within a CountryProvider");
  }
  return [country, setCountry];
}
