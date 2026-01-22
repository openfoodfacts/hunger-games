  import axios from "axios";

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

  const robotoff = {
  annotate(insightId: string, annotation: -1 | 0 | 1) {
    // Use URLSearchParams with an object for cleaner, safer code
    const body = new URLSearchParams({
      insight_id: insightId,
      annotation: annotation.toString(),
      update: '1'
    });

    return axios.post(
      `${ROBOTOFF_API_URL}/insights/annotate`,
      body,
      { withCredentials: true },
    );
  },
    async questionsByProductCode(code: string) {
      const result = await axios.get<GetQuestionsResponse>(
        `${ROBOTOFF_API_URL}/questions/${code}`,
      );

      return {
        ...result,
        data: {
          ...result.data,
          // Filter out questions without image
          questions: result.data.questions.filter((q) => q.source_image_url),
        },
      };
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
        //used the safe values here for count & page
        params: removeEmptyKeys({
          ...searchParams,
          lang,
          count,
          page,
        }),
      });
    },

    insightDetail(insight_id: string) {
      return axios.get(`${ROBOTOFF_API_URL}/insights/detail/${insight_id}`);
    },

    loadLogo(logoId: string) {
      return axios.get(`${ROBOTOFF_API_URL}/images/logos/${logoId}`);
    },

    updateLogo(logoId: string, value: string, type: string) {
      return axios.put(
        `${ROBOTOFF_API_URL}/images/logos/${logoId}`,
        removeEmptyKeys({ value, type }),
        { withCredentials: true },
      );
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

    getLogoAnnotations(logoId: string, index: number, count = 25) {
      let url = `${ROBOTOFF_API_URL}/ann/search`;
      if (logoId.length > 0) {
        url += `/${logoId}`;
      }

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
        removeEmptyKeys({ annotations }),
        { withCredentials: true },
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
          campaigns,
          countries: country,
        }),
      });
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
