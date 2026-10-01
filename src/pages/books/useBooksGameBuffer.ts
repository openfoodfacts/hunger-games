import * as React from "react";
import {
  fetchFacetBooks,
  moveBookToOpenProductsFacts,
} from "./booksService";
import type { BookProduct, PrefixFilter, BookActionHistory } from "./types";

export function useBooksGameBuffer(initialPrefix: PrefixFilter = "all", initialCode?: string) {
  const [prefix, setPrefix] = React.useState<PrefixFilter>(initialPrefix);
  const [codeSearch, setCodeSearch] = React.useState<string>(initialCode ?? "");
  const [products, setProducts] = React.useState<BookProduct[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sessionCount, setSessionCount] = React.useState(0);
  const [history, setHistory] = React.useState<BookActionHistory[]>([]);

  const pageRef = React.useRef(1);
  const isFetchingRef = React.useRef(false);

  // Load products from facet endpoint or barcode
  const loadBooks = React.useCallback(
    async (targetPrefix: PrefixFilter, targetPage: number, targetCode?: string, append = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const { products: newProducts } = await fetchFacetBooks({
          prefix: targetPrefix,
          page: targetPage,
          code: targetCode,
        });

        setProducts((prev) => (append ? [...prev, ...newProducts] : newProducts));
      } catch (err) {
        console.error("Error loading books:", err);
        setError("Failed to load books. Please check your connection or retry.");
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [],
  );

  // Initial load or when prefix / codeSearch changes
  React.useEffect(() => {
    let active = true;
    pageRef.current = 1;

    void Promise.resolve().then(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { products: newProducts } = await fetchFacetBooks({
          prefix,
          page: 1,
          code: codeSearch,
        });
        if (active) {
          setProducts(newProducts);
          setIsLoading(false);
        }
      } catch (err) {
        if (active) {
          console.error("Error loading books:", err);
          setError("Failed to load books. Please check your connection or retry.");
          setIsLoading(false);
        }
      }
    });

    return () => {
      active = false;
    };
  }, [prefix, codeSearch]);

  // Automatic prefetch when buffer is low
  React.useEffect(() => {
    if (!codeSearch && !isLoading && products.length <= 2 && products.length > 0) {
      const nextPage = pageRef.current + 1;
      pageRef.current = nextPage;
      void Promise.resolve().then(() => {
        void loadBooks(prefix, nextPage, undefined, true);
      });
    }
  }, [products.length, codeSearch, isLoading, prefix, loadBooks]);

  const currentProduct = products[0] ?? null;
  const nextProduct = products[1] ?? null;

  // Move current product to Open Products Facts
  const moveCurrentBook = React.useCallback(async () => {
    if (!currentProduct) return;
    setIsSubmitting(true);
    try {
      await moveBookToOpenProductsFacts(currentProduct);

      setSessionCount((c) => c + 1);
      setHistory((prev) => [
        {
          code: currentProduct.code,
          productName: currentProduct.product_name || `Barcode ${currentProduct.code}`,
          action: "moved",
          timestamp: Date.now(),
        },
        ...prev.slice(0, 24),
      ]);

      setProducts((prev) => prev.slice(1));
    } catch (err) {
      console.error("Failed to move book to OPF:", err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [currentProduct]);

  // Mark not a book (keep in Open Food Facts)
  const markNotABook = React.useCallback(() => {
    if (!currentProduct) return;
    setHistory((prev) => [
      {
        code: currentProduct.code,
        productName: currentProduct.product_name || `Barcode ${currentProduct.code}`,
        action: "not_a_book",
        timestamp: Date.now(),
      },
      ...prev.slice(0, 24),
    ]);
    setProducts((prev) => prev.slice(1));
  }, [currentProduct]);

  // Skip book
  const skipBook = React.useCallback(() => {
    if (!currentProduct) return;
    setHistory((prev) => [
      {
        code: currentProduct.code,
        productName: currentProduct.product_name || `Barcode ${currentProduct.code}`,
        action: "skipped",
        timestamp: Date.now(),
      },
      ...prev.slice(0, 24),
    ]);
    setProducts((prev) => prev.slice(1));
  }, [currentProduct]);

  // Change prefix filter
  const changePrefix = React.useCallback((newPrefix: PrefixFilter) => {
    setCodeSearch("");
    setPrefix(newPrefix);
  }, []);

  // Direct barcode lookup
  const searchBarcode = React.useCallback((code: string) => {
    setCodeSearch(code.trim());
  }, []);

  const retry = React.useCallback(() => {
    void loadBooks(prefix, pageRef.current, codeSearch, false);
  }, [loadBooks, prefix, codeSearch]);

  return {
    currentProduct,
    nextProduct,
    remainingCount: products.length,
    isLoading,
    isSubmitting,
    error,
    sessionCount,
    history,
    prefix,
    codeSearch,
    changePrefix,
    searchBarcode,
    moveCurrentBook,
    markNotABook,
    skipBook,
    retry,
  };
}
