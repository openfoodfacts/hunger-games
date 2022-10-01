import axios from "axios";
import { ROBOTOFF_API_URL, IS_DEVELOPMENT_MODE } from "./const";
import { getLang } from "./localeStorageManager";
import { removeEmptyKeys } from "./utils";

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

  questions(sortBy, insightTypes, valueTag, brands, country, count = 10, page) {
    const lang = getLang();

    return axios.get<GetQuestionsResponse>(
      `${ROBOTOFF_API_URL}/questions/${sortBy}`,
      {
        params: removeEmptyKeys({
          count,
          lang,
          insight_types: insightTypes,
          value_tag: valueTag,
          brands,
          country,
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
        withCredentials: true,
        value,
        type,
      })
    );
  },

  searchLogos(barcode, value, type, count = 25) {
    return axios.get(`${ROBOTOFF_API_URL}/images/logos`, {
      params: removeEmptyKeys({
        annotated: 1,
        barcode,
        value,
        type,
        count,
      }),
    });
  },

  getLogoAnnotations(logoId, index, count = 25) {
    const url =
      logoId.length > 0
        ? `${ROBOTOFF_API_URL}/ann/${logoId}`
        : `${ROBOTOFF_API_URL}/ann`;
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
        withCredentials: true,
        annotations,
      })
    );
  },

  getInsights(
    barcode = "",
    insightTypes = "",
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
        insight_types: insightTypes,
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
    page?: number;
  }) {
    const type = params.type;
    let page = params.page ?? 1;
    page = page >= 1 ? page : 1;

    return axios.get(
      `${ROBOTOFF_API_URL}/questions/unanswered/?type=${type}&page=${page}`
    );
  },
};

export default robotoff;
