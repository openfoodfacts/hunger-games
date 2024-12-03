import * as React from "react";
import robotoff from "../../robotoff";
import { InsightType } from "./insight.types";

export function useRobotoffPredicitions() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [insights, setInsights] = React.useState<InsightType[]>([]);
  const [insightIndex, setInsightIndex] = React.useState(0);
  const [page, setPage] = React.useState(1);

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
        "",

        page,
      )
      .then(({ data }) => {
        if (!valid) {
          return;
        }
        setInsights((prev) => [...prev, ...data.insights]);
        setPage((p) => p + 1);
        setIsLoading(false);
      });

    return () => {
      valid = false;
    };
  }, [page, insightIndex, insights]);

  const nextItem = React.useCallback(() => setInsightIndex((p) => p + 1), []);

  const insight = insights[insightIndex];

  return { isLoading, insight, nextItem };
}
