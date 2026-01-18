import * as React from "react";

import { CORRECT_INSIGHT, WRONG_INSIGHT, SKIPPED_INSIGHT } from "../../const";
import { AnswerQuestionParams } from "../../hooks/useQuestions";

import { getShortcuts } from "../../l10n-shortcuts";
import { QuestionInterface } from "../../robotoff";

export const useKeyboardShortcuts = (
  question: QuestionInterface | null,
  answerQuestion: (p: AnswerQuestionParams) => void,
) => {
  const shortcuts = getShortcuts();

  React.useEffect(() => {
    function handleShortCut(event: KeyboardEvent) {
      // @ts-expect-error tagName exists on event.target
      const preventShortCut = event.target?.tagName.toUpperCase() === "INPUT";
      if (question?.insight_id && !preventShortCut) {
        switch (event.key) {
          case shortcuts.skip:
            answerQuestion({
              answer: SKIPPED_INSIGHT,
              question,
            });
            break;
          case shortcuts.yes:
            answerQuestion({
              answer: CORRECT_INSIGHT,
              question,
            });
            break;
          case shortcuts.no:
            answerQuestion({
              answer: WRONG_INSIGHT,
              question,
            });
            break;
          default:
            break;
        }
      }
    }

    window.addEventListener("keydown", handleShortCut);
    return () => window.removeEventListener("keydown", handleShortCut);
  }, [
    question,
    answerQuestion,
    shortcuts.skip,
    shortcuts.yes,
    shortcuts.no,
  ]);

  return shortcuts;
};
