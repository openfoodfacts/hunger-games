import axios from "axios";
import { ROBOTOFF_API_URL, IS_DEVELOPMENT_MODE } from "./const";
import { getLang } from "./localeStorageManager";
import { reformatValueTag, removeEmptyKeys } from "./utils";

export interface QuestionInterface {
  barcode: string;
  insight_id: string;
  insight_type: string;
  question: string;
  source_image_url?: string;
  type: string;
  value: string;
  value_tag: string;
}

type GetQuestionsResponse = { count: number; questions: QuestionInterface[] };

const robotoff = {
  annotate(insightId: string, annotation) {
    if (IS_DEVELOPMENT_MODE) {
      console.log(
        `Annotated, ${ROBOTOFF_API_URL}/insights/annotate`,
        new URLSearchParams(
          `insight_id=${insightId}&annotation=${annotation}&update=1`
        ),
        { withCredentials: true }
      );
    } else {
      return axios.post(
        `${ROBOTOFF_API_URL}/insights/annotate`,
        new URLSearchParams(
          `insight_id=${insightId}&annotation=${annotation}&update=1`
        ),
        { withCredentials: true }
      );
    }
  },

  questionsByProductCode(code: string) {
    return axios
      .get<GetQuestionsResponse>(`${ROBOTOFF_API_URL}/questions/${code}`)
      .then((result) => {
        let questions = result.data.questions;
        result.data.questions = questions.filter(
          (question) => question.source_image_url
        );
        return result;
      });
  },

  questions(filterState, count = 10, page = 1) {
    const {
      insightType,
      brandFilter,
      valueTag,
      countryFilter,
      sortByPopularity,
      campaign,
      predictor,
    } = filterState;

    const searchParams = {
      insight_types: insightType,
      value_tag: valueTag,
      brands: reformatValueTag(brandFilter),
      country: countryFilter !== "en:world" ? countryFilter : null,
      campaign,
      predictor,
    };

    const lang = getLang();

    return axios.get<GetQuestionsResponse>(
      `${ROBOTOFF_API_URL}/questions/${
        sortByPopularity ? "popular" : "random"
      }`,
      {
        params: removeEmptyKeys({
          ...searchParams,
          lang,
          count,
          page,
        }),
      }
    );
  },

  insightDetail(insight_id) {
    return axios.get(`${ROBOTOFF_API_URL}/insights/detail/${insight_id}`);
  },

  loadLogo(logoId) {
    return axios.get(`${ROBOTOFF_API_URL}/images/logos/${logoId}`);
  },

  updateLogo(logoId, value, type) {
    return axios.put(
      `${ROBOTOFF_API_URL}/images/logos/${logoId}`,
      removeEmptyKeys({
        value,
        type,
      }),
      { withCredentials: true }
    );
  },

  searchLogos(barcode, value, type, count = 25, random = false) {
    const formattedValue = ["label", "category"].includes(type)
      ? { taxonomy_value: value }
      : { value };

    return axios.get(`${ROBOTOFF_API_URL}/images/logos/search/`, {
      params: removeEmptyKeys({
        barcode,
        type,
        count,
        random,
        ...formattedValue,
      }),
    });
  },

  getLogoAnnotations(logoId, index, count = 25) {
    const url =
      logoId.length > 0
        ? `${ROBOTOFF_API_URL}/ann/search/${logoId}`
        : `${ROBOTOFF_API_URL}/ann/search`;
    return axios.get(url, {
      params: removeEmptyKeys({
        index,
        count,
      }),
    });
  },

  annotateLogos(annotations) {
    return axios.post(
      `${ROBOTOFF_API_URL}/images/logos/annotate`,
      removeEmptyKeys({
        annotations,
      }),
      { withCredentials: true }
    );
  },

  getInsights(
    barcode = "",
    insightType = "",
    valueTag = "",
    annotation = "",
    page = 1,
    count = 25
  ) {
    let annotated;
    if (annotation.length && annotation === "not_annotated") {
      annotated = "0";
      annotation = "";
    }
    return axios.get(`${ROBOTOFF_API_URL}/insights`, {
      params: removeEmptyKeys({
        barcode,
        insight_types: insightType,
        value_tag: valueTag,
        annotation,
        page,
        annotated,
        count,
      }),
    });
  },

  getUserStatistics(username) {
    return axios.get(`${ROBOTOFF_API_URL}/users/statistics/${username}`);
  },

  getCroppedImageUrl(imageUrl, boundingBox) {
    const [y_min, x_min, y_max, x_max] = boundingBox;
    return `${ROBOTOFF_API_URL}/images/crop?image_url=${imageUrl}&y_min=${y_min}&x_min=${x_min}&y_max=${y_max}&x_max=${x_max}`;
  },

  getLogosImages(logoIds) {
    return axios.get(
      `${ROBOTOFF_API_URL}/images/logos?logo_ids=${logoIds.join(",")}`
    );
  },

  getNutritionValueFromImage(language, imageOcrUrl, images) {
    var ocrUrlSubString = imageOcrUrl.split("/");

    // setting a default value, assuming length of ocrUrlSubString is 7,
    // and product code is 8 characters long
    var productCodeForOcrUrl = ocrUrlSubString[5];

    let nutritionKeyWithLangSuffix = `nutrition_${language}`;

    for (var key in images) {
      if (nutritionKeyWithLangSuffix === key) {
        var imgid = images[nutritionKeyWithLangSuffix].imgid;
      }
    }

    if (ocrUrlSubString.length > 7) {
      // the productCode is 13 characters long
      productCodeForOcrUrl =
        ocrUrlSubString[5] +
        "/" +
        ocrUrlSubString[6] +
        "/" +
        ocrUrlSubString[7] +
        "/" +
        ocrUrlSubString[8];
    }

    return axios.get(
      `${ROBOTOFF_API_URL}/predict/nutrient?ocr_url=https://images.openfoodfacts.org/images/products/${productCodeForOcrUrl}/${imgid}.json`
    );
  },

  getUnansweredValues(params: {
    type: "label" | "brand" | "category";
    country;
    campaign;
    page?: number;
    count?: number;
  }) {
    let page = params.page ?? 1;
    page = page >= 1 ? page : 1;

    return axios.get(
      `${ROBOTOFF_API_URL}/questions/unanswered/?${Object.keys({
        ...params,
        page,
      })
        .filter((key) => params[key] !== undefined)
        .map((key) => `${key}=${params[key]}`)
        .join("&")}`
    );
  },
};

export default robotoff;
