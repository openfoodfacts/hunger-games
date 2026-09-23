import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import off from "../../off";

export interface CandidateProduct {
  code: string;
  product_name?: string;
  brands?: string;
  lang?: string;
  images?: Record<string, unknown>;
  image_front_url?: string;
}

const filtersToSelect = [
  {
    tagtype: "states",
    tag_contains: "contains",
    tag: "ingredients-photo-to-be-selected",
  },
  {
    tagtype: "states",
    tag_contains: "contains",
    tag: "photos-uploaded",
  },
];

export function useIngredientImageCandidates(countryCode: string) {
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
    CandidateProduct[],
    Error,
    CandidateProduct[],
    readonly ["ingredient-image-candidates", string],
    number
  >({
    queryKey: ["ingredient-image-candidates", countryCode],
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const filters = [...filtersToSelect];
      if (countryCode && countryCode !== "world") {
        filters.push({
          tagtype: "countries",
          tag_contains: "contains",
          tag: countryCode,
        });
      }

      const { data } = await off.searchProducts<CandidateProduct>({
        page: pageParam,
        pageSize: 20,
        filters,
        fields: "code,product_name,brands,images,lang,image_front_url",
        countryCode:
          countryCode && countryCode !== "world" ? countryCode : "world",
        signal,
      });

      return data.products ?? [];
    },
    getNextPageParam: (_lastPage, pages) => pages.length + 1,
    select: ({ pages }) => pages.flat(),
  });

  const data = React.useMemo(() => {
    const dismissedCodes =
      dismissed.countryCode === countryCode
        ? dismissed.codes
        : new Set<string>();
    const seenCodes = new Set<string>();
    return (queryData ?? []).filter((product) => {
      if (!product.code || !product.images) return false;
      const hasUploadedImages = Object.keys(product.images).some(
        (k) => !isNaN(Number.parseInt(k)),
      );
      if (!hasUploadedImages) return false;

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
    currentProduct: data[0] ?? null,
    removeHead,
    isLoading: isPending,
    error: error instanceof Error ? error.message : null,
    retry: () => void refetch(),
  };
}
