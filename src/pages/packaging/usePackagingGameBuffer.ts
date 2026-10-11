import * as React from "react";
import axios from "axios";
import { OFF_API_URL_V3, OFF_SEARCH } from "../../const";
import offService from "../../off";
import robotoff, { type Logo, type QuestionInterface } from "../../robotoff";
import type {
  EditablePackagingComponent,
  PackagingWrite,
  ProductDescription,
} from "./types";

type SearchParameters = {
  country?: string;
  creator?: string;
  code?: string;
};

type BufferState = {
  products: ProductDescription[];
  page: number;
  maxPage: number;
  isLoading: boolean;
  error: string | null;
  requestId: number;
};

type OcrCache = Record<string, string>;

export function usePackagingGameBuffer(initialParams: SearchParameters) {
  const [params, setParams] = React.useState<SearchParameters>(initialParams);
  const [state, setState] = React.useState<BufferState>({
    products: [],
    page: 1,
    maxPage: 100,
    isLoading: true,
    error: null,
    requestId: 0,
  });

  const [sessionCount, setSessionCount] = React.useState<number>(0);
  const [history, setHistory] = React.useState<string[]>([]);
  const [ocrText, setOcrText] = React.useState<string>("");
  const [isLoadingOcr, setIsLoadingOcr] = React.useState<boolean>(false);
  const [robotoffQuestions, setRobotoffQuestions] = React.useState<
    QuestionInterface[]
  >([]);
  const [robotoffLogos, setRobotoffLogos] = React.useState<Logo[]>([]);

  // Local OCR text cache across products
  const ocrCacheRef = React.useRef<OcrCache>({});

  const currentProduct = state.products[0] ?? null;
  const nextProduct = state.products[1] ?? null;

  // Build OFF Search URL
  const buildUrl = React.useCallback(
    (page: number, searchParams: SearchParameters) => {
      if (searchParams.code) {
        return `${OFF_API_URL_V3}/product/${searchParams.code}.json?fields=code,lang,image_packaging_url,product_name,packagings,images,creator,countries,quantity,categories_tags,labels_tags,ingredients_text,selected_images,unique_scans_n`;
      }

      let tagIdx = 2;
      const countryParam = searchParams.country
        ? `&tagtype_${tagIdx}=countries&tag_contains_${tagIdx}=contains&tag_${tagIdx++}=${searchParams.country}`
        : "";
      const creatorParam = searchParams.creator
        ? `&tagtype_${tagIdx}=creator&tag_contains_${tagIdx}=contains&tag_${tagIdx++}=${searchParams.creator}`
        : "";

      return `${OFF_SEARCH}?json=true&page=${page}&fields=code,states,lang,image_packaging_url,packagings,product_name,images,creator,countries,quantity,categories_tags,labels_tags,ingredients_text,selected_images,unique_scans_n&action=process&sort_by=unique_scans_n&tagtype_0=states&tag_contains_0=contains&tag_0=packaging-to-be-completed&tagtype_1=states&tag_contains_1=contains&tag_1=packaging-photo-selected${countryParam}${creatorParam}`;
    },
    [],
  );

  // Fetch product list
  const fetchProducts = React.useCallback(
    async (page: number, searchParams: SearchParameters) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const url = buildUrl(page, searchParams);
        const { data } = await axios.get<{
          products?: ProductDescription[];
          product?: ProductDescription;
          count?: number;
          page_size?: number;
        }>(url);

        const loadedProducts =
          data.products ?? (data.product ? [data.product] : []);
        const pageSize = data.page_size ?? 25;
        const maxPage = Math.max(1, Math.ceil((data.count ?? 0) / pageSize));

        setState((prev) => ({
          ...prev,
          products: loadedProducts,
          maxPage,
          isLoading: false,
          error: null,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to load products",
        }));
      }
    },
    [buildUrl],
  );

  // Reset & load when parameters change
  React.useEffect(() => {
    void fetchProducts(1, params);
  }, [fetchProducts, params, state.requestId]);

  // Fetch OCR for a given product
  const loadProductOcr = React.useCallback(
    async (prod: ProductDescription | null) => {
      if (!prod || !prod.code) {
        setOcrText("");
        return;
      }

      if (ocrCacheRef.current[prod.code] !== undefined) {
        setOcrText(ocrCacheRef.current[prod.code]);
        return;
      }

      setIsLoadingOcr(true);
      try {
        const formattedCode = offService.getFormatedBarcode(prod.code);
        const rootImageUrl = offService.getImageUrl(formattedCode);

        // Find image IDs
        const imageIds: string[] = [];
        if (prod.images) {
          Object.keys(prod.images).forEach((key) => {
            if (!isNaN(Number.parseInt(key, 10))) {
              imageIds.push(key);
            }
          });
        }

        // Limit to first 4 images (packaging and main product photos)
        const targetIds = imageIds.slice(0, 4);

        if (targetIds.length === 0) {
          ocrCacheRef.current[prod.code] = "";
          setOcrText("");
          setIsLoadingOcr(false);
          return;
        }

        const ocrPromises = targetIds.map(async (id) => {
          try {
            const res = await axios.get<{
              responses?: Array<{
                textAnnotations?: Array<{ description?: string }>;
              }>;
            }>(`${rootImageUrl}/${id}.json`, { timeout: 4000 });
            return (
              res.data?.responses?.[0]?.textAnnotations?.[0]?.description ?? ""
            );
          } catch {
            return "";
          }
        });

        const results = await Promise.all(ocrPromises);
        const combined = results.filter(Boolean).join("\n---\n");
        ocrCacheRef.current[prod.code] = combined;
        setOcrText(combined);
      } catch {
        setOcrText("");
      } finally {
        setIsLoadingOcr(false);
      }
    },
    [],
  );

  // Fetch Robotoff packaging questions and logos for active product
  const loadRobotoffData = React.useCallback(
    async (prod: ProductDescription | null) => {
      if (!prod || !prod.code) {
        setRobotoffQuestions([]);
        setRobotoffLogos([]);
        return;
      }

      try {
        const [questionsRes, logosRes] = await Promise.allSettled([
          robotoff.questionsByProductCode(prod.code),
          robotoff.searchLogos(prod.code, "", "packaging", 10),
        ]);

        if (questionsRes.status === "fulfilled") {
          const qs = questionsRes.value.data.questions.filter(
            (q) => q.insight_type === "packaging" || q.type === "packaging",
          );
          setRobotoffQuestions(qs);
        } else {
          setRobotoffQuestions([]);
        }

        if (logosRes.status === "fulfilled") {
          const logos =
            (logosRes.value.data as unknown as { logos?: Logo[] })?.logos ?? [];
          setRobotoffLogos(logos);
        } else {
          setRobotoffLogos([]);
        }
      } catch {
        setRobotoffQuestions([]);
        setRobotoffLogos([]);
      }
    },
    [],
  );

  // Trigger OCR & Robotoff loading when currentProduct changes
  React.useEffect(() => {
    void loadProductOcr(currentProduct);
    void loadRobotoffData(currentProduct);

    // Background pre-fetch next product OCR if available
    if (nextProduct && !ocrCacheRef.current[nextProduct.code]) {
      const formattedCode = offService.getFormatedBarcode(nextProduct.code);
      const rootImageUrl = offService.getImageUrl(formattedCode);
      const imageIds = Object.keys(nextProduct.images ?? {})
        .filter((k) => !isNaN(Number.parseInt(k, 10)))
        .slice(0, 2);
      if (imageIds.length > 0) {
        void Promise.all(
          imageIds.map((id) =>
            axios
              .get<{
                responses?: Array<{
                  textAnnotations?: Array<{ description?: string }>;
                }>;
              }>(`${rootImageUrl}/${id}.json`, { timeout: 4000 })
              .then(
                (r) =>
                  r.data?.responses?.[0]?.textAnnotations?.[0]?.description ??
                  "",
              )
              .catch(() => ""),
          ),
        ).then((res) => {
          ocrCacheRef.current[nextProduct.code] = res
            .filter(Boolean)
            .join("\n---\n");
        });
      }
    }
  }, [currentProduct, loadProductOcr, loadRobotoffData, nextProduct]);

  // Advance to next product
  const next = React.useCallback(() => {
    setState((prev) => {
      if (prev.products.length > 1) {
        return {
          ...prev,
          products: prev.products.slice(1),
        };
      }
      // Load next page
      const nextPage = prev.page < prev.maxPage ? prev.page + 1 : 1;
      void fetchProducts(nextPage, params);
      return {
        ...prev,
        page: nextPage,
        products: [],
      };
    });
  }, [fetchProducts, params]);

  // Submit packaging update to Open Food Facts API v3
  const submitPackagings = React.useCallback(
    async (components: EditablePackagingComponent[]) => {
      if (!currentProduct) return;

      const packagings: PackagingWrite[] = components
        .map(({ material, numberOfUnits, recycling, shape }) => {
          const rep: PackagingWrite = {};
          if (numberOfUnits) {
            const num = Number.parseInt(String(numberOfUnits), 10);
            if (!isNaN(num) && num > 0) {
              rep.number_of_units = num;
            }
          }
          if (shape) rep.shape = { id: shape };
          if (material) rep.material = { id: material };
          if (recycling) rep.recycling = { id: recycling };

          return Object.keys(rep).length > 0 ? rep : null;
        })
        .filter((x): x is PackagingWrite => x !== null);

      try {
        await axios.patch(
          `${OFF_API_URL_V3}/product/${currentProduct.code}`,
          { product: { fields: "updated", packagings } },
          { withCredentials: true },
        );
        setSessionCount((prev) => prev + 1);
        setHistory((prev) => [currentProduct.code, ...prev.slice(0, 19)]);
        next();
      } catch (err) {
        console.error("Failed to save packaging:", err);
        throw err;
      }
    },
    [currentProduct, next],
  );

  const retry = React.useCallback(() => {
    setState((prev) => ({ ...prev, requestId: prev.requestId + 1 }));
  }, []);

  const updateParams = React.useCallback(
    (newParams: Partial<SearchParameters>) => {
      setParams((prev) => ({ ...prev, ...newParams }));
    },
    [],
  );

  return {
    currentProduct,
    nextProduct,
    isLoading: state.isLoading,
    error: state.error,
    sessionCount,
    history,
    ocrText,
    isLoadingOcr,
    robotoffQuestions,
    robotoffLogos,
    params,
    updateParams,
    next,
    submitPackagings,
    retry,
  };
}
