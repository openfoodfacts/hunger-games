import * as React from "react";
import robotoff from "../../robotoff";
import { InsightType } from "./insight.types";
import axios from "axios";

export function useRobotoffPredicitions() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const [insights, setInsights] = React.useState<InsightType[]>([]);
  const [offData, setOffData] = React.useState<{
    [barecode: string]: "loading" | object;
  }>({});
  const [insightIndex, setInsightIndex] = React.useState(0);

  React.useEffect(() => {
    if (isLoading || insightIndex < insights.length - 1) {
      return;
    }
    let valid = true;
    setIsLoading(true);

    robotoff
      .getInsights(
        "",
        "nutrient_extraction",
        "",
        "not_annotated",
        1,
        25,
        "missing-nutrition",
      )
      .then(({ data }) => {
        if (!valid) {
          return;
        }

        setCount(data.count);
        setInsights((prev) =>
          data.insights.length === 0 ? prev : [...prev, ...data.insights],
        );

        setIsLoading(false);
      });

    return () => {
      valid = false;
    };
  }, [insightIndex, insights]);

  React.useEffect(() => {
    const barecodeToImport = insights
      .slice(insightIndex, insightIndex + 5)
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
  }, [insightIndex, insights]);

  const nextItem = React.useCallback(() => {
    setInsightIndex((p) => p + 1);
    setCount((p) => p - 1);
  }, []);

  const insight = insights[insightIndex];

  console.log(offData);
  const product = insight && offData[insight.barcode];

  return {
    isLoading,
    insight,
    nextItem,
    count,
    product,
  };
}
