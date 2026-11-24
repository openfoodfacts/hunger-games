import * as React from "react";
import { addCountryToProduct, fetchGs1Products } from "./gs1CountryService";
import { DEFAULT_GS1_PREFIX, getGs1CountryByPrefix } from "./gs1Prefixes";
import type { Gs1ActionHistory, Gs1Product, VpnFilterMode } from "./types";

interface BufferState {
  queryKey: string;
  items: Gs1Product[];
  hasMore: boolean;
}

export function useGs1GameBuffer(
  initialPrefix: string = DEFAULT_GS1_PREFIX,
  initialVpnFilter: VpnFilterMode = "all",
  initialCode?: string,
) {
  const [prefix, setPrefix] = React.useState<string>(initialPrefix);
  const [vpnFilter, setVpnFilter] =
    React.useState<VpnFilterMode>(initialVpnFilter);
  const [codeSearch, setCodeSearch] = React.useState<string>(initialCode ?? "");

  const activeQueryKey = `${prefix}|${vpnFilter}|${codeSearch}`;
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
      targetVpnFilter: VpnFilterMode,
      targetPage: number,
      targetCode: string | undefined,
      append: boolean,
      generation: number,
    ) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      const targetQueryKey = `${targetPrefix}|${targetVpnFilter}|${targetCode ?? ""}`;

      try {
        const {
          products: newProducts,
          nextPage,
          hasMore: moreAvailable,
        } = await fetchGs1Products({
          prefix: targetPrefix,
          vpnFilter: targetVpnFilter,
          page: targetPage,
          code: targetCode,
        });

        if (generation !== queryGenRef.current) return;

        pageRef.current = nextPage;
        setBufferState((prev) => ({
          queryKey: targetQueryKey,
          items:
            append && prev.queryKey === targetQueryKey
              ? [...prev.items, ...newProducts]
              : newProducts,
          hasMore: moreAvailable,
        }));
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

  // Initial load or when prefix / vpnFilter / codeSearch changes
  React.useEffect(() => {
    const generation = queryGenRef.current + 1;
    queryGenRef.current = generation;
    pageRef.current = 1;
    isFetchingRef.current = false;

    void Promise.resolve().then(() => {
      void loadProducts(prefix, vpnFilter, 1, codeSearch, false, generation);
    });
  }, [prefix, vpnFilter, codeSearch, loadProducts]);

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
          vpnFilter,
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
    vpnFilter,
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

  const changePrefix = React.useCallback((newPrefix: string) => {
    setPrefix(newPrefix);
    setCodeSearch("");
  }, []);

  const changeVpnFilter = React.useCallback((newFilter: VpnFilterMode) => {
    setVpnFilter(newFilter);
    setCodeSearch("");
  }, []);

  const searchBarcode = React.useCallback((code: string) => {
    setCodeSearch(code.trim());
  }, []);

  // Continues from saved cursor (pageRef.current) for both "Load more" and error retry
  const retry = React.useCallback(() => {
    const generation = queryGenRef.current;
    void loadProducts(
      prefix,
      vpnFilter,
      pageRef.current,
      codeSearch,
      products.length > 0,
      generation,
    );
  }, [prefix, vpnFilter, codeSearch, products.length, loadProducts]);

  return {
    country,
    currentProduct,
    isLoading,
    isSubmitting,
    error,
    hasMore,
    sessionCount,
    history,
    prefix,
    vpnFilter,
    codeSearch,
    changePrefix,
    changeVpnFilter,
    searchBarcode,
    confirmSoldInCountry,
    rejectSoldInCountry,
    skipProduct,
    retry,
  };
}
