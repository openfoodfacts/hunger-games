import axios from "axios";
import { OFF_URL, OFF_API_URL, OFF_API_URL_V3 } from "../../const";
import { getFacetCodePattern, getGs1CountryByPrefix } from "./gs1Prefixes";
import type { CountryFilterMode, Gs1CountryConfig, Gs1Product } from "./types";

const PRODUCT_FIELDS = [
  "code",
  "product_name",
  "product_name_en",
  "brands",
  "images",
  "selected_images",
  "image_front_url",
  "image_ingredients_url",
  "image_nutrition_url",
  "image_packaging_url",
  "image_url",
  "categories",
  "categories_tags",
  "quantity",
  "creator",
  "countries",
  "countries_tags",
  "lang",
  "ingredients_text",
].join(",");

export function hasNoCountries(product: Gs1Product): boolean {
  return (
    !Array.isArray(product.countries_tags) ||
    product.countries_tags.length === 0
  );
}

function getMismatchPriorityScore(product: Gs1Product): number {
  const count = product.countries_tags?.length ?? 0;
  if (count === 1) return 0; // Single other country listed (e.g. VPN mismatch)
  if (count === 0) return 1; // No country listed at all
  return 2;
}

/**
 * Fetch products from Open Food Facts facet endpoint:
 * e.g. https://world.openfoodfacts.org/facets/codes/385xxxxxxxxxx/countries/-Croatia.json
 */
export async function fetchGs1Products({
  prefix,
  countryFilter = "all",
  page = 1,
  pageSize = 24,
  code,
  excludedCodes,
}: {
  prefix: string;
  countryFilter?: CountryFilterMode;
  page?: number;
  pageSize?: number;
  code?: string;
  excludedCodes?: Set<string>;
}): Promise<{
  products: Gs1Product[];
  count: number;
  nextPage: number;
  hasMore: boolean;
}> {
  const country = getGs1CountryByPrefix(prefix);

  // Direct barcode lookup
  if (code && code.trim().length > 0) {
    const cleanCode = code.trim();
    const res = await axios.get<{ product?: Gs1Product }>(
      `${OFF_API_URL}/product/${cleanCode}.json?fields=${PRODUCT_FIELDS}`,
      { withCredentials: true },
    );
    if (res.data?.product?.code) {
      return {
        products: [res.data.product],
        count: 1,
        nextPage: page + 1,
        hasMore: false,
      };
    }
    return { products: [], count: 0, nextPage: page + 1, hasMore: false };
  }

  const facetPattern = getFacetCodePattern(country.prefix);
  const maxPagesToScan = 5;
  let currentPage = page;
  let totalCount = 0;
  let hasMore = false;
  const collected: Gs1Product[] = [];

  for (let attempt = 0; attempt < maxPagesToScan; attempt++) {
    const url = `${OFF_URL}/facets/codes/${facetPattern}/countries/-${country.facetSlug}.json?page=${currentPage}&page_size=${pageSize}&fields=${PRODUCT_FIELDS}`;
    const { data } = await axios.get<{
      products?: Gs1Product[];
      count?: number;
    }>(url, { withCredentials: true, timeout: 10000 });

    const rawProducts = Array.isArray(data.products) ? data.products : [];
    totalCount = data.count ?? totalCount;

    const filtered = rawProducts.filter((p) => {
      if (!p.code) return false;
      if (excludedCodes?.has(p.code)) return false;

      const alreadyHasCountry = p.countries_tags?.some(
        (tag) => tag.toLowerCase() === country.countryTag.toLowerCase(),
      );
      if (alreadyHasCountry) return false;

      if (countryFilter === "none") {
        return hasNoCountries(p);
      }
      if (countryFilter === "other_only") {
        return !hasNoCountries(p);
      }
      return true;
    });

    collected.push(...filtered);
    currentPage += 1;
    hasMore = rawProducts.length >= pageSize;

    // Stop early if we found unreviewed products or reached the end of results
    if (collected.length > 0 || !hasMore) {
      break;
    }
  }

  collected.sort(
    (a, b) => getMismatchPriorityScore(a) - getMismatchPriorityScore(b),
  );

  return {
    products: collected,
    count: totalCount || collected.length,
    nextPage: currentPage,
    hasMore,
  };
}

interface OffWriteResponse {
  status?: number | string;
  status_verbose?: string;
  errors?: unknown[];
}

function isWriteSuccess(httpStatus: number, data?: OffWriteResponse): boolean {
  if (httpStatus < 200 || httpStatus >= 300) {
    return false;
  }
  if (!data) {
    return true;
  }
  if (data.status === 0 || data.status === "0" || data.status === "failure") {
    return false;
  }
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return false;
  }
  return true;
}

/**
 * Add the target country to the product's countries_tags.
 * Uses V3 API PATCH with fallback to /cgi/product_jqm2.pl.
 */
export async function addCountryToProduct(
  product: Gs1Product,
  country: Gs1CountryConfig,
): Promise<{ success: boolean }> {
  const barcode = product.code;
  if (!barcode) {
    throw new Error("Missing barcode");
  }

  const comment = `Add ${country.name} based on GS1 prefix ${country.prefix} (Hunger Games)`;
  let success = false;
  let lastErrorMessage = "";

  // 1. Try API V3 PATCH
  try {
    const patchRes = await axios.patch<OffWriteResponse>(
      `${OFF_API_URL_V3}/product/${barcode}`,
      {
        product: {
          countries_tags_add: [country.countryTag],
        },
        comment,
      },
      { withCredentials: true },
    );
    if (isWriteSuccess(patchRes.status, patchRes.data)) {
      success = true;
    } else if (patchRes.data?.status_verbose) {
      lastErrorMessage = patchRes.data.status_verbose;
    }
  } catch (err) {
    console.warn("V3 PATCH error, falling back to product_jqm2.pl:", err);
  }

  // 2. Fallback to product_jqm2.pl
  if (!success) {
    const formData = new URLSearchParams();
    formData.append("code", barcode);
    formData.append("add_countries", country.countryTag);
    formData.append("comment", comment);

    const postRes = await axios.post<OffWriteResponse>(
      `${OFF_URL}/cgi/product_jqm2.pl`,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        withCredentials: true,
      },
    );
    if (isWriteSuccess(postRes.status, postRes.data)) {
      success = true;
    } else {
      lastErrorMessage =
        postRes.data?.status_verbose ||
        lastErrorMessage ||
        "Failed to update product country";
    }
  }

  if (!success) {
    throw new Error(lastErrorMessage || "Failed to update product country");
  }

  return { success: true };
}

export function getGs1ExternalUrls(code: string, country: Gs1CountryConfig) {
  const facetPattern = getFacetCodePattern(country.prefix);
  return {
    offProductUrl: `${OFF_URL}/product/${code}`,
    offEditUrl: `${OFF_URL}/cgi/product.pl?type=edit&code=${code}`,
    offFacetUrl: `${OFF_URL}/facets/codes/${facetPattern}/countries/-${country.facetSlug}`,
  };
}
