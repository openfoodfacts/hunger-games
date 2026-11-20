import * as React from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import off from "../../off";
import { OFF_API_URL } from "../../const";
import axios from "axios";
import { QuantityProduct } from "./types";

const FIELDS = [
  "code",
  "product_name",
  "brands",
  "quantity",
  "product_quantity",
  "product_quantity_unit",
  "serving_size",
  "serving_quantity",
  "serving_quantity_unit",
  "image_front_url",
  "image_nutrition_url",
  "image_ingredients_url",
  "image_packaging_url",
  "images",
  "countries_tags",
  "data_quality_warnings_tags",
  "data_quality_errors_tags",
].join(",");

export default function useQuantityData(
  countryCode: string,
  warningTag: string = "quantity-not-recognized",
  specificBarcode?: string,
) {
  const [dismissedCodes, setDismissedCodes] = React.useState<Set<string>>(
    new Set(),
  );
  const [solvedCount, setSolvedCount] = React.useState(0);

  // If a specific barcode is requested via URL query params
  const singleProductQuery = useQuery<QuantityProduct, Error>({
    queryKey: ["quantity-product", specificBarcode],
    queryFn: async () => {
      const res = await axios.get<{
        code: string;
        product?: QuantityProduct;
        status: number;
      }>(`${OFF_API_URL}/product/${specificBarcode}.json?fields=${FIELDS}`);
      if (res.data.product && res.data.product.code) {
        return res.data.product;
      }
      throw new Error("Produit introuvable");
    },
    enabled: Boolean(specificBarcode),
  });

  const activeTag =
    !warningTag || warningTag === "all"
      ? "quantity-not-recognized"
      : warningTag;

  const {
    data: queryData,
    error: queryError,
    fetchNextPage,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useInfiniteQuery<{ products?: QuantityProduct[]; count?: number }, Error>(
    {
      queryKey: ["quantity-products", countryCode, activeTag],
      initialPageParam: 1,
      enabled: !specificBarcode,
      queryFn: async ({ pageParam, signal }) => {
        const filters: { [key: string]: string }[] = [
          {
            tagtype: "data_quality_warnings",
            tag_contains: "contains",
            tag: activeTag,
          },
        ];

        if (countryCode && countryCode !== "world") {
          filters.push({
            tagtype: "countries",
            tag_contains: "contains",
            tag: countryCode,
          });
        }

        const res = await off.searchProducts<QuantityProduct>({
          page: pageParam as number,
          pageSize: 25,
          filters,
          fields: FIELDS,
          signal,
        });

        return res.data;
      },
      getNextPageParam: (lastPage, pages) => {
        const currentProducts = pages.flatMap((p) => p.products ?? []);
        const totalCount = lastPage.count ?? 0;
        if (currentProducts.length < totalCount) {
          return pages.length + 1;
        }
        return undefined;
      },
    },
  );

  const totalCount = queryData?.pages[0]?.count ?? 0;

  const queue = React.useMemo(() => {
    if (specificBarcode) {
      if (
        singleProductQuery.data &&
        !dismissedCodes.has(singleProductQuery.data.code)
      ) {
        return [singleProductQuery.data];
      }
      return [];
    }

    const allProducts = (queryData?.pages ?? []).flatMap(
      (page) => page.products ?? [],
    );
    const seen = new Set<string>();
    return allProducts.filter((product) => {
      if (!product || !product.code) return false;
      if (dismissedCodes.has(product.code) || seen.has(product.code)) {
        return false;
      }
      seen.add(product.code);
      return true;
    });
  }, [specificBarcode, singleProductQuery.data, queryData, dismissedCodes]);

  // Pre-fetch next page when fewer than 5 items remain in the queue
  React.useEffect(() => {
    if (
      !specificBarcode &&
      queue.length < 5 &&
      !isPending &&
      !isFetchingNextPage &&
      !queryError
    ) {
      void fetchNextPage();
    }
  }, [
    specificBarcode,
    queue.length,
    isPending,
    isFetchingNextPage,
    queryError,
    fetchNextPage,
  ]);

  const skipCurrent = React.useCallback(() => {
    const head = queue[0];
    if (!head) return;
    setDismissedCodes((prev) => {
      const next = new Set(prev);
      next.add(head.code);
      return next;
    });
  }, [queue]);

  const solveCurrent = React.useCallback(() => {
    skipCurrent();
    setSolvedCount((c) => c + 1);
  }, [skipCurrent]);

  return {
    currentProduct: queue[0] || null,
    remainingInQueue: queue.length,
    totalCount,
    solvedCount,
    isLoading: specificBarcode ? singleProductQuery.isLoading : isPending,
    error: specificBarcode
      ? singleProductQuery.error
        ? singleProductQuery.error.message
        : null
      : queryError
        ? queryError.message
        : null,
    skipCurrent,
    solveCurrent,
    retry: () => {
      if (specificBarcode) {
        void singleProductQuery.refetch();
      } else {
        void refetch();
      }
    },
  };
}
