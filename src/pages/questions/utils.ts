import * as React from "react";

import { NO_QUESTION_LEFT, OFF_URL } from "../../const";
import { reformatValueTag } from "../../utils";
import externalApi from "../../externalApi";
import offService from "../../off";
import robotoff from "../../robotoff";
import { getQuestionSearchParams } from "../../components/QuestionFilter/useFilterSearch";

export const ADDITIONAL_INFO_TRANSLATION = {
  brands: "brands",
  ingredientsText: "ingredients",
  countriesTags: "countries",
  categories: "categories",
  labels_tags: "labels",
  quantity: "quantity",
};

// src looks like: "https://static.openfoodfacts.org/images/products/004/900/053/2258/1.jpg"
export const getImageId = (src) => {
  const file = src.split("/").at(-1);
  const imageId = file.replace(/\..+$/, "");
  return Number(imageId);
};

export const getImagesUrls = (images, barcode) => {
  if (!images || !barcode) {
    return [];
  }
  const formattedCode = offService.getFormatedBarcode(barcode);
  const rootImageUrl = offService.getImageUrl(formattedCode);
  return Object.keys(images)
    .filter((key) => !isNaN(Number.parseInt(key)))
    .map((key) => `${rootImageUrl}/${key}.jpg`);
};

// Other questions fetching
export const useOtherQuestions = (code, insight_id) => {
  const [otherQuestionsState, setOtherQuestionsState] = React.useState({
    questions: [],
    isLoading: true,
  });
  React.useEffect(() => {
    if (!code) {
      return;
    }
    let isStillValid = true;
    setOtherQuestionsState({
      questions: [],
      isLoading: true,
    });
    robotoff.questionsByProductCode(code).then((result) => {
      if (!isStillValid) {
        return;
      }
      const newQuestions = result?.data?.questions ?? [];
      setOtherQuestionsState({
        questions: newQuestions.filter((q) => q?.insight_id !== insight_id),
        isLoading: false,
      });
    });
    return () => {
      isStillValid = false;
    };
  }, [code, insight_id]);

  const [pendingAnswers, setPendingAnswers] = React.useState({});
  return [
    otherQuestionsState,
    setOtherQuestionsState,
    pendingAnswers,
    setPendingAnswers,
  ];
};

export const useFlagImage = (barcode) => {
  const [flagged, setFlagged] = React.useState([]);

  const flagImage = React.useCallback(
    (src) => {
      const imgid = getImageId(src);
      externalApi.addImageFlag({ barcode, imgid, url: src });
      setFlagged((prev) => [...prev, imgid]);
    },
    [barcode]
  );

  const deleteFlagImage = React.useCallback(
    (src) => {
      const imgid = getImageId(src);
      externalApi.removeImageFlag({ barcode, imgid });

      setFlagged((prev) =>
        prev.filter((flaggedImageId) => flaggedImageId !== imgid)
      );
    },
    [barcode]
  );

  // Reset flags
  React.useEffect(() => {
    setFlagged([]);
  }, [barcode]);

  return [flagged, flagImage, deleteFlagImage];
};

export const useProductData = (barcode) => {
  const [productData, setProductData] = React.useState({});

  // product data fetching
  React.useEffect(() => {
    if (!barcode) {
      return;
    }
    let isValid = true;
    setProductData({
      code: barcode,
      isLoading: true,
    });

    offService
      .getProduct(barcode)
      .then((result) => {
        if (!isValid) {
          return;
        }
        const product = result.data.product;
        setProductData({
          code: barcode,
          productName: product?.product_name || "",
          brands: product?.brands || "?",
          ingredientsText: product?.ingredients_text || "?",
          countriesTags: product?.countries_tags
            ? `${product?.countries_tags?.join?.(", ")}.`
            : "?",
          images: product?.images || {},
          categories: product?.categories || "?",
          labels_tags: product?.labels_tags?.join?.(", ") || "?",
          quantity: product?.quantity || "?",
          isLoading: false,
        });
      })
      .catch(() => {});
    return () => {
      isValid = false;
    };
  }, [barcode]);

  return productData;
};

export const getFullSizeImage = (src) => {
  if (!src) {
    return "https://static.openfoodfacts.org/images/image-placeholder.png";
  }
  const needsFull = /\/[a-z_]+.[0-9]*.400.jpg$/gm.test(src);

  if (needsFull) {
    return src.replace("400.jpg", "full.jpg");
  }
  return src.replace("400.jpg", "jpg");
};

export const getValueTagQuestionsURL = (filterState, question) => {
  if (
    question !== null &&
    question &&
    question?.insight_id !== NO_QUESTION_LEFT &&
    question?.value_tag
  ) {
    const urlParams = new URLSearchParams();
    urlParams.append("type", question.insight_type);
    urlParams.append("value_tag", reformatValueTag(question?.value_tag));
    return `/questions?${getQuestionSearchParams({
      ...filterState,
      insightType: question.insight_type,
      valueTag: question?.value_tag,
    })}`;
  }
  return null;
};

export const getValueTagExamplesURL = (question) => {
  if (
    question !== null &&
    question?.insight_id !== NO_QUESTION_LEFT &&
    question?.value_tag &&
    question.insight_type
  ) {
    return `${OFF_URL}/${question.insight_type}/${reformatValueTag(
      question?.value_tag
    )}`;
  }
  return "";
};

export const getNbOfQuestionForValue = async (filterState) => {
  const { data: dataFetched } = await robotoff.questions(filterState, 1);
  return dataFetched.count;
};
