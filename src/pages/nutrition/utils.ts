import axios from "axios";
import { OFF_NUTRIMENTS_TO_IGNORE, UNITS } from "./config";
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
  sodium: "sodium",
};

export function isValidUnit(unit: string | null) {
  return unit == null || UNITS.includes(unit);
}

export function structurePredictions(
  predictions: Record<string, Pick<NutrimentPrediction, "value" | "unit">>,
  productValue?: { nutriments?: Record<string, string | number> },
  additionalIds?: string[],
) {
  const nurimentsIds = Object.keys(NUTRIMENTS);

  Object.keys(predictions).forEach((key) => {
    const id = key.split("_")[0]; // split 'energy-kj_100g' to only get 'energy-kj'

    if (OFF_NUTRIMENTS_TO_IGNORE.includes(id)) {
      return;
    }
    if (!nurimentsIds.includes(id)) {
      nurimentsIds.push(id);
    }
  });

  Object.keys(productValue?.nutriments ?? {}).forEach((key) => {
    const id = key.split("_")[0]; // split 'energy-kj_100g' to only get 'energy-kj'

    if (OFF_NUTRIMENTS_TO_IGNORE.includes(id)) {
      return;
    }
    if (!nurimentsIds.includes(id)) {
      nurimentsIds.push(id);
    }
  });

  return [...nurimentsIds, ...additionalIds];
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
    new URLSearchParams(
      `insight_id=${insightId}&annotation=2&data=${JSON.stringify({
        nutrients: filteredValues,
      })}`,
    ),
    {
      withCredentials: true,

      headers: { "content-type": "application/x-www-form-urlencoded" },
    },
  );
}

export function skipRobotoff(config: Pick<PostRobotoffParams, "insightId">) {
  const { insightId } = config;

  axios.post(
    `${ROBOTOFF_API_URL}/insights/annotate`,
    new URLSearchParams(`insight_id=${insightId}&annotation=-1`),
    { withCredentials: true },
  );
}

export function deleteRobotoff(config: Pick<PostRobotoffParams, "insightId">) {
  const { insightId } = config;

  axios.post(
    `${ROBOTOFF_API_URL}/insights/annotate`,
    new URLSearchParams(`insight_id=${insightId}&annotation=0`),
    { withCredentials: true },
  );
}

/**
 * Extract xxx from the pattern 'yyy/yyyy/yyy/xxx.jpg' or 'yyy/yyyy/yyy/xxx.jpg'
 */
export function getImageId(source: string) {
  return source.split("/")[source.split("/").length - 1].split(".")[0];
}
