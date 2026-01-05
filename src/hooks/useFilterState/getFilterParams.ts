import { FilterState } from "../../robotoff";

export function getFilterParams(searchParams: URLSearchParams): FilterState {
  return {
    insightType: searchParams.get("type") ?? "",
    valueTag: searchParams.get("value_tag") ?? "",
    country: searchParams.get("country") ?? "",
    brand: searchParams.get("brand") ?? "",
    campaign: searchParams.get("campaign") ?? "",
    predictor: searchParams.get("predictor") ?? "",
    sorted: searchParams.get("sorted") ?? "true",
  };
}

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
