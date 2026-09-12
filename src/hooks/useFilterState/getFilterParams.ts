import countries from "../../assets/countries.json";
import { FilterState } from "../../robotoff";

function normalizeCountryFilter(country: string) {
  if (country === "en:world") {
    return "";
  }

  if (!country.includes(":")) {
    return country;
  }

  const normalizedCountry = country.toLowerCase();
  return (
    countries.find(({ id }) => id?.toLowerCase() === normalizedCountry)
      ?.countryCode ?? country
  );
}

export function getFilterParams(searchParams: URLSearchParams): FilterState {
  const country = normalizeCountryFilter(searchParams.get("country") ?? "");
  return {
    insightType: searchParams.get("type") ?? "",
    valueTag: searchParams.get("value_tag") ?? "",
    country,
    brand: searchParams.get("brand") ?? "",
    campaign: searchParams.get("campaign") ?? "",
    predictor: searchParams.get("predictor") ?? "",
    sorted: searchParams.get("sorted") ?? "true",
  };
}

export { normalizeCountryFilter };

function updateParams(
  searchParams: URLSearchParams,
  key: string,
  value: string | undefined | null,
) {
  if (value == null || value === "") {
    searchParams.delete(key);
  } else {
    searchParams.set(key, value);
  }
}
export function setFilterParams(
  searchParams: URLSearchParams,
  newParams: Partial<FilterState>,
): URLSearchParams {
  const newSearchParams = new URLSearchParams(searchParams);

  updateParams(newSearchParams, "type", newParams.insightType);
  updateParams(newSearchParams, "value_tag", newParams.valueTag);
  updateParams(newSearchParams, "country", newParams.country);
  updateParams(newSearchParams, "brand", newParams.brand);
  updateParams(newSearchParams, "campaign", newParams.campaign);
  updateParams(newSearchParams, "predictor", newParams.predictor);
  updateParams(newSearchParams, "sorted", newParams.sorted);
  return newSearchParams;
}
