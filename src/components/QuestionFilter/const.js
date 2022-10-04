export const DEFAULT_FILTER_STATE = {
  insightType: "brand",
  brandFilter: "",
  countryFilter: "",
  sortByPopularity: true,
  valueTag: "",
};

export const countryNames = [
  "",
  "en:belgium",
  "en:denmark",
  "en:france",
  "en:germany",
  "en:italy",
  "en:netherlands",
  "en:portugal",
  "en:spain",
  "en:sweden",
  "en:switzerland",
  "en:united-states",
  "en:canada",
  "en:australia",
  "en:united-kingdom",
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
};

const urlParams2Key = {};
Object.entries(key2urlParam).forEach(([key, value]) => {
  urlParams2Key[value] = key;
});

export { urlParams2Key };
