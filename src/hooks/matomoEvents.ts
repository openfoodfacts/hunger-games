import { useMatomo } from "@jonkoops/matomo-tracker-react";
import { CORRECT_INSIGHT, WRONG_INSIGHT, SKIPPED_INSIGHT } from "../const";
import { useCallback } from "react";

const mapValueToAction = {
  [CORRECT_INSIGHT]: "yes",
  [WRONG_INSIGHT]: "no",
  [SKIPPED_INSIGHT]: "skip",
};

export const useMatomoTrackAnswerQuestion = () => {
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
};

export const useMatomoTrackInvalidUrlParam = () => {
  const { trackEvent } = useMatomo();

  const reportInvalidUrlParam = useCallback(
    ({ param, value }: { param: string; value: string }) => {
      trackEvent({
        category: "question-filter",
        action: "invalid-url-param",
        name: `${param}: ${value}`,
      });
    },
    [trackEvent],
  );

  return { reportInvalidUrlParam };
};
