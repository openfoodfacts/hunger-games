import { getLang } from "./localeStorageManager";
import {
  OFF_DOMAIN,
  OFF_API_URL,
  OFF_API_URL_V2,
  OFF_API_URL_V3,
  OFF_IMAGE_URL,
  OFF_SEARCH,
  URL_ORIGINE,
} from "./const";
import axios from "axios";
import combineURLs from "axios/lib/helpers/combineURLs";

const BARCODE_REGEX = /(...)(...)(...)(.*)$/;

const offService = {
  getCookie(name) {
    const cookies = document.cookie
      .split(";")
      .filter((item) => item.trim().startsWith(`${name}=`));
    if (cookies.length) {
      const cookie = cookies[0];
      return cookie.split("=", 2)[1];
    }
    return "";
  },

  getUsername() {
    const sessionCookie = this.getCookie("session");

    if (!sessionCookie.length) {
      return "";
    }

    let isNext = false;
    let username = "";
    sessionCookie.split("&").forEach((el) => {
      if (el === "user_id") {
        isNext = true;
      } else if (isNext) {
        username = el;
        isNext = false;
      }
    });
    return username;
  },

  getFormatedBarcode: (barcode) => {
    const match = BARCODE_REGEX.exec(barcode);

    if (match !== null) {
      match.shift();
      return match.join("/");
    }

    return barcode;
  },

  getCategoriesTranslations({ categories }) {
    const lang = getLang();
    return axios.get(
      `${OFF_API_URL_V2}/taxonomy?tagtype=categories&lc=en%2C${lang}&cc=fr&fields=name,wikidata&tags=${categories.join(
        ",",
      )}`,
    );
  },

  getProduct(barcode) {
    const lang = getLang();

    return axios.get(
      `${OFF_API_URL}/product/${barcode}.json?fields=${[
        "product_name",
        "brands",
        "ingredients_text",
        "countries_tags",
        "countries_tags" + `_${lang}`,
        "images",
        "categories",
        "categories_tags",
        "categories_tags" + `_${lang}`,
        "labels_tags",
        "labels_tags" + `_${lang}`,
        "quantity",
      ].join(",")}`,
    );
  },

  getProductUrl(barcode) {
    const lang = getLang();
    return `https://world${
      lang === "en" ? "" : "-" + lang
    }.${OFF_DOMAIN}/product/${barcode}`;
  },

  getProductEditUrl(barcode) {
    const lang = getLang();
    return `https://world${
      lang === "en" ? "" : "-" + lang
    }.${OFF_DOMAIN}/cgi/product.pl?type=edit&code=${barcode}`;
  },
  getLogoCropsByBarcodeUrl(barcode) {
    return `${URL_ORIGINE}/logos/search?barcode=${barcode}`;
  },

  getImageUrl(imagePath) {
    return combineURLs(OFF_IMAGE_URL, imagePath);
  },

  getTableExtractionAI({ img, x0, y0, x1, y1 }) {
    return `https://off-nutri-test.azurewebsites.net/api/get-nutri-table?name=${img}%7C(${x0},${y0},${x1},${y1})`;
  },

  getNutritionToFillUrl({ page, country, creator, category, code = false }) {
    if (code) {
      return `${OFF_API_URL}/product/${code}.json?fields=code,states,lang,image_nutrition_url,product_name,nutriments,images,creator,countries`;
    }
    let creatorTagNumber = 2;
    let categoryTagNumber = 2;
    if (country) {
      creatorTagNumber += 1;
      categoryTagNumber += 1;
    }
    if (creator) {
      categoryTagNumber += 1;
    }

    return `${OFF_SEARCH}?json=true&${
      page ? `page=${page}&` : ""
    }fields=code,states,lang,image_nutrition_url,product_name,nutriments,images,creator,countries&action=process&sort_by=last_modified_t&tagtype_0=states&tag_contains_0=contains&tag_0=photos-validated&tagtype_1=states&tag_contains_1=contains&tag_1=nutrition-facts-to-be-completed${
      country
        ? `&tagtype_2=countries&tag_contains_2=contains&tag_2=${country}`
        : ""
    }${
      creator
        ? `&tagtype_${creatorTagNumber}=creator&tag_contains_${creatorTagNumber}=contains&tag_${creatorTagNumber}=${creator}`
        : ""
    }
      ${
        category
          ? `&tagtype_${categoryTagNumber}=categories&tag_contains_${categoryTagNumber}=contains&tag_${categoryTagNumber}=${category}`
          : ""
      }`;
  },

  searchProducts({
    page = 1,
    pageSize = 25,
    filters = [],
    countryCode = "world",
    fields = "code",
  }) {
    const searchParams = {
      page: page.toString(),
      page_size: pageSize.toString(),
      json: "true",
      action: "process",
      ...(fields === "all" ? {} : { fields }),
    };
    filters.forEach((filterItem, index) => {
      // Expected objects
      // const { tagtype, tag_contains, tag } = filterItem;

      Object.keys(filterItem).forEach((key) => {
        searchParams[`${key}_${index}`] = filterItem[key];
      });
    });

    const urlParams = new URLSearchParams(searchParams);
    return axios.get(
      `${OFF_SEARCH.replace("world", countryCode)}?${urlParams.toString()}`,
    );
  },

  setIngedrient(editionParams: { code: string; text: string; lang?: string }) {
    const { code, lang, text } = editionParams;
    if (!code) {
      console.error("setIngedrient: Missing code");
    }
    if (!text) {
      console.error("setIngedrient: Missing text");
    }

    return axios.patch(`${OFF_API_URL_V3}/product/${code}`, {
      product: { [`ingredients_text${lang ? `_${lang}` : ""}`]: text },
    });
  },

  async getIngedrientParsing(editionParams: { text: string; lang: string }) {
    const { lang, text } = editionParams;

    return await axios.patch(`${OFF_API_URL_V3}/product/test`, {
      fields: "ingredients",
      lc: lang,
      tags_lc: lang,
      product: {
        lang,
        [`ingredients_text_${lang}`]: text,
      },
    });
  },
};

export default offService;
