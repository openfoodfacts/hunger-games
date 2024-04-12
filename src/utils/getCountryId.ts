import countries from "../assets/countries.json";

/**
 * Get the country id base on the two letter id
 */
export function getCountryId(country: string) {
  if (country.length !== 2) {
    return country;
  }

  const upperCountry = country.toUpperCase();
  const countryId = Object.keys(countries).find(
    (id) => countries[id].countryCode === upperCountry,
  );

  if (countryId === undefined) {
    return country;
  }
  return countryId;
}
