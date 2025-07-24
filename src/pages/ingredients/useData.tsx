import * as React from "react";
import off from "../../off";
import { ROBOTOFF_API_URL } from "../../const";
import robotoff from "../../robotoff";

const imagesToRead = [
  {
    tagtype: "states",
    tag_contains: "contains",
    tag: "en:ingredients-to-be-completed",
  },
  {
    tagtype: "states",
    tag_contains: "contains",
    tag: "en:ingredients-photo-selected",
  },
];

const getImageUrl = (base, id, resolution: "100" | "400" | "full") => {
  return `${base}${id}${resolution === "full" ? "" : `.${resolution}`}.jpg`;
};

const getIngredientExtractionUrl = (base, id) => {
  return `${ROBOTOFF_API_URL}/predict/ingredient_list?ocr_url=${base}${id}.json`;
};

const formatData = (product) => {
  const {
    code,
    lang,
    image_ingredients_url,
    product_name,
    ingredient,
    images,
    scans_n,
    ...other
  } = product;

  const baseImageUrl = image_ingredients_url.replace(/ingredients.*/, "");

  const selectedImages = Object.keys(images)
    .filter((key) => key.startsWith("ingredients"))
    .map((key) => {
      const imageData = images[key];
      const [_, x, y] = images[key].geometry.split("-");

      const countryCode = key.startsWith("ingredients_")
        ? key.slice("ingredients_".length)
        : "";

      const { uploaded_t, uploader } = images[imageData.imgid];
      return {
        imgId: imageData.imgid,
        countryCode,
        imageUrl: getImageUrl(baseImageUrl, imageData.imgid, "full"),
        fetchDataUrl: getIngredientExtractionUrl(
          baseImageUrl.replace("images.", "static."),
          imageData.imgid,
        ),
        uploaded_t,
        uploader,
        x: Number.parseFloat(x),
        y: Number.parseFloat(y),
        w: Number.parseFloat(imageData.sizes.full.w),
        h: Number.parseFloat(imageData.sizes.full.h),
        x1: images[key].x1,
        x2: images[key].x2,
        y1: images[key].y1,
        y2: images[key].y2,
        geometry: images[key].geometry,
      };
    });
  const ingredientTexts = {};
  Object.entries(other).forEach(([key, value]) => {
    if (key.startsWith("ingredient")) {
      ingredientTexts[key] = value;
    }
  });
  return {
    code,
    lang,
    selectedImages,
    image_ingredients_url,
    product_name,
    ingredient,
    scans_n,
    ...ingredientTexts,
  };
};

async function fetchIngredientDetectionInsights({
  page = 1,
  count = 25,
  countryCode = "",
}) {
  try {
    const { data } = await robotoff.getInsights(
      "",
      "ingredient_detection",
      "",
      "not_annotated",
      page,
      count,
      "",
      countryCode,
    );
    return data.insights || [];
  } catch (error) {
    console.error("Failed to fetch ingredient_detection insights", error);
    return [];
  }
}

export default function useData(countryCode): [any[], () => void, boolean] {
  const [data, setData] = React.useState([]);
  const prevCountry = React.useRef(countryCode);
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState(() => {
    return 1;
  });
  const seenCodes = React.useRef([]);

  React.useEffect(() => {
    let isValid = true;

    const load = async () => {
      setIsLoading(true);

      const insights = await fetchIngredientDetectionInsights({
        page,
        count: 25,
        countryCode: countryCode || "",
      });
      if (isValid) {
        setData(insights);
        setIsLoading(false);
      }
    };

    load();
    return () => {
      isValid = false;
    };
  }, [page, countryCode]);

  const removeHead = React.useCallback(() => {
    setData((prev) => [...prev.slice(1)]);
  }, []);

  React.useEffect(() => {
    if (data.length < 5 && !isLoading) {
      setPage((p) => p + 1);
    }
  }, [data, isLoading]);

  return [data, removeHead, isLoading];
}
