import * as React from "react";
import { getFilterParams, setFilterParams } from "./getFilterParams";
import { FilterState } from "../../robotoff";
import { useSearchParams } from "react-router";

type SearchParamsSetter = (
  update: (previous: URLSearchParams) => URLSearchParams,
) => void;

const useTypedSearchParams = useSearchParams as unknown as () => [
  URLSearchParams,
  SearchParamsSetter,
];

export function useFilterState(): [
  FilterState,
  (params: Partial<FilterState>) => void,
] {
  const [searchParams, setSearchParams] = useTypedSearchParams();

  const value = React.useMemo(() => {
    return getFilterParams(searchParams);
  }, [searchParams]);

  const setter = React.useCallback(
    (update: Partial<FilterState>) => {
      setSearchParams((prev) => {
        return setFilterParams(prev, update);
      });
    },
    [setSearchParams],
  );

  return [value, setter];
}
