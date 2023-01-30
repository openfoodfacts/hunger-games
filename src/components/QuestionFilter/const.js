export const DEFAULT_FILTER_STATE = {
  insightType: "brand",
  brandFilter: "",
  countryFilter: "",
  sortByPopularity: true,
  valueTag: "",
  campaign: "",
};

export const campagnes = ["agribalyse-category"];

export const countryNames = [
  "",
  "en:Belgium",
  "en:Denmark",
  "en:France",
  "en:Germany",
  "en:Italy",
  "en:Netherlands",
  "en:Portugal",
  "en:Spain",
  "en:Sweden",
  "en:Switzerland",
  "en:United-states",
  "en:Canada",
  "en:Australia",
  "en:United-kingdom",
];

export const insightTypesNames = {
  label: "label",
  category: "category",
  brand: "brand",
  product_weight: "product_weight",
};

export const key2urlParam = {
  valueTag: "value_tag",
  brandFilter: "brand",
  countryFilter: "country",
  insightType: "type",
  sortByPopularity: "sorted",
  campaign: "campaign",
};

const urlParams2Key = {};
Object.entries(key2urlParam).forEach(([key, value]) => {
  urlParams2Key[value] = key;
});

export { urlParams2Key };
