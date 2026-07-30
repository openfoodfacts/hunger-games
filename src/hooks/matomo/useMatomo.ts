import * as React from "react";
import { MatomoContext } from "./context";
import type { MatomoInstance } from "./types";

export function useMatomo(): MatomoInstance {
  const context = React.useContext(MatomoContext);
  if (!context) {
    throw new Error("useMatomo must be used within a MatomoProvider");
  }
  return context;
}
