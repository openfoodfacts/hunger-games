import * as React from "react";
import off from "../../off";
import { ROBOTOFF_API_URL } from "../../const";

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

type IngredientImage = {
  imgid: string;
  geometry: string;
  sizes: {
    full: { w: string; h: string };
  };
  x1?: number;
  x2?: number;
  y1?: number;
  y2?: number;
};

type ImagesMap = Record<string, IngredientImage>;

type Product = {
  code: string;
  lang: string;
  image_ingredients_url: string;
  product_name: string;
  ingredient?: string;
  images: ImagesMap;
  scans_n?: number;
  [x: string]: unknown;
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
}: Product) => {
  const baseImageUrl = image_ingredients_url.replace(/ingredients.*/, "");

  const selectedImages = Object.keys(images ?? {})
    .filter((key) => key.startsWith("ingredients"))
    .map((key) => {
          const imageData = images[key];
      const [, x, y] = typeof imageData.geometry === 'string' ? imageData.geometry.split("-") : [undefined, undefined, undefined];

      const countryCode = key.startsWith("ingredients_")
        ? key.slice("ingredients_".length)
        : "";

      // Defensive: images[imageData.imgid] may not exist
      const uploadedInfo = imageData.imgid && images[imageData.imgid] ? images[imageData.imgid] : {};
      const { uploaded_t, uploader } = uploadedInfo;
      return {
        imgId: imageData.imgid,
        countryCode,
        imageUrl: getImageUrl(baseImageUrl, imageData.imgid, "full"),
        fetchDataUrl: getIngredientExtractionUrl(
          baseImageUrl.replace("images.", "static."),
          imageData.imgid,
        ),
        x: x ? Number.parseFloat(x) : undefined,
        y: y ? Number.parseFloat(y) : undefined,
        w: imageData.sizes?.full?.w ? Number.parseFloat(imageData.sizes.full.w) : undefined,
        h: imageData.sizes?.full?.h ? Number.parseFloat(imageData.sizes.full.h) : undefined,
        x1: imageData.x1,
        x2: imageData.x2,
        y1: imageData.y1,
        y2: imageData.y2,
        geometry: imageData.geometry,
        uploaded_t: typeof uploaded_t === "number" ? uploaded_t : undefined,
        uploader: typeof uploader === "string" ? uploader : undefined
      };
    });
  const ingredientTexts: Record<string, unknown> = {};
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
    // images,
  };
};

type FormattedData = ReturnType<typeof formatData>;

export default function useData(countryCode: string): [FormattedData[], () => void, boolean] {
  const [data, setData] = React.useState<FormattedData[]>([]);
  const prevCountry = React.useRef(countryCode);
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState<number>(() => {
    return 0;
    // Seems that API fails for large page number
    //return new Date().getMilliseconds() % 50;
  });
  const seenCodes = React.useRef<Record<string, boolean>>({});

  React.useEffect(() => {
    let isValid = true;


    const load = async () => {
      setIsLoading(true);

      try {
        const response = await off.searchProducts({
          page,
          pageSize: 25,
          filters: imagesToRead,
          fields: "all",
          countryCode: countryCode || "world",
        });
        let products: Product[] = [];
        if (
          response &&
          typeof response === 'object' &&
          'data' in response &&
          response.data &&
          typeof response.data === 'object' &&
          Array.isArray((response.data as { products?: unknown }).products)
        ) {
          products = (response.data as { products: Product[] }).products ?? [];
        }
        if (isValid) {
          const rep = products
            .filter((p) => {
              const isNew = p.code && !seenCodes.current[p.code]; // prevent from adding products already seen
              if (isNew && p.code) {
                seenCodes.current[p.code] = true;
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

    void load();
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
