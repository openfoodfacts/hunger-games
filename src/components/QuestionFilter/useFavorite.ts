import * as React from "react";
import { localFavorites } from "../../localeStorageManager";
import { FilterState } from "../../robotoff";

export const useFavorite = (
  filterState: FilterState,
): [boolean, () => void] => {
  const [isFavorite, setIsFavorite] = React.useState(
    localFavorites.isSaved(filterState),
  );

  React.useEffect(() => {
    setIsFavorite(localFavorites.isSaved(filterState));
  }, [filterState]);

  const toggleFavorite = React.useCallback(
    (imageSrc = "", title = "") => {
      const isSaved = localFavorites.isSaved(filterState);

      if (isSaved) {
        localFavorites.removeQuestion(filterState);
      } else {
        localFavorites.addQuestion(filterState, imageSrc, title);
      }

      setIsFavorite(!isSaved);
    },
    [filterState],
  );
  return [isFavorite, toggleFavorite];
};
