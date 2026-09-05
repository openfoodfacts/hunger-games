import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
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

export default function useData(countryCode: string) {
  const [dismissed, setDismissed] = React.useState<{
    countryCode: string;
    codes: Set<string>;
  }>({ countryCode, codes: new Set() });

  const {
    data: queryData,
    error,
    fetchNextPage,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useInfiniteQuery<
    IngredientProduct[],
    Error,
    IngredientProduct[],
    readonly ["ingredient-products", string],
    number
  >({
    queryKey: ["ingredient-products", countryCode],
    initialPageParam: 0,
    queryFn: async ({ pageParam, signal }) => {
      const { data } = await off.searchProducts<IngredientApiProduct>({
        page: pageParam,
        pageSize: 25,
        filters: imagesToRead,
        fields: "all",
        countryCode: countryCode || "world",
        signal,
      });
      return (data.products ?? []).map(formatData);
    },
    getNextPageParam: (_lastPage, pages) => pages.length,
    select: ({ pages }) => pages.flat(),
  });

  const data = React.useMemo(() => {
    const dismissedCodes =
      dismissed.countryCode === countryCode
        ? dismissed.codes
        : new Set<string>();
    const seenCodes = new Set<string>();
    return (queryData ?? []).filter((product) => {
      if (dismissedCodes.has(product.code) || seenCodes.has(product.code)) {
        return false;
      }
      seenCodes.add(product.code);
      return true;
    });
  }, [countryCode, dismissed, queryData]);

  React.useEffect(() => {
    if (data.length < 5 && !isPending && !isFetchingNextPage && !error) {
      void fetchNextPage();
    }
  }, [data.length, error, fetchNextPage, isFetchingNextPage, isPending]);

  const removeHead = React.useCallback(() => {
    const head = data[0];
    if (!head) return;
    setDismissed((current) => {
      const codes =
        current.countryCode === countryCode ? current.codes : new Set<string>();
      const nextCodes = new Set(codes);
      nextCodes.add(head.code);
      return { countryCode, codes: nextCodes };
    });
  }, [countryCode, data]);

  return {
    data,
    removeHead,
    isLoading: isPending,
    error: error instanceof Error ? error.message : null,
    retry: () => void refetch(),
  };
}
