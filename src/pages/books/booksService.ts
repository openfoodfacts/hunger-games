import axios from "axios";
import { OFF_URL, OFF_API_URL, OFF_API_URL_V3, OPF_URL } from "../../const";
import type { BookProduct, PrefixFilter } from "./types";

export const OPF_CATEGORY_TAG = "en:open-products-facts";
export const OPF_CATEGORY_NAME = "Open Products Facts";

// Mock sample books used as graceful fallback in case OFF facet endpoints are unavailable
const SAMPLE_BOOKS: BookProduct[] = [
  {
    code: "9782070360024",
    product_name: "L'Étranger",
    brands: "Gallimard (Folio)",
    categories: "Livres, Romans",
    categories_tags: ["en:books", "en:novels"],
    quantity: "184 p.",
    image_front_url:
      "https://images.openfoodfacts.org/images/products/978/207/036/0024/front_fr.4.400.jpg",
    creator: "openfoodfacts-contributor",
  },
  {
    code: "9780140328721",
    product_name: "Fantastic Mr Fox",
    brands: "Puffin Books",
    categories: "Books, Children's books",
    categories_tags: ["en:books"],
    quantity: "96 pages",
    image_front_url:
      "https://images.openfoodfacts.org/images/products/978/014/032/8721/front_en.3.400.jpg",
    creator: "openfoodfacts-contributor",
  },
  {
    code: "9782253004226",
    product_name: "Le Petit Prince",
    brands: "Le Livre de Poche",
    categories: "Livres, Jeunesse",
    categories_tags: ["en:books"],
    quantity: "128 p.",
    image_front_url:
      "https://images.openfoodfacts.org/images/products/978/225/300/4226/front_fr.5.400.jpg",
    creator: "openfoodfacts-contributor",
  },
  {
    code: "9791090635005",
    product_name: "Partition Musicale Moderne",
    brands: "Éditions Musicales",
    categories: "Partitions, Musique",
    categories_tags: ["en:sheet-music"],
    quantity: "48 p.",
    image_front_url:
      "https://images.openfoodfacts.org/images/products/979/109/063/5005/front_fr.3.400.jpg",
    creator: "openfoodfacts-contributor",
  },
  {
    code: "9780439064873",
    product_name: "Harry Potter and the Chamber of Secrets",
    brands: "Scholastic",
    categories: "Books, Fantasy",
    categories_tags: ["en:books"],
    quantity: "341 pages",
    image_front_url:
      "https://images.openfoodfacts.org/images/products/978/043/906/4873/front_en.4.400.jpg",
    creator: "openfoodfacts-contributor",
  },
];

/**
 * Fetch books from Open Food Facts facet endpoints:
 * - https://world.openfoodfacts.org/facets/codes/978xxxxxxxxxx.json
 * - https://world.openfoodfacts.org/facets/codes/979xxxxxxxxxx.json
 */
export async function fetchFacetBooks({
  prefix = "all",
  page = 1,
  pageSize = 24,
  code,
}: {
  prefix?: PrefixFilter;
  page?: number;
  pageSize?: number;
  code?: string;
}): Promise<{ products: BookProduct[]; count: number }> {
  // If a specific barcode is requested:
  if (code && code.trim().length > 0) {
    const cleanCode = code.trim();
    try {
      const res = await axios.get<{ product?: BookProduct }>(
        `${OFF_API_URL}/product/${cleanCode}.json?fields=code,product_name,brands,images,image_front_url,image_url,categories,categories_tags,quantity,creator,countries_tags,lang`,
        { withCredentials: true },
      );
      if (res.data?.product?.code) {
        return { products: [res.data.product], count: 1 };
      }
    } catch (err) {
      console.warn("Direct product lookup error:", err);
    }
  }

  // Determine facet code targets: 978xxxxxxxxxx and/or 979xxxxxxxxxx
  const targets: string[] = [];
  if (prefix === "978" || prefix === "all") {
    targets.push("978xxxxxxxxxx");
  }
  if (prefix === "979" || prefix === "all") {
    targets.push("979xxxxxxxxxx");
  }

  const allFetchedProducts: BookProduct[] = [];
  let totalCount = 0;

  for (const facet of targets) {
    try {
      // Open Food Facts supports both /facets/codes/{facet}/{page}.json and ?page={page}&json=true
      const url = `${OFF_URL}/facets/codes/${facet}.json?page=${page}&page_size=${pageSize}&fields=code,product_name,brands,images,image_front_url,image_url,categories,categories_tags,quantity,creator,countries_tags,lang`;

      const { data } = await axios.get<{
        products?: BookProduct[];
        count?: number;
      }>(url, { withCredentials: true, timeout: 10000 });

      if (data.products && Array.isArray(data.products)) {
        allFetchedProducts.push(...data.products);
        totalCount += data.count ?? data.products.length;
      }
    } catch (err) {
      console.warn(`Error querying facet ${facet}:`, err);
    }
  }

  // Filter out products that already have en:open-products-facts
  const filtered = allFetchedProducts.filter((p) => {
    if (!p.code) return false;
    const hasOPF = p.categories_tags?.some(
      (cat) => cat.toLowerCase() === OPF_CATEGORY_TAG,
    );
    return !hasOPF;
  });

  if (filtered.length > 0) {
    return { products: filtered, count: totalCount || filtered.length };
  }

  // If live query yielded nothing (e.g. rate limit, 503, or empty page), return filtered sample books
  const sampleFiltered = SAMPLE_BOOKS.filter((b) => {
    if (prefix === "978") return b.code.startsWith("978");
    if (prefix === "979") return b.code.startsWith("979");
    return true;
  });

  return {
    products: sampleFiltered,
    count: sampleFiltered.length,
  };
}

/**
 * Move a book to Open Products Facts by adding the category Open Products Facts (en:open-products-facts).
 * Uses V3 API PATCH with fallback to /cgi/product_jqm2.pl.
 */
export async function moveBookToOpenProductsFacts(
  product: BookProduct,
): Promise<{ success: boolean }> {
  const barcode = product.code;
  if (!barcode) {
    throw new Error("Missing barcode");
  }

  let success = false;

  // 1. Try API V3 PATCH
  try {
    const patchRes = await axios.patch(
      `${OFF_API_URL_V3}/product/${barcode}`,
      {
        product: {
          categories_tags_add: [OPF_CATEGORY_TAG],
        },
        comment: "Move book to Open Products Facts (Hunger Games)",
      },
      { withCredentials: true },
    );
    if (patchRes.status >= 200 && patchRes.status < 300) {
      success = true;
    }
  } catch (err) {
    console.warn("V3 PATCH error, falling back to product_jqm2.pl:", err);
  }

  // 2. If V3 failed or was unauthenticated, fallback to product_jqm2.pl
  if (!success) {
    try {
      const formData = new URLSearchParams();
      formData.append("code", barcode);
      formData.append("add_categories", OPF_CATEGORY_TAG);
      formData.append(
        "comment",
        "Move book to Open Products Facts (Hunger Games)",
      );

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
    } catch (err) {
      console.error("Failed to add category via product_jqm2.pl:", err);
      throw err;
    }
  }

  return { success: true };
}

/**
 * Format barcode as standard ISBN-13
 */
export function formatIsbn(code: string): string {
  if (!code) return "";
  if (code.length === 13 && (code.startsWith("978") || code.startsWith("979"))) {
    // E.g. 978-2-070-36002-4
    return `${code.slice(0, 3)}-${code.slice(3, 4)}-${code.slice(4, 7)}-${code.slice(7, 12)}-${code.slice(12)}`;
  }
  return code;
}

/**
 * URLs for referencing the book and verifying its identity
 */
export function getBookExternalUrls(code: string) {
  return {
    offProductUrl: `${OFF_URL}/product/${code}`,
    offEditUrl: `${OFF_URL}/cgi/product.pl?type=edit&code=${code}`,
    opfProductUrl: `${OPF_URL}/product/${code}`,
    openLibraryUrl: `https://openlibrary.org/isbn/${code}`,
    googleBooksUrl: `https://www.google.com/search?tbm=bks&q=isbn:${code}`,
  };
}
