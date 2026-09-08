export type FilterState = {
  insightType: string;
  brandFilter: string;
  countryFilter: string;
  sortByPopularity: boolean;
  valueTag: string;
  campaign: string;
};

export const DEFAULT_FILTER_STATE: FilterState = {
  insightType: "brand",
  brandFilter: "",
  countryFilter: "",
  sortByPopularity: true,
  valueTag: "",
  campaign: "",
};

export const campagnes = ["agribalyse-category"];

// Drives both the FilterDialog dropdown and the chip-display check in
// QuestionFilter. `labelKey` resolves under the i18n namespace
// `questions.filters.predictor.<labelKey>`.
export const predictors = [
  { value: "ridge_model-ml", labelKey: "ridge_model_ml" },
  { value: "neural", labelKey: "neural" },
  { value: "matcher", labelKey: "matcher" },
  { value: "google-could-vision", labelKey: "google_cloud_vision" },
  { value: "regex", labelKey: "regex" },
  { value: "flashtext", labelKey: "flashtext" },
  { value: "nutriscore", labelKey: "nutriscore" },
  { value: "universal-logo-detector", labelKey: "universal_logo_detector" },
  { value: "ocr", labelKey: "ocr" },
];

export const insightTypesNames = {
  label: "label",
  category: "category",
  brand: "brand",
  product_weight: "product_weight",
  packaging: "packaging",
};

export const key2urlParam = {
  valueTag: "value_tag",
  brandFilter: "brand",
  countryFilter: "country",
  insightType: "type",
  sortByPopularity: "sorted",
  campaign: "campaign",
};
