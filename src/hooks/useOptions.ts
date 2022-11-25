import * as React from "react";
import axios from "axios";

export type Option = {
  value: string;
  synonyms: string[];
  label: string;
};

type Files = "packaging_materials" | "packaging_recycling" | "packaging_shapes";

export const useOptions = (fileName: Files, lang: string) => {
  const [options, setOptions] = React.useState<Option[]>([]);

  React.useEffect(() => {
    axios
      .get(
        `https://static.openfoodfacts.org/data/taxonomies/${fileName}.full.json`
      )
      .then(({ data }) => {
        const newOptions: Option[] = Object.keys(data)
          .map((key) => {
            const synonyms: undefined | string[] =
              data[key].synonyms[lang] ??
              data[key].synonyms["xx"] ??
              data[key].synonyms["en"];

            if (synonyms === undefined) {
              return null;
            }
            return { value: key, synonyms, label: synonyms[0] };
          })
          .filter((o) => o !== null)
          .sort((a, b) => a.label.localeCompare(b.label));

        setOptions(newOptions);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [fileName, lang]);

  return options;
};
