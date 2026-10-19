import * as React from "react";

export type UrlParamsUpdater = (
  update: (currentSearchParams: URLSearchParams) => URLSearchParams,
) => void;

export const UrlParamsContext = React.createContext<UrlParamsUpdater | null>(
  null,
);
