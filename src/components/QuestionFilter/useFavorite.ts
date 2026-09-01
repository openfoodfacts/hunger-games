import * as React from "react";
import { localFavorites } from "../../localeStorageManager";
import { FilterState } from "../../robotoff";

export const useFavorite = (
  filterState: FilterState,
): [boolean, () => void] => {
  const [, refreshFavorite] = React.useReducer((value: number) => value + 1, 0);
  const isFavorite = localFavorites.isSaved(filterState);

  const toggleFavorite = React.useCallback(
    (imageSrc = "", title = "") => {
      const isSaved = localFavorites.isSaved(filterState);

      if (isSaved) {
        localFavorites.removeQuestion(filterState);
      } else {
        localFavorites.addQuestion(filterState, imageSrc, title);
      }

      refreshFavorite();
    },
    [filterState],
  );
  return [isFavorite, toggleFavorite];
};
