import * as React from "react";
import { addCountryToProduct, fetchGs1Products } from "./gs1CountryService";
import { getGs1CountryByPrefix } from "./gs1Prefixes";
import type { CountryFilterMode, Gs1ActionHistory, Gs1Product } from "./types";

interface BufferState {
  queryKey: string;
  items: Gs1Product[];
  hasMore: boolean;
}

export function useGs1GameBuffer(
  prefix: string,
  countryFilter: CountryFilterMode,
  codeSearch: string,
) {
  const activeQueryKey = `${prefix}|${countryFilter}|${codeSearch}`;
  const [bufferState, setBufferState] = React.useState<BufferState>({
    queryKey: activeQueryKey,
    items: [],
    hasMore: true,
  });

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sessionCount, setSessionCount] = React.useState(0);
  const [history, setHistory] = React.useState<Gs1ActionHistory[]>([]);

  const pageRef = React.useRef(1);
  const isFetchingRef = React.useRef(false);
  const queryGenRef = React.useRef(0);
  // Tracks products already confirmed, rejected, or skipped in this session
  const reviewedCodesRef = React.useRef<Set<string>>(new Set());
  // Confirmations remove products from the facet and shift later items into earlier pages
  const confirmationCountRef = React.useRef(0);
  const acknowledgedConfirmationCountRef = React.useRef(0);

  const country = React.useMemo(() => getGs1CountryByPrefix(prefix), [prefix]);

  // Expose products & hasMore only when they belong to the active query
  const products = React.useMemo(
    () => (bufferState.queryKey === activeQueryKey ? bufferState.items : []),
    [bufferState, activeQueryKey],
  );
  const hasMore =
    bufferState.queryKey === activeQueryKey ? bufferState.hasMore : true;

  const loadProducts = React.useCallback(
    async (
      targetPrefix: string,
      targetCountryFilter: CountryFilterMode,
      targetPage: number,
      targetCode: string | undefined,
      append: boolean,
      generation: number,
    ) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      const targetQueryKey = `${targetPrefix}|${targetCountryFilter}|${targetCode ?? ""}`;
      const capturedConfirmationCount = confirmationCountRef.current;
      const startPage =
        capturedConfirmationCount > acknowledgedConfirmationCountRef.current
          ? 1
          : targetPage;

      try {
        const {
          products: newProducts,
          nextPage,
          hasMore: moreAvailable,
        } = await fetchGs1Products({
          prefix: targetPrefix,
          countryFilter: targetCountryFilter,
          page: startPage,
          code: targetCode,
          excludedCodes: reviewedCodesRef.current,
        });

        if (generation !== queryGenRef.current) return;

        acknowledgedConfirmationCountRef.current = capturedConfirmationCount;
        pageRef.current = nextPage;
        setBufferState((prev) => {
          const existingItems =
            append && prev.queryKey === targetQueryKey ? prev.items : [];
          const existingCodes = new Set(existingItems.map((p) => p.code));
          const uniqueNew = newProducts.filter(
            (p) => !existingCodes.has(p.code),
          );
          return {
            queryKey: targetQueryKey,
            items: [...existingItems, ...uniqueNew],
            hasMore: moreAvailable,
          };
        });
      } catch (err) {
        if (generation !== queryGenRef.current) return;
        console.error("Error loading GS1 products:", err);
        setError(
          "Failed to load products. Please check your connection or retry.",
        );
      } finally {
        if (generation === queryGenRef.current) {
          setIsLoading(false);
        }
        isFetchingRef.current = false;
      }
    },
    [],
  );

  // Reload whenever URL-driven query criteria change
  React.useEffect(() => {
    const generation = queryGenRef.current + 1;
    queryGenRef.current = generation;
    pageRef.current = 1;
    acknowledgedConfirmationCountRef.current = confirmationCountRef.current;
    isFetchingRef.current = false;

    void Promise.resolve().then(() => {
      void loadProducts(
        prefix,
        countryFilter,
        1,
        codeSearch,
        false,
        generation,
      );
    });
  }, [prefix, countryFilter, codeSearch, loadProducts]);

  // Automatic prefetch when buffer is low
  React.useEffect(() => {
    if (
      !codeSearch &&
      !isLoading &&
      !error &&
      hasMore &&
      products.length <= 2 &&
      products.length > 0
    ) {
      const nextPage = pageRef.current;
      const generation = queryGenRef.current;
      void Promise.resolve().then(() => {
        void loadProducts(
          prefix,
          countryFilter,
          nextPage,
          undefined,
          true,
          generation,
        );
      });
    }
  }, [
    products.length,
    codeSearch,
    isLoading,
    error,
    hasMore,
    prefix,
    countryFilter,
    loadProducts,
  ]);

  const currentProduct = products[0] ?? null;

  const confirmSoldInCountry = React.useCallback(async () => {
    if (!currentProduct) return;
    const capturedGen = queryGenRef.current;
    const capturedCode = currentProduct.code;
    const capturedCountry = country;

    setIsSubmitting(true);
    try {
      await addCountryToProduct(currentProduct, capturedCountry);

      reviewedCodesRef.current.add(capturedCode);
      confirmationCountRef.current += 1;
      setSessionCount((c) => c + 1);
      setHistory((prev) => [
        {
          code: capturedCode,
          productName:
            currentProduct.product_name ||
            currentProduct.product_name_en ||
            capturedCode,
          countryName: capturedCountry.name,
          countryTag: capturedCountry.countryTag,
          action: "added",
          timestamp: Date.now(),
        },
        ...prev.slice(0, 29),
      ]);

      setBufferState((prev) =>
        queryGenRef.current === capturedGen
          ? {
              ...prev,
              items: prev.items.filter((p) => p.code !== capturedCode),
            }
          : prev,
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [currentProduct, country]);

  const rejectSoldInCountry = React.useCallback(() => {
    if (!currentProduct) return;
    reviewedCodesRef.current.add(currentProduct.code);
    setHistory((prev) => [
      {
        code: currentProduct.code,
        productName:
          currentProduct.product_name ||
          currentProduct.product_name_en ||
          currentProduct.code,
        countryName: country.name,
        countryTag: country.countryTag,
        action: "rejected",
        timestamp: Date.now(),
      },
      ...prev.slice(0, 29),
    ]);
    setBufferState((prev) => ({
      ...prev,
      items: prev.items.slice(1),
    }));
  }, [currentProduct, country]);

  const skipProduct = React.useCallback(() => {
    if (!currentProduct) return;
    reviewedCodesRef.current.add(currentProduct.code);
    setHistory((prev) => [
      {
        code: currentProduct.code,
        productName:
          currentProduct.product_name ||
          currentProduct.product_name_en ||
          currentProduct.code,
        countryName: country.name,
        countryTag: country.countryTag,
        action: "skipped",
        timestamp: Date.now(),
      },
      ...prev.slice(0, 29),
    ]);
    setBufferState((prev) => ({
      ...prev,
      items: prev.items.slice(1),
    }));
  }, [currentProduct, country]);

  // Continues from saved cursor (pageRef.current) for both "Load more" and error retry
  const retry = React.useCallback(() => {
    const generation = queryGenRef.current;
    void loadProducts(
      prefix,
      countryFilter,
      pageRef.current,
      codeSearch,
      products.length > 0,
      generation,
    );
  }, [prefix, countryFilter, codeSearch, products.length, loadProducts]);

  return {
    country,
    currentProduct,
    isLoading,
    isSubmitting,
    error,
    hasMore,
    sessionCount,
    history,
    confirmSoldInCountry,
    rejectSoldInCountry,
    skipProduct,
    retry,
  };
}
