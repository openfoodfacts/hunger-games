import axios from "axios";
import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import off from "../../off";
import { OFF_API_URL_V3 } from "../../const";
import type { ProductImage } from "../../off";

// Products tagged with this state have a missing (or to be improved) product name.
export const PRODUCT_NAME_TO_BE_COMPLETED_TAG = "product-name-to-be-completed";

const FIELDS =
  "code,product_name,brands,categories,lang,image_front_url,image_url,images,quantity";

// The Open Food Facts search endpoint can hang for a long time
const REQUEST_TIMEOUT_MS = 30_000;

export type ProductNameProduct = {
  code: string;
  product_name?: string;
  brands?: string;
  categories?: string;
  lang?: string;
  image_front_url?: string;
  image_url?: string;
  images?: Record<string, ProductImage | string>;
};

const hasImages = (product: ProductNameProduct) =>
  Boolean(
    product.image_front_url ||
    product.image_url ||
    Object.keys(product.images ?? {}).some((key) => /^\d+$/.test(key)),
  );

/**
 * Saves the product name with the OFF API v3, using the session cookies.
 */
export async function saveProductName(
  product: ProductNameProduct,
  name: string,
) {
  await axios.patch(
    `${OFF_API_URL_V3}/product/${product.code}`,
    {
      product: { product_name: name },
      comment: "Hunger Games - Product name game",
    },
    { withCredentials: true },
  );
}

export function useProductNameGame(countryCode: string) {
  // Products already annotated (or skipped) during this session
  const [session, setSession] = React.useState<{
    countryCode: string;
    codes: Set<string>;
  }>({ countryCode, codes: new Set() });

  const {
    data: queryData,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useInfiniteQuery<
    ProductNameProduct[],
    Error,
    ProductNameProduct[],
    readonly ["product-name-products", string],
    number
  >({
    queryKey: ["product-name-products", countryCode],
    initialPageParam: 0,
    queryFn: async ({ pageParam, signal }) => {
      const { data } = await off.searchProducts<ProductNameProduct>({
        page: pageParam,
        pageSize: 25,
        filters: [
          {
            tagtype: "states",
            tag_contains: "contains",
            tag: PRODUCT_NAME_TO_BE_COMPLETED_TAG,
          },
        ],
        fields: FIELDS,
        countryCode: countryCode || "world",
        signal: AbortSignal.any([
          signal,
          AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        ]),
      });
      return data.products ?? [];
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 0 ? undefined : pages.length,
    select: ({ pages }) => pages.flat(),
  });

  const data = React.useMemo(() => {
    const sessionCodes =
      session.countryCode === countryCode ? session.codes : new Set<string>();
    const seenCodes = new Set<string>();
    // Without images we cannot name the product, so we discard those products
    return (queryData ?? []).filter((product) => {
      if (
        !product.code ||
        sessionCodes.has(product.code) ||
        seenCodes.has(product.code) ||
        !hasImages(product)
      ) {
        return false;
      }
      seenCodes.add(product.code);
      return true;
    });
  }, [countryCode, queryData, session]);

  React.useEffect(() => {
    if (
      data.length < 5 &&
      hasNextPage &&
      !isPending &&
      !isFetchingNextPage &&
      !error
    ) {
      void fetchNextPage();
    }
  }, [
    data.length,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  ]);

  const removeHead = React.useCallback(() => {
    const head = data[0];
    if (!head) {
      return;
    }
    setSession((current) => {
      const codes =
        current.countryCode === countryCode ? current.codes : new Set<string>();
      const nextCodes = new Set(codes);
      nextCodes.add(head.code);
      return { countryCode, codes: nextCodes };
    });
  }, [countryCode, data]);

  return {
    product: data[0] ?? null,
    next: removeHead,
    isLoading: isPending,
    error: error instanceof Error ? error.message : null,
    retry: () => void refetch(),
    saveName: (name: string) => {
      const product = data[0];
      if (!product) {
        return Promise.reject(new Error("No product to annotate"));
      }
      return saveProductName(product, name);
    },
  };
}
