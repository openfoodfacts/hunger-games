import axios from "axios";
import { UNITS } from "./config";
import { NutrimentPrediction } from "./insight.types";
import { ROBOTOFF_API_URL } from "../../const";

export const NUTRI_TYPE = ["_100g", "_serving"];

export const NUTRIMENTS = {
  "energy-kj": "energy (kj)",
  "energy-kcal": "energy (kcal)",
  fat: "fat",
  "saturated-fat": "saturated fat",
  carbohydrates: "carbohydrates",
  sugars: "sugars",
  fiber: "fiber",
  proteins: "proteins",
  salt: "salt",
};

export function isValidUnit(unit: string | null) {
  return unit === null || UNITS.includes(unit);
}

export function structurePredictions(
  predictions: Record<string, Pick<NutrimentPrediction, "value" | "unit">>,
) {
  const nurimentsIds = Object.keys(NUTRIMENTS);

  Object.keys(predictions).forEach((key) => {
    if (key === "serving_size") {
      return;
    }
    const id = key.split("_")[0]; // split 'energy-kj_100g' to only get 'energy-kj'

    if (!nurimentsIds.includes(id)) {
      nurimentsIds.push(id);
    }
  });

  return nurimentsIds;
}

interface PostRobotoffParams {
  insightId: string;
  data: Record<string, { value: string; unit: string | null }>;
  type: "100g" | "serving";
}
export function postRobotoff(config: PostRobotoffParams) {
  const { insightId, data, type } = config;

  const filteredValues = {};

  Object.keys(data).forEach((key) => {
    if (key.includes(type) && data[key].value) {
      filteredValues[key] = {
        value: data[key].value,
        unit: data[key].unit,
      };
    }
  });

  axios.post(
    `${ROBOTOFF_API_URL}/insights/annotate`,
    {
      insight_id: insightId,
      data: { nutrient: filteredValues },
    },
    { withCredentials: true },
  );
}
