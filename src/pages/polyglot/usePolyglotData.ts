import * as React from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import off from "../../off";
import { OFF_API_URL } from "../../const";
import axios from "axios";
import {
  PolyglotProduct,
  DetectedLanguageInfo,
  PolyglotChallengeOption,
} from "./types";

const FIELDS = [
  "code",
  "product_name",
  "product_name_fr",
  "product_name_en",
  "product_name_de",
  "product_name_es",
  "product_name_it",
  "product_name_nl",
  "product_name_pt",
  "product_name_pl",
  "ingredients_text",
  "ingredients_text_fr",
  "ingredients_text_en",
  "ingredients_text_de",
  "ingredients_text_es",
  "ingredients_text_it",
  "ingredients_text_nl",
  "ingredients_text_pt",
  "ingredients_text_pl",
  "brands",
  "lang",
  "languages_tags",
  "categories",
  "categories_tags",
  "labels_tags",
  "quantity",
  "image_front_url",
  "image_ingredients_url",
  "image_packaging_url",
  "image_nutrition_url",
  "selected_images",
  "images",
  "countries_tags",
  "data_quality_warnings_tags",
  "data_quality_errors_tags",
].join(",");

export default function usePolyglotData(
  countryCode: string,
  selectedChallenge: PolyglotChallengeOption,
  specificBarcode?: string,
) {
  const [dismissedCodes, setDismissedCodes] = React.useState<Set<string>>(
    new Set(),
  );
  const [solvedCount, setSolvedCount] = React.useState(0);

  // Single product query if barcode passed via URL
  const singleProductQuery = useQuery<PolyglotProduct, Error>({
    queryKey: ["polyglot-product", specificBarcode],
    queryFn: async () => {
      const res = await axios.get<{
        code: string;
        product?: PolyglotProduct;
        status: number;
      }>(`${OFF_API_URL}/product/${specificBarcode}.json?fields=${FIELDS}`);
      if (res.data.product && res.data.product.code) {
        return res.data.product;
      }
      throw new Error("Produit introuvable");
    },
    enabled: Boolean(specificBarcode),
  });

  const activeTag = selectedChallenge.tag || "ingredients-language-mismatch";

  const {
    data: queryData,
    error: queryError,
    fetchNextPage,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useInfiniteQuery<{ products?: PolyglotProduct[]; count?: number }, Error>(
    {
      queryKey: [
        "polyglot-products",
        countryCode,
        activeTag,
        selectedChallenge.mainLang,
      ],
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

        if (selectedChallenge.mainLang) {
          filters.push({
            tagtype: "languages",
            tag_contains: "contains",
            tag: selectedChallenge.mainLang,
          });
        }

        if (countryCode && countryCode !== "world") {
          filters.push({
            tagtype: "countries",
            tag_contains: "contains",
            tag: countryCode,
          });
        }

        const res = await off.searchProducts<PolyglotProduct>({
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
      staleTime: 1000 * 60 * 5,
    },
  );

  const allProducts = React.useMemo(() => {
    if (specificBarcode && singleProductQuery.data) {
      return [singleProductQuery.data];
    }
    return queryData?.pages.flatMap((page) => page.products ?? []) ?? [];
  }, [specificBarcode, singleProductQuery.data, queryData]);

  const currentProduct = React.useMemo(() => {
    return (
      allProducts.find((p) => p.code && !dismissedCodes.has(p.code)) || null
    );
  }, [allProducts, dismissedCodes]);

  // Try to load Cloud Vision OCR for the current product
  const { data: detectedOcr = null, isLoading: isOcrLoading } =
    useQuery<DetectedLanguageInfo | null>({
      queryKey: ["polyglot-ocr", currentProduct?.code],
      queryFn: async () => {
        if (!currentProduct?.code || !currentProduct?.images) return null;
        const numericKeys = Object.keys(currentProduct.images)
          .filter((k) => !isNaN(Number(k)))
          .sort((a, b) => Number(a) - Number(b));
        const targetImgId = numericKeys[0] || "1";
        try {
          const res = await off.getOcr(currentProduct.code, targetImgId);
          const resp0 = res.data?.responses?.[0];
          const ocrData = resp0?.fullTextAnnotation;
          const allLangs =
            ocrData?.pages?.[0]?.property?.detectedLanguages || [];
          const page0Lang = allLangs[0];

          // Parse word boxes with bounding polygons
          const wordBoxes = [];
          if (resp0?.textAnnotations && resp0.textAnnotations.length > 1) {
            for (let i = 1; i < resp0.textAnnotations.length; i++) {
              const item = resp0.textAnnotations[i];
              const verts = item.boundingPoly?.vertices || [];
              if (item.description && verts.length >= 2) {
                const xs = verts.map((v) => v.x ?? 0);
                const ys = verts.map((v) => v.y ?? 0);
                wordBoxes.push({
                  text: item.description,
                  x0: Math.min(...xs),
                  y0: Math.min(...ys),
                  x1: Math.max(...xs),
                  y1: Math.max(...ys),
                });
              }
            }
          }

          if (page0Lang || ocrData?.text) {
            return {
              languageCode: page0Lang?.languageCode || "und",
              confidence: page0Lang?.confidence || 0,
              sampleText: ocrData?.text?.slice(0, 150),
              allDetectedLanguages: allLangs,
              wordBoxes,
              fullText: ocrData?.text || "",
              imgid: targetImgId,
            };
          }
        } catch {
          return null;
        }
        return null;
      },
      enabled: Boolean(currentProduct?.code && currentProduct?.images),
      staleTime: 5 * 60 * 1000,
    });

  // Pre-fetch next page if approaching end
  React.useEffect(() => {
    if (!specificBarcode && allProducts.length > 0) {
      const remaining = allProducts.filter(
        (p) => p.code && !dismissedCodes.has(p.code),
      ).length;
      if (remaining <= 3 && !isFetchingNextPage) {
        void fetchNextPage();
      }
    }
  }, [
    allProducts,
    dismissedCodes,
    fetchNextPage,
    isFetchingNextPage,
    specificBarcode,
  ]);

  const totalCount = React.useMemo(() => {
    if (specificBarcode) return singleProductQuery.data ? 1 : 0;
    return queryData?.pages[0]?.count ?? 0;
  }, [specificBarcode, singleProductQuery.data, queryData]);

  const skipCurrent = React.useCallback(() => {
    if (currentProduct?.code) {
      setDismissedCodes((prev) => new Set(prev).add(currentProduct.code));
    }
  }, [currentProduct]);

  const solveCurrent = React.useCallback(() => {
    if (currentProduct?.code) {
      setDismissedCodes((prev) => new Set(prev).add(currentProduct.code));
      setSolvedCount((c) => c + 1);
    }
  }, [currentProduct]);

  return {
    currentProduct,
    detectedOcr,
    isOcrLoading,
    totalCount,
    solvedCount,
    isLoading: specificBarcode ? singleProductQuery.isLoading : isPending,
    error: specificBarcode ? singleProductQuery.error : queryError,
    skipCurrent,
    solveCurrent,
    refetch,
  };
}
