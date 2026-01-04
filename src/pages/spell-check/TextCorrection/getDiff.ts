const COST_REMOVE = 2;
const COST_DIFF = 1;

export interface SuggestionType {
  from: number;
  to: number;
  current: string;
  proposed: string;
  proposedStart: number;
  proposedEnd: number;
}

export type UpdateType =
  | { type: "REMOVED_1"; index1: number }
  | { type: "REMOVED_2"; index2: number }
  | { type: "MODIFY"; index1: number; index2: number };

/**
 *
 * @param text1 The original text
 * @param text2 The corrected text
 * @returns an array of character modification, and a list of suggestion the group those diffs per words.
 */
export function getDiff(
  text1: string,
  text2: string,
): [UpdateType[], SuggestionType[]] {
  const words1 = text1.split("");
  const words2 = text2.split("");

  // Comput the cost for each substring alignment.
  const computedCost: Record<string, number> = {};

  computedCost["-1_-1"] = 0;
  for (let i = 0; i < words1.length; i += 1) {
    computedCost[`${i}_-1`] = (i + 1) * COST_REMOVE;
  }
  for (let j = 0; j < words2.length; j += 1) {
    computedCost[`-1_${j}`] = (j + 1) * COST_REMOVE;
  }

  for (let i = 0; i < words1.length; i += 1) {
    const word1 = words1[i];
    for (let j = 0; j < words2.length; j += 1) {
      const word2 = words2[j];

      const c1 = COST_REMOVE * word1.length + computedCost[`${i - 1}_${j}`];
      const c2 = COST_REMOVE * word2.length + computedCost[`${i}_${j - 1}`];
      const matchCost =
        (word1 !== word2 ? COST_DIFF : 0) + computedCost[`${i - 1}_${j - 1}`];
      computedCost[`${i}_${j}`] = Math.min(c1, c2, matchCost);
    }
  }

  let i = words1.length - 1;
  let j = words2.length - 1;

  // Back path used to deduce modification from the cost matrix.
  const updates: UpdateType[] = [];
  while (i >= 0 && j >= 0) {
    const word1 = words1[i];
    const word2 = words2[j];

    if (
      computedCost[`${i}_${j}`] ===
      COST_REMOVE * word1.length + computedCost[`${i - 1}_${j}`]
    ) {
      updates.push({ type: "REMOVED_1", index1: i });
      i = i - 1;
    } else if (
      computedCost[`${i}_${j}`] ===
      COST_REMOVE * word2.length + computedCost[`${i}_${j - 1}`]
    ) {
      updates.push({ type: "REMOVED_2", index2: j });
      j = j - 1;
    } else if (word1 !== word2) {
      updates.push({ type: "MODIFY", index1: i, index2: j });
      i = i - 1;
      j = j - 1;
    } else {
      i = i - 1;
      j = j - 1;
    }
  }

  while (i > 0) {
    updates.push({ type: "REMOVED_1", index1: i });
    i = i - 1;
  }
  while (j > 0) {
    updates.push({ type: "REMOVED_2", index2: j });
    j = j - 1;
  }

  updates.reverse();

  // Deduce suggestions to display.
  // A suggestion start at a space character common to the two strings, and end  at the next common space.
  let i1 = 0;
  let i2 = 0;

  const lastCommonSpace = {
    i1: 0,
    i2: 0,
  };

  let updateFound = false;
  let nextUpdateIndex = 0;

  const suggestions: SuggestionType[] = [];
  while (i1 < text1.length && i2 < text2.length) {
    const currentUpdate = updates[nextUpdateIndex];

    if (
      "index1" in currentUpdate
        ? currentUpdate.index1 === i1
        : currentUpdate.index2 === i2
    ) {
      // We are matching with an update
      nextUpdateIndex += 1;
      updateFound = true;

      switch (currentUpdate.type) {
        case "REMOVED_2":
          i2 += 1;
          break;
        case "REMOVED_1":
          i1 += 1;
          break;
        default:
          i1 += 1;
          i2 += 1;
          break;
      }
    } else {
      if (text1[i1] === " " && text2[i2] === " ") {
        if (updateFound) {
          suggestions.push({
            from: lastCommonSpace.i1 + 1, // +1 to remove the common space
            to: i1,
            current: text1.slice(lastCommonSpace.i1 + 1, i1),
            proposed: text2.slice(lastCommonSpace.i2 + 1, i2),
            proposedStart: lastCommonSpace.i2 + 1,
            proposedEnd: i2,
          });
          updateFound = false;
        }
        lastCommonSpace.i1 = i1;
        lastCommonSpace.i2 = i2;
      }

      i1 += 1;
      i2 += 1;
    }
  }

  return [updates, suggestions];
}
