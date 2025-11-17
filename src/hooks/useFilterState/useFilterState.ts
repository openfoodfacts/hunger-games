import * as React from "react";
import {
  FilterParams,
  getFilterParams,
  setFilterParams,
} from "./getFilterParams";
import { useSearchParams } from "react-router";

export function useFilterState(): [
  FilterParams,
  (params: Partial<FilterParams>) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = React.useMemo(() => {
    return getFilterParams(searchParams);
  }, [searchParams]);

  const setter = React.useCallback((update: Partial<FilterParams>) => {
    setSearchParams((prev) => {
      return setFilterParams(prev, update);
    });
  }, []);

  return [value, setter];
}
