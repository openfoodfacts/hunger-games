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

export function useRobotoffPredictions(partiallyFilled: boolean) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [count, setCount] = React.useState(0);

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
      });

    return () => {
      valid = false;
    };
  }, [insightIndex, insights, campaign, country, isLoading]);

  React.useEffect(() => {
    const barecodeToImport = insights.data
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
  }, [insightIndex, insights.data, offData]);

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
  };
}
