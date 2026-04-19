import axios from "axios";
import * as React from "react";

interface Nutri {
  id?: string;
  name?: string;
  nutrients?: Nutri[];
}
function parseNutrients(data: undefined | Nutri[]): Record<string, string> {
  const rep: Record<string, string> = {};

  if (data === undefined) {
    return {};
  }
  data.forEach((item) => {
    const { id, name } = item;
    // Only access .nutrients if it exists and is an array
    const nutrients =
      item &&
      typeof item === "object" &&
      "nutrients" in item &&
      Array.isArray(item.nutrients)
        ? item.nutrients
        : undefined;

    if (id && name) {
      rep[id] = name;
    }
    if (nutrients !== undefined) {
      Object.entries(parseNutrients(nutrients)).forEach(([key, value]) => {
        rep[key] = value;
      });
    }
  });
  return rep;
}

export default function useNutrimentTranslations(lc: string) {
  const [translations, setTranslations] = React.useState<
    Record<string, Record<string, string>>
  >({});

  React.useEffect(() => {
    const language = lc;
    if (
      !language ||
      language === "en" ||
      translations[language] !== undefined
    ) {
      return;
    }

    setTranslations((p) => ({ ...p, [language]: {} }));

    void axios
      .get(`https://world.openfoodfacts.org/cgi/nutrients.pl?lc=${language}`)
      .then(({ data }) => {
        // Defensive: check that data.nutrients is an array
        let nutrients: Nutri[] | undefined = undefined;
        if (
          data &&
          typeof data === "object" &&
          "nutrients" in data &&
          Array.isArray((data as { nutrients?: unknown }).nutrients)
        ) {
          // Check that every element is an object (basic Nutri check)
          const arr = (data as { nutrients: unknown }).nutrients;
          if (
            Array.isArray(arr) &&
            arr.every((el) => typeof el === "object" && el !== null)
          ) {
            nutrients = arr as Nutri[];
          }
        }
        setTranslations((p) => ({
          ...p,
          [language]: parseNutrients(nutrients),
        }));
      });
  }, [lc, translations]);

  return translations;
}
