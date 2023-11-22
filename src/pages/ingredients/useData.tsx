import * as React from "react";
import off from "../../off";

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
  return `https://robotoff.openfoodfacts.org/api/v1/predict/ingredient_list?ocr_url=${base}${id}.json`;
};

const formatData = (product) => {
  const {
    code,
    lang,
    image_ingredients_url,
    product_name,
    ingredient,
    images,
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

      return {
        imgId: imageData.imgid,
        countryCode,
        imageUrl: getImageUrl(baseImageUrl, imageData.imgid, "400"),
        fetchDataUrl: getIngredientExtractionUrl(baseImageUrl, imageData.imgid),
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

  return {
    code,
    lang,
    selectedImages,
    image_ingredients_url,
    product_name,
    ingredient,
    // images,
  };
};

export default function useData(): [any[], () => void, boolean] {
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState(() => {
    return 0;
    // Seems that API fails for large page number
    //return new Date().getMilliseconds() % 50;
  });
  const seenCodes = React.useRef([]);

  React.useEffect(() => {
    let isValid = true;

    const load = async () => {
      setIsLoading(true);

      try {
        const {
          data: { count, products },
        } = await off.searchProducts({
          page,
          pageSize: 25,
          filters: imagesToRead,
          fields:
            "code,lang,image_ingredients_url,product_name,ingredient,images",
        });
        if (isValid) {
          const rep = products
            .filter((p) => {
              const isNew = !seenCodes.current[p.code]; // prevent from adding products already seen
              if (isNew) {
                seenCodes.current[p.code] = true;
              }

              return isNew;
            })
            .map(formatData);
          setData((prev) => [...prev, ...rep]);
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    };

    load();
    return () => {
      isValid = false;
    };
  }, [page]);

  const removeHead = React.useCallback(() => {
    setData((prev) => [...prev.slice(1)]);
  }, []);

  React.useEffect(() => {
    // This is dummy but will be ok for a PoC
    if (data.length < 5 && !isLoading) {
      setPage((p) => p + 1);
    }
  }, [data, isLoading]);

  return [data, removeHead, isLoading];
}
