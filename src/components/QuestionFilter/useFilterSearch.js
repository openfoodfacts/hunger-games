import { key2urlParam } from "./const";
import { convertObjectParamsToUrlParams } from "../../hooks/useUrlParams";

const convertParamsToUrl = (params) => {
  const rep = {};
  Object.keys(params).forEach((key) => {
    rep[key2urlParam[key]] = params[key];
  });
  return rep;
};

export const getQuestionSearchParams = (params) =>
  convertObjectParamsToUrlParams(convertParamsToUrl(params));
