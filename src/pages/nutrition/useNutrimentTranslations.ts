import axios from "axios";
import * as React from "react";

interface Nutri {
  id?: string;
  name?: string;
  nutrients?: Nutri[];
}

function parseNutrients(data: undefined | Nutri[]): Record<string, string> {
  if (data === undefined) {
    return {};
  }

  const rep: Record<string, string> = {};

  data.forEach((item) => {
    const { id, name, nutrients } = item;

    if (id && name) {
      rep[id] = name;
    }
    if (nutrients !== undefined) {
      Object.entries(parseNutrients(nutrients)).forEach(
        ([key, value]) => (rep[key] = value),
      );
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

    axios
      .get(`https://world.openfoodfacts.org/cgi/nutrients.pl?lc=${language}`)
      .then(({ data }) => {
        setTranslations((p) => ({
          ...p,
          [language]: parseNutrients(data.nutrients),
        }));
      });
  }, [lc, translations]);

  return translations;
}
