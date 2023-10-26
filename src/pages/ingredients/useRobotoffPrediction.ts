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

export default function useRobotoffPrediction() {
  const [data, setData] = React.useState<{
    [key: string]: {
      loading: boolean;
      data: null | { [lang: string]: string };
    };
  }>({});

  async function getData(fetchUrl: string) {
    setData((prev) => ({
      ...prev,
      [fetchUrl]: {
        loading: true,
        data: null,
      },
    }));

    axios
      .get<
        GetIngredientsResponse | GetIngredientsError // That's not clean, but errors return a 200
      >(fetchUrl)
      .then((result) => {
        if (isError(result.data)) {
          setData((prev) => ({
            ...prev,
            [fetchUrl]: {
              loading: false,
              data: null,
            },
          }));
          return;
        }

        const rep = {};
        result.data.entities.map((entity) => {
          rep[entity.lang.lang] = entity.text;
        });
        setData((prev) => ({
          ...prev,
          [fetchUrl]: {
            loading: false,
            data: rep,
          },
        }));
      });
  }
  return [data, getData];
}
