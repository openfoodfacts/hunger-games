import { useMatomo } from "@jonkoops/matomo-tracker-react";
import { CORRECT_INSIGHT, WRONG_INSIGHT, SKIPPED_INSIGHT } from "../const";

const mapValueToAction = {
  [CORRECT_INSIGHT]: "yes",
  [WRONG_INSIGHT]: "no",
  [SKIPPED_INSIGHT]: "skip",
};

export const useMatomoTrackAnswerQuestion = () => {
  const { trackEvent } = useMatomo();

  return (answer: -1 | 0 | 1) => {
    trackEvent({ category: "question-page", action: mapValueToAction[answer] });
  };
};
