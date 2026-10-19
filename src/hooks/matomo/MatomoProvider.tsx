import * as React from "react";
import { MatomoContext } from ".";
import type { MatomoInstance } from ".";

export function MatomoProvider({ children }: { children: React.ReactNode }) {
  const instance = React.useMemo<MatomoInstance>(
    () => ({
      trackPageView: () => {
        window._paq?.push(["trackPageView"]);
      },
      trackEvent: ({ category, action, name, value }) => {
        const event: unknown[] = ["trackEvent", category, action];
        if (name !== undefined) event.push(name);
        if (value !== undefined) event.push(String(value));
        window._paq?.push(event);
      },
    }),
    [],
  );

  return (
    <MatomoContext.Provider value={instance}>{children}</MatomoContext.Provider>
  );
}
