import * as React from "react";
import { addCountryToProduct, fetchGs1Products } from "./gs1CountryService";
import { DEFAULT_GS1_PREFIX, getGs1CountryByPrefix } from "./gs1Prefixes";
import type { Gs1ActionHistory, Gs1Product, VpnFilterMode } from "./types";

export function useGs1GameBuffer(
  initialPrefix: string = DEFAULT_GS1_PREFIX,
  initialVpnFilter: VpnFilterMode = "all",
  initialCode?: string,
) {
  const [prefix, setPrefix] = React.useState<string>(initialPrefix);
  const [vpnFilter, setVpnFilter] =
    React.useState<VpnFilterMode>(initialVpnFilter);
  const [codeSearch, setCodeSearch] = React.useState<string>(initialCode ?? "");
  const [products, setProducts] = React.useState<Gs1Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sessionCount, setSessionCount] = React.useState(0);
  const [history, setHistory] = React.useState<Gs1ActionHistory[]>([]);

  const pageRef = React.useRef(1);
  const isFetchingRef = React.useRef(false);

  const country = React.useMemo(() => getGs1CountryByPrefix(prefix), [prefix]);

  const loadProducts = React.useCallback(
    async (
      targetPrefix: string,
      targetVpnFilter: VpnFilterMode,
      targetPage: number,
      targetCode?: string,
      append = false,
    ) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const { products: newProducts, nextPage } = await fetchGs1Products({
          prefix: targetPrefix,
          vpnFilter: targetVpnFilter,
          page: targetPage,
          code: targetCode,
        });

        pageRef.current = nextPage;
        setProducts((prev) =>
          append ? [...prev, ...newProducts] : newProducts,
        );
      } catch (err) {
        console.error("Error loading GS1 products:", err);
        setError(
          "Failed to load products. Please check your connection or retry.",
        );
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [],
  );

  // Initial load or when prefix / vpnFilter / codeSearch changes
  React.useEffect(() => {
    let active = true;
    pageRef.current = 1;

    void Promise.resolve().then(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { products: newProducts, nextPage } = await fetchGs1Products({
          prefix,
          vpnFilter,
          page: 1,
          code: codeSearch,
        });
        if (active) {
          pageRef.current = nextPage;
          setProducts(newProducts);
          setIsLoading(false);
        }
      } catch (err) {
        if (active) {
          console.error("Error loading GS1 products:", err);
          setError(
            "Failed to load products. Please check your connection or retry.",
          );
          setIsLoading(false);
        }
      }
    });

    return () => {
      active = false;
    };
  }, [prefix, vpnFilter, codeSearch]);

  // Automatic prefetch when buffer is low
  React.useEffect(() => {
    if (
      !codeSearch &&
      !isLoading &&
      products.length <= 2 &&
      products.length > 0
    ) {
      const nextPage = pageRef.current;
      void Promise.resolve().then(() => {
        void loadProducts(prefix, vpnFilter, nextPage, undefined, true);
      });
    }
  }, [products.length, codeSearch, isLoading, prefix, vpnFilter, loadProducts]);

  const currentProduct = products[0] ?? null;

  const confirmSoldInCountry = React.useCallback(async () => {
    if (!currentProduct) return;
    setIsSubmitting(true);
    try {
      await addCountryToProduct(currentProduct, country);

      setSessionCount((c) => c + 1);
      setHistory((prev) => [
        {
          code: currentProduct.code,
          productName:
            currentProduct.product_name ||
            currentProduct.product_name_en ||
            currentProduct.code,
          countryName: country.name,
          countryTag: country.countryTag,
          action: "added",
          timestamp: Date.now(),
        },
        ...prev.slice(0, 29),
      ]);

      setProducts((prev) => prev.slice(1));
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
    setProducts((prev) => prev.slice(1));
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
    setProducts((prev) => prev.slice(1));
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

  const retry = React.useCallback(() => {
    pageRef.current = 1;
    void loadProducts(prefix, vpnFilter, 1, codeSearch, false);
  }, [prefix, vpnFilter, codeSearch, loadProducts]);

  return {
    country,
    currentProduct,
    isLoading,
    isSubmitting,
    error,
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
