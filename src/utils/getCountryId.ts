import countries from "../assets/countries.json";

/**
 * Get the country id base on the two letter id
 */
export function getCountryId(country: string | null) {
  if (!country || country.length !== 2) {
    return country;
  }

  const upperCountry = country.toUpperCase();
  const countryObject = countries.find(
    ({ countryCode }) => countryCode === upperCountry,
  );

  if (!countryObject || !countryObject.id) {
    return country;
  }
  return countryObject.id;
}
