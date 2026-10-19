import * as React from "react";
import { CORRECT_INSIGHT, WRONG_INSIGHT, SKIPPED_INSIGHT } from "../../const";

export interface MatomoInstance {
  trackPageView: () => void;
  trackEvent: (params: {
    category: string;
    action: string;
    name?: string;
    value?: number;
  }) => void;
}

interface MatomoConfig {
  urlBase: string;
  siteId: number;
}

declare global {
  interface Window {
    _paq: unknown[][];
  }
}

export const MatomoContext = React.createContext<MatomoInstance | null>(null);

export function initMatomo({ urlBase, siteId }: MatomoConfig) {
  window._paq = window._paq || [];
  window._paq.push(["setTrackerUrl", `${urlBase}matomo.php`]);
  window._paq.push(["setSiteId", String(siteId)]);

  const script = document.createElement("script");
  script.src = `${urlBase}matomo.js`;
  script.async = true;
  document.head.appendChild(script);
}

export function useMatomo(): MatomoInstance {
  const context = React.useContext(MatomoContext);
  if (!context) {
    throw new Error("useMatomo must be used within a MatomoProvider");
  }
  return context;
}

const mapValueToAction = {
  [CORRECT_INSIGHT]: "yes",
  [WRONG_INSIGHT]: "no",
  [SKIPPED_INSIGHT]: "skip",
};

export function useMatomoTrackAnswerQuestion() {
  const { trackEvent } = useMatomo();

  return {
    answerQuestions: (answer: -1 | 0 | 1) => {
      trackEvent({
        category: "question-page",
        action: mapValueToAction[answer],
      });
    },
    annotateLogo: ({
      game,
      type,
      value,
      number,
    }: {
      game: string;
      type: string;
      value: string;
      number: number;
    }) => {
      trackEvent({
        category: "logo",
        action: "annotation",
        name: `${game} - ${type} - ${value}`,
        value: number,
      });
    },
  };
}
