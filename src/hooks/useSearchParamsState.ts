import * as React from "react";
import { useSearchParams } from "react-router";

export function useSearchParamsState<T>(
  searchName: string,
  defaultValue: T,
  parser: (search: string) => T = (v: string) => v as T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = React.useState(() => {
    const param = searchParams.get(searchName);
    return param === null ? defaultValue : parser(param);
  });

  const updateState = React.useCallback(
    (update: T) => {
      setState((prev) => {
        const nextVal = typeof update === "function" ? update(prev) : update;

        if (nextVal === prev) {
          return prev;
        }

        setSearchParams((prevSearch) => {
          prevSearch.set(searchName, nextVal);
          return prevSearch;
        });
        return nextVal;
      });
    },
    [setSearchParams],
  );
  return [state, updateState];
}
