import axios from "axios";
import { useQuery } from "@tanstack/react-query";

interface Nutri {
  id?: string;
  name?: string;
  nutrients?: Nutri[];
}
function parseNutrients(data: undefined | Nutri[]): Record<string, string> {
  const rep = {};

  if (data === undefined) {
    return {};
  }
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
  const query = useQuery({
    queryKey: ["nutriment-translations", lc],
    queryFn: async () => {
      const { data } = await axios.get<{ nutrients?: Nutri[] }>(
        `https://world.openfoodfacts.org/cgi/nutrients.pl?lc=${lc}`,
      );
      return parseNutrients(data.nutrients);
    },
    enabled: Boolean(lc && lc !== "en"),
  });

  return lc && lc !== "en" ? { [lc]: query.data ?? {} } : {};
}
