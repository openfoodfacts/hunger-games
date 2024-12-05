import * as React from "react";
import robotoff from "../../robotoff";
import { InsightType } from "./insight.types";

export function useRobotoffPredicitions() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const [insights, setInsights] = React.useState<InsightType[]>([]);
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

  const nextItem = React.useCallback(() => {
    setInsightIndex((p) => p + 1);
    setCount((p) => p - 1);
  }, []);

  const insight = insights[insightIndex];

  return {
    isLoading,
    insight,
    nextItem,
    count,
  };
}
