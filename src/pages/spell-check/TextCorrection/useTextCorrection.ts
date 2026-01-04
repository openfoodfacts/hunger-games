import * as React from "react";
import { getDiff, SuggestionType, UpdateType } from "./getDiff";

interface UseTextCorrectionReturnValue {
  suggestionIndex: number;
  nbSuggestions: number;
  suggestionChoices: boolean[];
  text: {
    before: string;
    section: string;
    after: string;
  };
  suggestion: null | {
    current: string;
    proposed: string;
    currentMask: string;
    proposedMask: string;
  };
  actions: {
    resetSuggestions: () => void;
    acceptSuggestion: () => void;
    ignoreSuggestion: () => void;
    revertLastSuggestion: () => void;
    ignoreAllRemainingSuggestions: () => void;
  };
}

function useDiffComputation(
  original: string,
  correction: string,
): [UpdateType[], SuggestionType[]] {
  // Might need to use web worker if I d'ont manage to speedup this function.
  // const [diff, setDiff] = React.useState([]);
  // const [suggestions, setSuggestions] = React.useState([]);

  const [diff, suggestions] = React.useMemo(
    () => getDiff(original, correction),
    [original, correction],
  );

  return [diff, suggestions];
}

export function useTextCorrection(
  original: string,
  correction: string,
): UseTextCorrectionReturnValue {
  const [suggestionChoices, setSuggestionChoices] = React.useState<boolean[]>(
    [],
  );
  const [diff, suggestions] = useDiffComputation(original, correction);

  const suggestionIndex = React.useMemo(
    () => suggestionChoices.length,
    [suggestionChoices],
  );

  // The text with suggestions applied, and the index diff implied by those modifications.
  const [correctedText, indexDiff] = React.useMemo(() => {
    let indexDiff = 0;
    let correctedText = original;
    suggestionChoices.map((applySuggestion, sugIndex) => {
      const suggestion = suggestions[sugIndex];

      if (applySuggestion && suggestion) {
        // We test is suggestion exist because before useEffect reset the `suggestionChoices` we have an invalid intermediate state.
        correctedText = `${correctedText.slice(
          0,
          suggestion.from + indexDiff,
        )}${suggestion.proposed}${correctedText.slice(
          suggestion.to + indexDiff,
        )}`;
        indexDiff += suggestion.proposed.length - suggestion.current.length;
      }
    });
    return [correctedText, indexDiff];
  }, [original, suggestions, suggestionChoices]);

  React.useEffect(() => {
    setSuggestionChoices([]);
  }, [original]);

  const resetSuggestions = React.useCallback(() => {
    setSuggestionChoices([]);
  }, []);

  const acceptSuggestion = React.useCallback(() => {
    setSuggestionChoices((p) =>
      p.length === suggestions.length ? p : [...p, true],
    );
  }, [suggestions]);

  const ignoreSuggestion = React.useCallback(() => {
    setSuggestionChoices((p) =>
      p.length === suggestions.length ? p : [...p, false],
    );
  }, [suggestions]);

  const ignoreAllRemainingSuggestions = React.useCallback(() => {
    setSuggestionChoices((p) =>
      p.length === suggestions.length
        ? p
        : [
            ...p,
            ...Array.from(
              { length: suggestions.length - p.length },
              () => false,
            ),
          ],
    );
  }, [suggestions]);

  const revertLastSuggestion = React.useCallback(() => {
    setSuggestionChoices((p) => p.slice(0, p.length - 1));
  }, []);

  const suggestion = suggestions[suggestionIndex];

  const before = suggestion
    ? correctedText.slice(0, suggestion.from + indexDiff)
    : correctedText;
  const section = suggestion
    ? correctedText.slice(
        suggestion.from + indexDiff,
        suggestion.to + indexDiff,
      )
    : "";
  const after = suggestion
    ? correctedText.slice(suggestion.to + indexDiff)
    : "";

  const currentMask = suggestion
    ? suggestion.current.split("").map(() => "*")
    : []; // Generate an array with one start per character.
  const proposedMask = suggestion
    ? suggestion.proposed.split("").map(() => "*")
    : [];

  diff.forEach((itemDiff: UpdateType) => {
    if (!suggestion) {
      return;
    }
    switch (itemDiff.type) {
      case "REMOVED_1": {
        const i1 = itemDiff.index1 - suggestion.from;
        if (i1 >= 0 && i1 < currentMask.length) {
          // The diff impacts the current suggestion
          currentMask[i1] = "D";
        }
        break;
      }
      case "REMOVED_2": {
        const i2 = itemDiff.index2 - suggestion.proposedStart;
        if (i2 >= 0 && i2 < proposedMask.length) {
          // The diff impacts the current suggestion
          proposedMask[i2] = "D";
        }
        break;
      }
      case "MODIFY": {
        const i1 = itemDiff.index1 - suggestion.from;
        const i2 = itemDiff.index2 - suggestion.proposedStart;
        if (
          i1 >= 0 &&
          i1 < currentMask.length &&
          i2 >= 0 &&
          i2 < proposedMask.length
        ) {
          // The diff impacts the current suggestion
          currentMask[i1] = "M";
          proposedMask[i2] = "M";
        }
      }
    }
  });

  return {
    suggestionIndex,
    nbSuggestions: suggestions.length,
    suggestionChoices,
    text: {
      before,
      section,
      after,
    },
    suggestion: suggestion
      ? {
          current: suggestion.current,
          proposed: suggestion.proposed,
          currentMask: currentMask.join(""),
          proposedMask: proposedMask.join(""),
        }
      : null,
    actions: {
      resetSuggestions,
      acceptSuggestion,
      ignoreSuggestion,
      revertLastSuggestion,
      ignoreAllRemainingSuggestions,
    },
  };
}
