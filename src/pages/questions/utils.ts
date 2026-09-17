import { NO_QUESTION_LEFT, OFF_DOMAIN, OFF_URL } from "../../const";
import offService from "../../off";
import type { Product } from "../../off";
import robotoff, { QuestionInterface } from "../../robotoff";
import { reformatValueTag } from "../../utils";
import { FilterState } from "../../robotoff";

type AdditionalInfoType = {
  i18nKey: string;
  translatedKey?: string;
  getLink?: (name: string) => string;
  editAnchor?: string;
};

export const ADDITIONAL_INFO_TRANSLATION: Record<string, AdditionalInfoType> = {
  brands: { i18nKey: "brands", editAnchor: "brands" },
  ingredientsText: { i18nKey: "ingredients", editAnchor: "ingredients" },
  countriesTags: {
    i18nKey: "countries",
    translatedKey: "translatedCountriesTags",
    editAnchor: "countries",
  },
  categories: {
    i18nKey: "categories",
    translatedKey: "translatedCategories",
    editAnchor: "categories",
    getLink: (name: string) =>
      `https://world.openfoodfacts.org/facets/categories/${name
        .toLowerCase()
        .replaceAll(" ", "-")}`,
  },
  labels_tags: {
    i18nKey: "labels",
    translatedKey: "translatedLabels_tags",
    editAnchor: "labels",
    getLink: (name: string) =>
      `https://world.openfoodfacts.org/facets/labels/${name
        .toLowerCase()
        .replaceAll(" ", "-")}`,
  },
  quantity: { i18nKey: "quantity", editAnchor: "quantity" },
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

export const getImagesUrls = (
  images: NonNullable<Product["images"]>,
  barcode: string,
) => {
  if (!images || !barcode) {
    return [];
  }
  const formattedCode = offService.getFormatedBarcode(barcode);
  const rootImageUrl = offService.getImageUrl(formattedCode);
  return Object.keys(images)
    .filter((key) => !isNaN(Number.parseInt(key)))
    .map((key) => {
      const image = images[key];
      return {
        imageUrl: `${rootImageUrl}/${key}.400.jpg`,
        imageUrlFull: `${rootImageUrl}/${key}.jpg`,
        uploaded_t:
          typeof image === "object" && image.uploaded_t !== undefined
            ? getUploadedTime(image.uploaded_t)
            : "Unknown",
      };
    });
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
