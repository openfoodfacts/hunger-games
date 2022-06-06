import { getURLParam } from "../../utils";

const randomInsightTypeChoices = ["label", "category", "brand"];

const getRandomInsightType = () =>
  randomInsightTypeChoices[
    Math.floor(randomInsightTypeChoices.length * Math.random())
  ];

const getInitialInsightType = () => {
  const urlParamValue = getURLParam("type");

  if (urlParamValue.length) {
    return urlParamValue;
  }

  return getRandomInsightType();
};

export const getInitialFilterValues = () => {
  return {
    valueTag: getURLParam("value_tag"),
    brandFilter: getURLParam("brand"),
    countryFilter: getURLParam("country"),
    selectedInsightType: getInitialInsightType(),
    sortByPopularity: !!getURLParam("sorted"),
  };
};
