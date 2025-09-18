import * as React from "react";
import axios from "axios";
import robotoff from "../../robotoff";
import { InsightType } from "./insight.types";
import { useCountry } from "../../contexts/CountryProvider";

export type ProductType = {
  images: Record<string, any>;
  serving_size?: any;
  nutriments?: any;
};

export function useRobotoffPredictions() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [count, setCount] = React.useState(0);

  const [insights, setInsights] = React.useState<InsightType[]>([]);

  const [offData, setOffData] = React.useState<{
    [barecode: string]: "loading" | ProductType;
  }>({});

  const [country] = useCountry();

  React.useEffect(() => {
    if (isLoading || insights.length > 0) {
      return;
    }
    let valid = true;
    setIsLoading(true);

    robotoff
      .getInsights(
        "",
        "ingredient_spellcheck",
        "",
        "not_annotated",
        1,
        25,
        "",
        country,
      )
      .then(({ data }) => {
        if (!valid) {
          return;
        }

        setCount(data.count);
        setInsights(data.insights);

        setIsLoading(false);
      });

    return () => {
      valid = false;
    };
  }, [insights]);

  React.useEffect(() => {
    const barecodeToImport = insights
      .slice(0, 5)
      .filter((insight) => offData[insight.barcode] === undefined)
      .map((insight) => insight.barcode);

    barecodeToImport.forEach((code) => {
      setOffData((prev) => ({ ...prev, [code]: "loading" }));
      axios
        .get(
          `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=serving_size,nutriments,images`,
        )
        .then(({ data: { product } }) => {
          setOffData((prev) => ({ ...prev, [code]: product }));
        });
    });
  }, [insights]);

  const nextItem = React.useCallback(() => {
    setInsights((p) => p.slice(1));
    setCount((p) => p - 1);
  }, []);

  const insight = insights[0];

  const product = insight !== undefined ? offData[insight.barcode] : undefined;

  return {
    isLoading,
    insight,
    nextItem,
    count,
    product: product === "loading" ? undefined : product,
  };
}
