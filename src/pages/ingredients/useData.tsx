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

type SourceImage = { uploaded_t?: number; uploader?: string };
type SelectedImage = {
  geometry: string;
  imgid: string;
  sizes: { full: { h: number; w: number } };
  x1?: number;
  x2?: number;
  y1?: number;
  y2?: number;
};
type IngredientImage = SourceImage | SelectedImage;
type IngredientApiProduct = {
  code: string;
  image_ingredients_url: string;
  images: Record<string, IngredientImage>;
  ingredient?: unknown;
  lang: string;
  product_name?: string;
  scans_n?: number;
  [key: string]: unknown;
};

export type IngredientSelectedImage = {
  countryCode: string;
  fetchDataUrl: string;
  imageUrl: string;
  uploaded_t?: number;
  uploader?: string;
};
export type IngredientProduct = {
  code: string;
  ingredient?: unknown;
  lang: string;
  product_name?: string;
  scans_n?: number;
  selectedImages: IngredientSelectedImage[];
  [key: `ingredients_text_${string}`]: unknown;
};

const isSelectedImage = (image: IngredientImage): image is SelectedImage =>
  "imgid" in image && "geometry" in image && "sizes" in image;
const getImageUrl = (base: string, id: string) => `${base}${id}.jpg`;
const getIngredientExtractionUrl = (base: string, id: string) =>
  `${ROBOTOFF_API_URL}/predict/ingredient_list?ocr_url=${base}${id}.json`;

const formatData = (product: IngredientApiProduct): IngredientProduct => {
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
  const selectedImages = Object.entries(images).flatMap(([key, imageData]) => {
    if (!key.startsWith("ingredients") || !isSelectedImage(imageData))
      return [];
    const sourceImage = images[imageData.imgid];
    const uploaded_t =
      sourceImage && "uploaded_t" in sourceImage
        ? sourceImage.uploaded_t
        : undefined;
    const uploader =
      sourceImage && "uploader" in sourceImage
        ? sourceImage.uploader
        : undefined;
    const countryCode = key.startsWith("ingredients_")
      ? key.slice("ingredients_".length)
      : "";
    return [
      {
        countryCode,
        imageUrl: getImageUrl(baseImageUrl, imageData.imgid),
        fetchDataUrl: getIngredientExtractionUrl(
          baseImageUrl.replace("images.", "static."),
          imageData.imgid,
        ),
        uploaded_t,
        uploader,
      },
    ];
  });
  const ingredientTexts = Object.fromEntries(
    Object.entries(other).filter(([key]) =>
      key.startsWith("ingredients_text_"),
    ),
  );
  return {
    code,
    lang,
    selectedImages,
    product_name,
    ingredient,
    scans_n,
    ...ingredientTexts,
  };
};

export default function useData(
  countryCode: string,
): [IngredientProduct[], () => void, boolean] {
  const [data, setData] = React.useState<IngredientProduct[]>([]);
  const prevCountry = React.useRef(countryCode);
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const seenCodes = React.useRef(new Set<string>());

  React.useEffect(() => {
    let isValid = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const { data: response } =
          await off.searchProducts<IngredientApiProduct>({
            page,
            pageSize: 25,
            filters: imagesToRead,
            fields: "all",
            countryCode: countryCode || "world",
          });
        if (!isValid) return;
        const products = response.products ?? [];
        const countryChanged = prevCountry.current !== countryCode;
        if (countryChanged) seenCodes.current.clear();
        const formattedProducts = products
          .filter(({ code }) => {
            if (seenCodes.current.has(code)) return false;
            seenCodes.current.add(code);
            return true;
          })
          .map(formatData);
        if (countryChanged) {
          setData(formattedProducts);
          prevCountry.current = countryCode;
        } else if (formattedProducts.length > 0) {
          setData((previous) => [...previous, ...formattedProducts]);
        }
        setIsLoading(false);
        if (formattedProducts.length < 5) setPage((current) => current + 1);
      } catch (error: unknown) {
        console.error(error);
        if (isValid) setIsLoading(false);
      }
    };
    void load();
    return () => {
      isValid = false;
    };
  }, [page, countryCode]);

  const removeHead = React.useCallback(() => {
    setData((previous) => previous.slice(1));
  }, []);
  return [data, removeHead, isLoading];
}
