import { NutrimentPrediction } from "./insight.types";

function hasValue(v: Pick<NutrimentPrediction, "value" | "unit">) {
  return v && v.value !== null && v.value !== undefined && v.value !== "";
}
export function doesNotRemoveData({
  nutrimentId,
  values,
  nutriments,
  category,
}: {
  nutrimentId: string;
  values: Record<string, Pick<NutrimentPrediction, "value" | "unit">>;
  nutriments?: any;
  category: "serving" | "100g";
}) {
  if (nutriments === undefined) {
    return true;
  }
  if (hasValue(values[`${nutrimentId}_${category}`])) {
    // The form has value for this nutrient
    return true;
  }
  if (
    nutriments?.[`${nutrimentId}_serving`] == null &&
    nutriments?.[`${nutrimentId}_100g`] == null
  ) {
    // OFF does not have value for this nutrient.
    // We check 100g and serving, to avoid validating empty serving if 100g are defined.
    return true;
  }

  // Exceptions for sodium if we have value for the sodium or the inverse
  if (nutrimentId === "sodium" && hasValue(values[`salt_${category}`])) {
    return true; // no sodium, but salt
  }
  if (nutrimentId === "salt" && hasValue(values[`sodium_${category}`])) {
    return true; // no salt but sodium
  }
  return false;
}
