import * as React from "react";
import robotoff from "../../robotoff";
import { InsightType } from "./insight.types";
import { useCountry } from "../../contexts/CountryProvider";

export type ProductType = {
  images: Record<string, any>;
  serving_size?: any;
  nutriments?: any;
};

export function useRobotoffPredictions(partiallyFilled: boolean) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  const campaign = partiallyFilled
    ? "incomplete-nutrition"
    : "missing-nutrition";

  const [insights, setInsights] = React.useState<{
    campaign: "incomplete-nutrition" | "missing-nutrition";
    data: InsightType[];
  }>({
    campaign,
    data: [],
  });

  const [offData, setOffData] = React.useState<{
    [barecode: string]: "loading" | ProductType;
  }>({});
  const [insightIndex, setInsightIndex] = React.useState(0);
  const [country] = useCountry();

  React.useEffect(() => {
    if (
      campaign === insights.campaign &&
      (isLoading || insightIndex < insights.data.length - 1)
    ) {
      return;
    }
    let valid = true;
    setIsLoading(true);
    setError(null);

    robotoff
      .getInsights(
        "",
        "nutrient_extraction",
        "",
        "not_annotated",
        1,
        25,
        campaign,
        country,
      )
      .then(({ data }) => {
        if (!valid) {
          return;
        }

        setCount(data.count);
        setInsights((prev) => {
          if (campaign === prev.campaign) {
            if (data.insights.length === 0) {
              return prev;
            }
            return {
              ...prev,
              data: [...prev.data, ...data.insights],
            };
          }
          return {
            campaign,
            data: data.insights,
          };
        });

        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        setError("Sorry, the server is temporarily unavailable. Please try again later.");
      });

    return () => {
      valid = false;
    };
  }, [insightIndex, insights, campaign]);

  React.useEffect(() => {
    const barecodeToImport = insights.data
      .slice(insightIndex, insightIndex + 5)
      .filter((insight) => offData[insight.barcode] === undefined)
      .map((insight) => insight.barcode);

    barecodeToImport.forEach((code) => {
      setOffData((prev) => ({ ...prev, [code]: "loading" }));
      
    });
  }, [insightIndex, insights.data]);

  const nextItem = React.useCallback(() => {
    setInsightIndex((p) => p + 1);
    setCount((p) => (p === 100 ? p : p - 1));
  }, []);

  const insight = insights.data[insightIndex];

  const product = insight !== undefined ? offData[insight.barcode] : undefined;

  return {
    isLoading,
    insight,
    nextItem,
    count,
    product: product === "loading" ? undefined : product,
    error,
  };
}
