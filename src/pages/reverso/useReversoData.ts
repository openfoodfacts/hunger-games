import * as React from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import off from "../../off";
import { OFF_API_URL } from "../../const";
import axios from "axios";

export interface ReversoProduct {
  code: string;
  product_name?: string;
  brands?: string;
  image_nutrition_url?: string;
  image_front_url?: string;
  images?: Record<string, unknown>;
  nutriments?: Record<string, unknown>;
  nutrition_data_per?: string;
  serving_size?: string;
  countries_tags?: string[];
  data_quality_errors_tags?: string[];
}

export default function useReversoData(
  countryCode: string,
  specificBarcode?: string,
) {
  const [dismissedCodes, setDismissedCodes] = React.useState<Set<string>>(
    new Set(),
  );
  const [solvedCount, setSolvedCount] = React.useState(0);

  // If a specific barcode is requested via URL query params
  const singleProductQuery = useQuery<ReversoProduct, Error>({
    queryKey: ["reverso-product", specificBarcode],
    queryFn: async () => {
      const res = await axios.get<{
        code: string;
        product?: ReversoProduct;
        status: number;
      }>(
        `${OFF_API_URL}/product/${specificBarcode}.json?fields=code,product_name,brands,image_nutrition_url,image_front_url,images,nutriments,nutrition_data_per,serving_size,countries_tags,data_quality_errors_tags`,
      );
      if (res.data.product && res.data.product.code) {
        return res.data.product;
      }
      throw new Error("Product not found");
    },
    enabled: Boolean(specificBarcode),
  });

  const {
    data: queryData,
    error: queryError,
    fetchNextPage,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useInfiniteQuery<{ products?: ReversoProduct[]; count?: number }, Error>({
    queryKey: ["reverso-products", countryCode],
    initialPageParam: 1,
    enabled: !specificBarcode,
    queryFn: async ({ pageParam, signal }) => {
      const filters: { [key: string]: string }[] = [
        {
          tagtype: "data_quality_errors",
          tag_contains: "contains",
          tag: "energy-value-in-kcal-and-kj-are-reversed",
        },
      ];

      if (countryCode && countryCode !== "world") {
        filters.push({
          tagtype: "countries",
          tag_contains: "contains",
          tag: countryCode,
        });
      }

      const res = await off.searchProducts<ReversoProduct>({
        page: pageParam as number,
        pageSize: 25,
        filters,
        fields:
          "code,product_name,brands,image_nutrition_url,image_front_url,images,nutriments,nutrition_data_per,serving_size,countries_tags,data_quality_errors_tags",
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
  });

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

  const removeHead = React.useCallback(() => {
    const head = queue[0];
    if (!head) return;
    setDismissedCodes((prev) => {
      const next = new Set(prev);
      next.add(head.code);
      return next;
    });
  }, [queue]);

  const solveCurrent = React.useCallback(() => {
    removeHead();
    setSolvedCount((c) => c + 1);
  }, [removeHead]);

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
    removeHead,
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
