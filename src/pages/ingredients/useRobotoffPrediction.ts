import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type Entities = {
  start: number;
  end: number;
  score: number;
  text: string;
  lang: {
    lang: string;
    confidence: string;
  };
};
type GetIngredientsResponse = {
  entities: Entities[];
  text: string;
};
type GetIngredientsError = { error: string; description: string };

function isError(
  rep: GetIngredientsResponse | GetIngredientsError,
): rep is GetIngredientsError {
  return (rep as GetIngredientsError).error !== undefined;
}

type LangContent = Pick<Entities, "start" | "end" | "score" | "text">;

export type DataType = {
  fullText: string;
  detections: Record<string, LangContent>;
};

export default function useRobotoffPrediction(
  fetchUrl: string,
): [null | DataType, () => void, boolean, null | string] {
  const { data, refetch, isFetching, error } = useQuery({
    queryKey: ["robotoff-prediction", fetchUrl],
    queryFn: async () => {
      const result = await axios.get<
        GetIngredientsResponse | GetIngredientsError // That's not clean, but errors return a 200
      >(fetchUrl);

      if (isError(result.data)) {
        throw new Error(result.data.error);
      }

      const rep: DataType = { fullText: result.data.text, detections: {} };
      result.data.entities.forEach(({ text, start, end, score, lang }) => {
        rep.detections[lang.lang] = { text, start, end, score };
      });

      return rep;
    },
    enabled: false,
  });

  return [
    data ?? null,
    refetch,
    isFetching,
    error instanceof Error ? error.message : null,
  ];
}
