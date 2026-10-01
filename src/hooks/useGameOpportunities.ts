import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ROBOTOFF_API_URL } from "../const";
import off from "../off";

export type OpportunityGameType =
  | "ingredient-detection"
  | "nutrition"
  | "ingredient-spellcheck"
  | "select-ingredient-image";

export const fetchRobotoffInsightCount = async (
  insightType: string,
  country?: string,
): Promise<number> => {
  const params: Record<string, string> = {
    insight_types: insightType,
    annotated: "0",
    count: "1",
  };
  if (country && country !== "world") {
    params.countries = country;
  }
  const url = `${ROBOTOFF_API_URL}/insights?${new URLSearchParams(params).toString()}`;
  const { data } = await axios.get<{ count?: number }>(url);
  return data.count ?? 0;
};

export const fetchSelectIngredientImageOpportunityCount = async (
  country?: string,
): Promise<number> => {
  const filters: { [key: string]: string }[] = [
    {
      tagtype: "states",
      tag_contains: "contains",
      tag: "ingredients-photo-to-be-selected",
    },
    {
      tagtype: "states",
      tag_contains: "contains",
      tag: "photos-uploaded",
    },
  ];
  if (country && country !== "world") {
    filters.push({
      tagtype: "countries",
      tag_contains: "contains",
      tag: country,
    });
  }

  const { data } = await off.searchProducts({
    page: 1,
    pageSize: 1,
    filters,
    fields: "code",
    countryCode: country && country !== "world" ? country : "world",
  });

  return data.count ?? 0;
};

export const useGameOpportunities = (
  game: OpportunityGameType,
  country?: string,
) => {
  return useQuery({
    queryKey: ["game-opportunity-count", game, country ?? "world"],
    queryFn: async () => {
      switch (game) {
        case "ingredient-detection":
          return fetchRobotoffInsightCount("ingredient_detection", country);
        case "nutrition":
          return fetchRobotoffInsightCount("nutrient_extraction", country);
        case "ingredient-spellcheck":
          return fetchRobotoffInsightCount("ingredient_spellcheck", country);
        case "select-ingredient-image":
          return fetchSelectIngredientImageOpportunityCount(country);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
