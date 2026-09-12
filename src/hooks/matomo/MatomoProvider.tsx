import * as React from "react";
import { MatomoContext } from "./context";
import type { MatomoConfig, MatomoInstance } from "./types";

const initMatomo = ({ urlBase, siteId }: MatomoConfig) => {
  window._paq = window._paq || [];
  window._paq.push(["setTrackerUrl", `${urlBase}matomo.php`]);
  window._paq.push(["setSiteId", String(siteId)]);

  // Load the Matomo tracking script
  const script = document.createElement("script");
  script.src = `${urlBase}matomo.js`;
  script.async = true;
  document.head.appendChild(script);
};

export function MatomoProvider({
  config,
  children,
}: {
  config: MatomoConfig;
  children: React.ReactNode;
}) {
  const instance = React.useMemo<MatomoInstance>(
    () => ({
      trackPageView: () => {
        window._paq?.push(["trackPageView"]);
      },
      trackEvent: ({ category, action, name, value }) => {
        const event = ["trackEvent", category, action];
        if (name !== undefined) event.push(name);
        if (value !== undefined) event.push(String(value));
        window._paq?.push(event);
      },
    }),
    [],
  );

  React.useEffect(() => {
    initMatomo(config);
  }, [config]);

  return (
    <MatomoContext.Provider value={instance}>{children}</MatomoContext.Provider>
  );
}
