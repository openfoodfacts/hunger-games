import countries from "../assets/countries.json";


/**
 * From a country code return the name of the country
 */
export const getCountryName = (countryCode: string | undefined) => {
    if (!countryCode) {
        return countryCode;
    }
    const country = countries.find((country) => country.countryCode === countryCode);
    return country?.label
};
