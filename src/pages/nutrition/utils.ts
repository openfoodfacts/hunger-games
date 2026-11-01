import { checkedFetch } from "../../utils/checkedFetch";
import countries from "../../assets/countries.json";
import NUTRIMENTS from "../../assets/nutriments.json";
import { UNITS } from "./config";
import { NutrimentPrediction } from "./insight.types";
import { ROBOTOFF_API_URL } from "../../const";

export const NUTRI_TYPE = ["_100g", "_serving"];

export const FORCED_UNITS: Record<string, string | undefined> = {
  "energy-kj": "kj",
  "energy-kcal": "kcal",
  "energy-from-fat": "kj",
};

export function isValidUnit(unit: string | null, nutrimentId: string) {
  if (nutrimentId in FORCED_UNITS) {
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
export function postRobotoff(config: PostRobotoffParams) {
  const { insightId, data, type } = config;

  const filteredValues: Record<string, { value: string; unit: string | null }> =
    {};

  Object.keys(data).forEach((key) => {
    if (key.includes(type) && data[key].value) {
      const nutriId = type.replace(`_${type}`, ""); // remove the _100g _serving suffix
      const forcedUnit = FORCED_UNITS[nutriId];
      filteredValues[key] = {
        value: data[key].value,
        unit: forcedUnit ?? data[key].unit,
      };
    }
  });

  return checkedFetch(`${ROBOTOFF_API_URL}/insights/annotate`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(
      `insight_id=${insightId}&annotation=2&data=${JSON.stringify({
        nutrients: filteredValues,
      })}`,
    ),
  });
}

export function skipRobotoff(config: Pick<PostRobotoffParams, "insightId">) {
  const { insightId } = config;

  return checkedFetch(`${ROBOTOFF_API_URL}/insights/annotate`, {
    method: "POST",
    credentials: "include",
    body: new URLSearchParams(`insight_id=${insightId}&annotation=-1`),
  });
}

export function deleteRobotoff(config: Pick<PostRobotoffParams, "insightId">) {
  const { insightId } = config;

  return checkedFetch(`${ROBOTOFF_API_URL}/insights/annotate`, {
    method: "POST",
    credentials: "include",
    body: new URLSearchParams(`insight_id=${insightId}&annotation=0`),
  });
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
