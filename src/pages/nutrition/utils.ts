import axios from "axios";
import countries from "../../assets/countries.json";
import NUTRIMENTS from "../../assets/nutriments.json";
import { UNITS } from "./config";
import { NutrimentPrediction } from "./insight.types";
import { ROBOTOFF_API_URL } from "../../const";

export const NUTRI_TYPE = ["_100g", "_serving"];

export const FORCED_UNITS = {
  "energy-kj": "kj",
  "energy-kcal": "kcal",
  "energy-from-fat": "kj",
};

export function isValidUnit(unit: string | null, nutrimentId: string) {
  if (FORCED_UNITS[nutrimentId] !== undefined) {
    return unit === FORCED_UNITS[nutrimentId];
  }
  return unit == null || UNITS.includes(unit);
}

export function structurePredictions(
  predictions: Record<string, Pick<NutrimentPrediction, "value" | "unit">>,
  productValue?: { nutriments?: Record<string, string | number> },
) {
  return NUTRIMENTS.filter((item) => {
    const key100g = `${item.id}_100g`;
    const keyServing = `${item.id}_serving`;

    return (
      item.display ||
      predictions?.[key100g] !== undefined ||
      predictions?.[keyServing] !== undefined ||
      productValue?.nutriments?.[key100g] !== undefined ||
      productValue?.nutriments?.[keyServing] !== undefined
    );
  });
}

interface PostRobotoffParams {
  insightId: string;
  data: Record<string, { value: string; unit: string | null }>;
  type: "100g" | "serving";
}

/**
 * Extract xxx from the pattern 'yyy/yyyy/yyy/xxx.jpg' or 'yyy/yyyy/yyy/xxx.jpg'
 */
export function getImageId(source: string) {
  return source.split("/")[source.split("/").length - 1].split(".")[0];
}

export function getCountryLanguageCode(countryCode: string) {
  return (
    countries.find((item) => item.countryCode === countryCode)?.languageCode ??
    "en"
  );
}
