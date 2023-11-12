import * as React from "react";
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
  rep: GetIngredientsResponse | GetIngredientsError
): rep is GetIngredientsError {
  return (rep as GetIngredientsError).error !== undefined;
}

type LangContent = Pick<Entities, "start" | "end" | "score" | "text">;

export type DataType = {
  fullText: string;
  detections: Record<string, LangContent>;
};

export default function useRobotoffPrediction(
  fetchUrl: string
): [null | DataType, () => void, boolean, null | string] {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [data, setData] = React.useState<null | DataType>(null);

  const getData = React.useCallback(() => {
    setIsLoading(true);

    axios
      .get<
        GetIngredientsResponse | GetIngredientsError // That's not clean, but errors return a 200
      >(fetchUrl)
      .then((result) => {
        if (isError(result.data)) {
          setIsLoading(false);
          setError(result.data.error);
          setData(null);
          return;
        }

        const rep: DataType = { fullText: result.data.text, detections: {} };
        result.data.entities.map(({ text, start, end, score, lang }) => {
          rep.detections[lang.lang] = { text, start, end, score };
        });

        setIsLoading(false);
        setError(null);
        setData(rep);
      });
  }, [fetchUrl]);

  return [data, getData, isLoading, error];
}
