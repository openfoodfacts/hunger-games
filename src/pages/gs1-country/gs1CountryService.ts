import axios from "axios";
import { OFF_URL, OFF_API_URL, OFF_API_URL_V3 } from "../../const";
import { getFacetCodePattern, getGs1CountryByPrefix } from "./gs1Prefixes";
import type { Gs1CountryConfig, Gs1Product, VpnFilterMode } from "./types";

const PRODUCT_FIELDS = [
  "code",
  "product_name",
  "product_name_en",
  "brands",
  "images",
  "image_front_url",
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

export function isOnlyUnitedStates(product: Gs1Product): boolean {
  return (
    Array.isArray(product.countries_tags) &&
    product.countries_tags.length === 1 &&
    product.countries_tags[0] === "en:united-states"
  );
}

export function hasUnitedStates(product: Gs1Product): boolean {
  return (
    Array.isArray(product.countries_tags) &&
    product.countries_tags.includes("en:united-states")
  );
}

function getUsPriorityScore(product: Gs1Product): number {
  if (isOnlyUnitedStates(product)) return 0;
  if (hasUnitedStates(product)) return 1;
  return 2;
}

/**
 * Fetch products from Open Food Facts facet endpoint:
 * e.g. https://world.openfoodfacts.org/facets/codes/385xxxxxxxxxx/countries/-Croatia.json
 */
export async function fetchGs1Products({
  prefix,
  vpnFilter = "all",
  page = 1,
  pageSize = 24,
  code,
}: {
  prefix: string;
  vpnFilter?: VpnFilterMode;
  page?: number;
  pageSize?: number;
  code?: string;
}): Promise<{ products: Gs1Product[]; count: number; nextPage: number }> {
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
      };
    }
    return { products: [], count: 0, nextPage: page + 1 };
  }

  const facetPattern = getFacetCodePattern(country.prefix);
  const maxPagesToScan = vpnFilter === "us_only" ? 5 : 1;
  let currentPage = page;
  let totalCount = 0;
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
      const alreadyHasCountry = p.countries_tags?.some(
        (tag) => tag.toLowerCase() === country.countryTag.toLowerCase(),
      );
      if (alreadyHasCountry) return false;

      if (vpnFilter === "us_only") {
        return hasUnitedStates(p);
      }
      return true;
    });

    collected.push(...filtered);
    currentPage += 1;

    // Stop early if we found enough products or reached the end of results
    if (collected.length > 0 || rawProducts.length < pageSize) {
      break;
    }
  }

  // Prioritize US-only (likely VPN) products first
  collected.sort((a, b) => getUsPriorityScore(a) - getUsPriorityScore(b));

  return {
    products: collected,
    count: totalCount || collected.length,
    nextPage: currentPage,
  };
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

  // 1. Try API V3 PATCH
  try {
    const patchRes = await axios.patch(
      `${OFF_API_URL_V3}/product/${barcode}`,
      {
        product: {
          countries_tags_add: [country.countryTag],
        },
        comment,
      },
      { withCredentials: true },
    );
    if (patchRes.status >= 200 && patchRes.status < 300) {
      success = true;
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

    const postRes = await axios.post(
      `${OFF_URL}/cgi/product_jqm2.pl`,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        withCredentials: true,
      },
    );
    if (postRes.status >= 200 && postRes.status < 300) {
      success = true;
    }
  }

  return { success };
}

export function getGs1ExternalUrls(code: string, country: Gs1CountryConfig) {
  const facetPattern = getFacetCodePattern(country.prefix);
  return {
    offProductUrl: `${OFF_URL}/product/${code}`,
    offEditUrl: `${OFF_URL}/cgi/product.pl?type=edit&code=${code}`,
    offFacetUrl: `${OFF_URL}/facets/codes/${facetPattern}/countries/-${country.facetSlug}`,
  };
}
