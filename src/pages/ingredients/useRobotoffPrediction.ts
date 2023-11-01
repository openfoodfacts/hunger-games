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

export type DataType = { [lang: string]: string };

export default function useRobotoffPrediction(
  fetchUrl: string
): [null | DataType, () => void, boolean, null | string] {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [data, setData] = React.useState<null | { [lang: string]: string }>(
    null
  );

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

        const rep = {};
        result.data.entities.map((entity) => {
          rep[entity.lang.lang] = entity.text;
        });
        setIsLoading(false);
        setError(null);
        setData(rep);
      });
  }, [fetchUrl]);

  return [data, getData, isLoading, error];
}
