import * as React from "react";
import { useLocation, useSearchParams } from "react-router";
import { UrlParamsContext, type UrlParamsUpdater } from "./UrlParamsContext";

export const UrlParamsProvider = ({ children }: React.PropsWithChildren) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const observedLocation = `${location.key}:${location.pathname}${location.search}`;
  const searchParamsRef = React.useRef(new URLSearchParams(searchParams));
  const lastObservedLocationRef = React.useRef(observedLocation);
  React.useEffect(() => {
    if (observedLocation !== lastObservedLocationRef.current) {
      searchParamsRef.current = new URLSearchParams(searchParams);
      lastObservedLocationRef.current = observedLocation;
    }
  }, [observedLocation, searchParams]);

  const updateUrlParams = React.useCallback<UrlParamsUpdater>(
    (update) => {
      const nextSearchParams = update(
        new URLSearchParams(searchParamsRef.current),
      );
      searchParamsRef.current = new URLSearchParams(nextSearchParams);
      setSearchParams(nextSearchParams, { preventScrollReset: true });
    },
    [setSearchParams],
  );

  return (
    <UrlParamsContext.Provider value={updateUrlParams}>
      {children}
    </UrlParamsContext.Provider>
  );
};
