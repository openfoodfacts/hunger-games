import axios from "axios";
import { Robotoff } from "@openfoodfacts/openfoodfacts-nodejs";

import { ROBOTOFF_API_URL } from "./const";
import { getLang } from "./localeStorageManager";
import { reformatValueTag, removeEmptyKeys } from "./utils";

export interface QuestionInterface {
  barcode: string;
  insight_id: string;
  insight_type: string;
  question: string;
  source_image_url?: string;
  ref_image_url?: string;
  type: string;
  value: string;
  value_tag: string;
}

export type FilterState = {
  insightType?: string;
  brandFilter?: string;
  country?: string;
  brand?: string;
  valueTag?: string;
  countryFilter?: string;
  sortByPopularity?: boolean;
  campaign?: string;
  predictor?: string;
  with_image?: boolean;
  sorted?: string;
};

type GetQuestionsResponse = { count: number; questions: QuestionInterface[] };

const robotoffClient = new Robotoff(
  (input, init) => fetch(input, { ...init, credentials: "include" }),
  { baseUrl: ROBOTOFF_API_URL },
);

const robotoff = {
  annotate(insightId: string, annotation: -1 | 0 | 1) {
    return robotoffClient.annotate({
      insight_id: insightId,
      annotation: annotation,
      update: 1,
    });
  },

  async questionsByProductCode(code: string) {
    const result = await robotoffClient.questionsByProductCode(Number(code));
    return {
      ...result,
      data: {
        ...result.data,
        // Filter out questions without image
        questions:
          (result.data?.questions as unknown as QuestionInterface[])?.filter(
            (q) => q.source_image_url,
          ) ?? [],
      },
    };
  },

  insightDetail(insight_id: string) {
    return robotoffClient.insightDetail(insight_id);
  },

  loadLogo(logoId: string) {
    return robotoffClient.loadLogo(logoId);
  },

  searchLogos(
    barcode: string,
    value: string,
    type: string,
    count = 25,
    random = false,
  ) {
    const formattedValue = /^[a-z][a-z]:/.test(value)
      ? { taxonomy_value: value }
      : { value };

    return robotoffClient.searchLogos(
      removeEmptyKeys({
        barcode,
        type,
        count,
        random,
        ...formattedValue,
      }),
    );
  },

  annotateLogos(annotations: Parameters<Robotoff["annotateLogos"]>[0]) {
    return robotoffClient.annotateLogos(annotations);
  },

  getLogoAnnotations(logoId: string, index: number, count = 25) {
    return robotoffClient.getLogoAnnotations(
      logoId.length > 0 ? Number(logoId) : undefined,
      index,
      count,
    );
  },

  getInsights(
    barcode = "",
    insightType = "",
    valueTag = "",
    annotation = "",
    page = 1,
    count = 25,
    campaigns = "",
    country = "",
  ) {
    let annotated: string | undefined;
    if (annotation.length && annotation === "not_annotated") {
      annotated = "0";
      annotation = "";
    }
    return robotoffClient.insights(
      removeEmptyKeys({
        barcode: barcode ? Number(barcode) : undefined,
        insight_types: insightType,
        value_tag: valueTag,
        annotation: annotation ? Number(annotation) : undefined,
        page,
        annotated: annotated ? Boolean(Number(annotated)) : undefined,
        count,
        campaigns,
        countries: country,
      }) as Parameters<Robotoff["insights"]>[0],
    );
  },

  questions(
    {
      insightType,
      brandFilter,
      valueTag,
      countryFilter,
      sortByPopularity,
      campaign,
      predictor,
      with_image,
    }: FilterState,
    count = 10,
    page = 1,
  ) {
    const searchParams = {
      insight_types: insightType,
      value_tag: valueTag,
      brands: reformatValueTag(brandFilter),
      countries: countryFilter,
      campaign,
      predictor,
      with_image,
      order_by: sortByPopularity ? "popularity" : "random",
    };

    const lang = getLang();

    return axios.get<GetQuestionsResponse>(`${ROBOTOFF_API_URL}/questions/`, {
      params: removeEmptyKeys({ ...searchParams, lang, count, page }),
    });
  },

  updateLogo(logoId: string, value: string, type: string) {
    return axios.put(
      `${ROBOTOFF_API_URL}/images/logos/${logoId}`,
      removeEmptyKeys({ value, type }),
      { withCredentials: true },
    );
  },

  getUserStatistics(username: string) {
    return axios.get(`${ROBOTOFF_API_URL}/users/statistics/${username}`);
  },

  getCroppedImageUrl(
    imageUrl: string,
    boundingBox: [number, number, number, number],
  ) {
    const [y_min, x_min, y_max, x_max] = boundingBox;

    const params = new URLSearchParams({
      image_url: imageUrl,
      y_min: y_min.toString(),
      x_min: x_min.toString(),
      y_max: y_max.toString(),
      x_max: x_max.toString(),
    });

    return `${ROBOTOFF_API_URL}/images/crop?${params.toString()}`;
  },

  getLogosImages(logoIds: string[]) {
    const params = new URLSearchParams();
    logoIds.forEach((id) => params.append("logo_ids", id));

    return axios.get(`${ROBOTOFF_API_URL}/images/logos?${params.toString()}`);
  },

  getUnansweredValues({
    page = 1,
    countryCode,
    ...other
  }: {
    type: "label" | "brand" | "category";
    countryCode: string;
    campaign: string;
    page?: number;
    count?: number;
  }) {
    return axios.get(
      `${ROBOTOFF_API_URL}/questions/unanswered/?${Object.entries(
        removeEmptyKeys({
          ...other,
          countries: countryCode,
          page: page >= 1 ? page : 1,
        }),
      )
        .map(([key, value]) => `${key}=${value}`)
        .join("&")}`,
    );
  },
};

export default robotoff;
