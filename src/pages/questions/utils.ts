import * as React from "react";

import { NO_QUESTION_LEFT, OFF_DOMAIN, OFF_URL } from "../../const";
import externalApi from "../../externalApi";
import offService from "../../off";
import robotoff, { QuestionInterface } from "../../robotoff";
import { reformatValueTag } from "../../utils";
import { FilterState } from "../../robotoff";

export const ADDITIONAL_INFO_TRANSLATION = {
  brands: { i18nKey: "brands" },
  ingredientsText: { i18nKey: "ingredients" },
  countriesTags: {
    i18nKey: "countries",
    translatedKey: "translatedCountriesTags",
  },
  categories: {
    i18nKey: "categories",
    translatedKey: "translatedCategories",
    getLink: (name: string) =>
      `https://world.openfoodfacts.org/category/${name
        .toLowerCase()
        .replaceAll(" ", "-")}`,
  },
  labels_tags: {
    i18nKey: "labels",
    translatedKey: "translatedLabels_tags",
    getLink: (name: string) =>
      `https://world.openfoodfacts.org/label/${name
        .toLowerCase()
        .replaceAll(" ", "-")}`,
  },
  quantity: { i18nKey: "quantity" },
};

// src looks like: "https://images.openfoodfacts.org/images/products/004/900/053/2258/1.jpg"
export const getImageId = (src: string) => {
  const file = src.split("/").at(-1)!;
  const imageId = file.replace(/\..+$/, "");
  return Number(imageId);
};

const getUploadedTime = (data: number) =>
  new Date(data * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const getImagesUrls = (images: Record<string, { uploaded_t: number }>, barcode: string) => {
  if (!images || !barcode) {
    return [];
  }
  const formattedCode = offService.getFormatedBarcode(barcode);
  const rootImageUrl = offService.getImageUrl(formattedCode);
  return Object.keys(images)
    .filter((key) => !isNaN(Number.parseInt(key)))
    .map((key) => ({
      imageUrl: `${rootImageUrl}/${key}.400.jpg`,
      imageUrlFull: `${rootImageUrl}/${key}.jpg`,
      uploaded_t: getUploadedTime(images[key].uploaded_t),
    }));
};

export const getFullSizeImage = (src?: string) => {
  if (!src) {
    return `https://images.${OFF_DOMAIN}/images/image-placeholder.png`;
  }
  const needsFull = /\/[a-z_]+.[0-9]*.400.jpg$/gm.test(src);

  if (needsFull) {
    return src.replace("400.jpg", "full.jpg");
  }
  return src.replace("400.jpg", "jpg");
};

export const getValueTagExamplesURL = (question: QuestionInterface | null) => {
  if (
    question !== null &&
    question?.insight_id !== NO_QUESTION_LEFT &&
    question?.value_tag &&
    question.insight_type
  ) {
    return `${OFF_URL}/${question.insight_type}/${reformatValueTag(
      question?.value_tag,
    )}`;
  }
  return "";
};

export const getNbOfQuestionForValue = async (filterState: FilterState) => {
  const { data: dataFetched } = await robotoff.questions(filterState, 1);
  return dataFetched.count;
};
