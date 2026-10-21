import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import off from "../../off";
import { OFF_DOMAIN, ROBOTOFF_API_URL } from "../../const";

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
  imageField: string;
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
        imageField: key,
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
  popularity: string = "top-90-percent-scans-2025",
) {
  const filterKey = `${countryCode}_${popularity}`;
  const [dismissed, setDismissed] = React.useState<{
    filterKey: string;
    codes: Set<string>;
  }>({ filterKey, codes: new Set() });

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
    readonly ["ingredient-products", string, string],
    number
  >({
    queryKey: ["ingredient-products", countryCode, popularity],
    initialPageParam: 0,
    queryFn: async ({ pageParam, signal }) => {
      const domain =
        countryCode && countryCode !== "world" ? countryCode : "world";

      if (popularity && popularity !== "all") {
        const page = pageParam + 1;
        const url = `https://${domain}.${OFF_DOMAIN}/facets/popularity/${encodeURIComponent(
          popularity,
        )}/states/Ingredients%20photo%20selected/states/Ingredients%20to%20be%20completed/${page}.json`;
        const { data } = await axios.get<{
          products?: IngredientApiProduct[];
        }>(url, { signal });
        return (data.products ?? []).map(formatData);
      }

      const { data } = await off.searchProducts<IngredientApiProduct>({
        page: pageParam,
        pageSize: 25,
        filters: imagesToRead,
        fields: "all",
        countryCode: domain,
        signal,
      });
      return (data.products ?? []).map(formatData);
    },
    getNextPageParam: (_lastPage, pages) => pages.length,
    select: ({ pages }) => pages.flat(),
  });

  const data = React.useMemo(() => {
    const dismissedCodes =
      dismissed.filterKey === filterKey ? dismissed.codes : new Set<string>();
    const seenCodes = new Set<string>();
    return (queryData ?? []).filter((product) => {
      if (dismissedCodes.has(product.code) || seenCodes.has(product.code)) {
        return false;
      }
      seenCodes.add(product.code);
      return true;
    });
  }, [filterKey, dismissed, queryData]);

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
        current.filterKey === filterKey ? current.codes : new Set<string>();
      const nextCodes = new Set(codes);
      nextCodes.add(head.code);
      return { filterKey, codes: nextCodes };
    });
  }, [filterKey, data]);

  return {
    data,
    removeHead,
    isLoading: isPending,
    error: error instanceof Error ? error.message : null,
    retry: () => void refetch(),
  };
}
