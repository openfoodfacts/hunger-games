import * as React from "react";
import off from "../../off";
import { ROBOTOFF_API_URL } from "../../const";

import { Product } from "@openfoodfacts/openfoodfacts-nodejs";

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

const getImageUrl = (
  base: string,
  id: string,
  resolution: "100" | "400" | "full",
) => {
  return `${base}${id}${resolution === "full" ? "" : `.${resolution}`}.jpg`;
};

const getIngredientExtractionUrl = (base: string, id: string) => {
  return `${ROBOTOFF_API_URL}/predict/ingredient_list?ocr_url=${base}${id}.json`;
};

// TODO: Replace this type with OFF-SDK types
type ProductStub = {
  code: Product["code"];
  lang: Product["lang"];
  image_ingredients_url: string;
  product_name: string;
  ingredient: unknown;
  images: Record<
    string,
    {
      uploader?: string;
      uploaded_t?: number;
      geometry: string;
      imgid: string;
      sizes: { full: { w: string; h: string } };
      x1?: number;
      x2?: number;
      y1?: number;
      y2?: number;
    }
  >;
  scans_n: unknown;
  [x: string]: unknown;
};

// TODO: Replace this type with OFF-SDK types
type FormattedProductStub = {
  code: Product["code"];
  lang: Product["lang"];
  image_ingredients_url: string;
  product_name: string;
  ingredient: unknown;
  scans_n: unknown;

  selectedImages: {
    imgId: string;
    countryCode: string;
    imageUrl: string;
    fetchDataUrl: string;
    uploaded_t: number | undefined;
    uploader: string | undefined;
    x: number;
    y: number;
    w: number;
    h: number;
    x1: number | undefined;
    x2: number | undefined;
    y1: number | undefined;
    y2: number | undefined;
    geometry: string;
  }[];
  [key: string]: unknown;
};

const formatData = ({
  code,
  lang,
  image_ingredients_url,
  product_name,
  ingredient,
  images,
  scans_n,
  ...other
}: ProductStub): FormattedProductStub => {
  const baseImageUrl = image_ingredients_url.replace(/ingredients.*/, "");

  const selectedImages = Object.keys(images)
    .filter((key) => key.startsWith("ingredients"))
    .map((key) => {
      const imageData = images[key];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const ingredientTexts = Object.fromEntries(
    Object.entries(other).filter(([key]) => key.startsWith("ingredient")),
  );

  return {
    code,
    lang,
    selectedImages,
    image_ingredients_url,
    product_name,
    ingredient,
    scans_n,
    ...ingredientTexts,
    // images,
  };
};

export default function useData(
  countryCode: string,
): [FormattedProductStub[], () => void, boolean] {
  const prevCountry = React.useRef(countryCode);
  const seenCodes = React.useRef(new Set<string>());

  const [data, setData] = React.useState<FormattedProductStub[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState(() => {
    return 0;
    // Seems that API fails for large page number
    //return new Date().getMilliseconds() % 50;
  });

  React.useEffect(() => {
    let isValid = true;

    const load = async () => {
      setIsLoading(true);

      try {
        const {
          data: { products },
        } = (await off.searchProducts({
          page,
          pageSize: 25,
          filters: imagesToRead,
          fields: "all",
          countryCode: countryCode || "world",
        })) as { data: { products: ProductStub[] } };

        if (isValid) {
          const rep = products
            .filter((p) => {
              const isNew = !seenCodes.current.has(p.code); // prevent from adding products already seen
              if (isNew) {
                seenCodes.current.add(p.code);
              }

              return isNew;
            })
            .map(formatData);

          if (prevCountry.current !== countryCode) {
            setData(rep);
            prevCountry.current = countryCode;
          } else {
            setData((prev) => [...prev, ...rep]);
          }
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
  }, [page, countryCode]);

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
