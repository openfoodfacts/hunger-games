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

export const countryNames = [
  "",
  "en:australia",
  "en:belgium",
  "en:canada",
  "en:croatia",
  "en:denmark",
  "en:france",
  "en:germany",
  "en:italy",
  "en:netherlands",
  "en:portugal",
  "en:spain",
  "en:sweden",
  "en:switzerland",
  "en:united-kingdom",
  "en:united-states",
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

const urlParams2Key: Record<string, string> = {};
Object.entries(key2urlParam).forEach(([key, value]) => {
  urlParams2Key[value] = key;
});

export { urlParams2Key };
