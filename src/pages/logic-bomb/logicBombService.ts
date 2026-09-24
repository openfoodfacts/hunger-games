import axios from "axios";
import { OFF_URL, OFF_SEARCH, OFF_API_URL_V3 } from "../../const";
import type {
  ConflictRule,
  LogicBombProduct,
  FacetResponse,
  ConflictField,
} from "./logicBombTypes";

// Curated list of all 27 mutually exclusive rules from Open Food Facts data_quality taxonomy
export const RAW_FALLBACK_RULES: { raw: string; desc: string }[] = [
  // Labels
  {
    raw: "en: mutually exclusive tags for labels contains-palm-oil and labels no-palm-oil",
    desc: "A product cannot simultaneously contain palm oil and be palm oil-free.",
  },
  {
    raw: "en: mutually exclusive tags for labels contains-gluten and labels no-gluten",
    desc: "A product cannot simultaneously contain gluten and be gluten-free.",
  },
  {
    raw: "en: mutually exclusive tags for labels contains-alcohol and labels no-alcohol",
    desc: "A product cannot simultaneously contain alcohol and be alcohol-free.",
  },
  {
    raw: "en: mutually exclusive tags for labels contains-lactose and labels no-lactose",
    desc: "A product cannot simultaneously contain lactose and be lactose-free.",
  },
  {
    raw: "en: mutually exclusive tags for labels contains-soy and labels no-soy",
    desc: "A product cannot simultaneously contain soy and be soy-free.",
  },
  {
    raw: "en: mutually exclusive tags for labels vegan and labels non-vegan",
    desc: "A product cannot simultaneously be vegan and non-vegan.",
  },
  {
    raw: "en: mutually exclusive tags for labels vegetarian and labels non-vegetarian",
    desc: "A product cannot simultaneously be vegetarian and non-vegetarian.",
  },
  {
    raw: "en: mutually exclusive tags for labels organic and labels non-organic",
    desc: "A product cannot simultaneously be organic and non-organic.",
  },
  {
    raw: "en: mutually exclusive tags for labels fair-trade and labels non-fair-trade",
    desc: "A product cannot simultaneously be fair trade and non-fair trade.",
  },
  {
    raw: "en: mutually exclusive tags for labels no-additives and labels with-additives",
    desc: "A product cannot simultaneously be additive-free and contain additives.",
  },
  {
    raw: "en: mutually exclusive tags for labels pasteurized and labels unpasteurized",
    desc: "A product cannot simultaneously be pasteurized and unpasteurized.",
  },
  {
    raw: "en: mutually exclusive tags for labels filtered and labels unfiltered",
    desc: "A product cannot simultaneously be filtered and unfiltered.",
  },
  {
    raw: "en: mutually exclusive tags for labels contains-gmos and labels no-gmos",
    desc: "A product cannot simultaneously contain GMOs and be GMO-free.",
  },
  // Categories
  {
    raw: "en: mutually exclusive tags for categories salty snacks and categories sweet snacks",
    desc: "A product cannot be both a salty snack and a sweet snack.",
  },
  {
    raw: "en: mutually exclusive tags for categories fruits and categories vegetables",
    desc: "A product cannot be both a fruit and a vegetable category.",
  },
  {
    raw: "en: mutually exclusive tags for categories dairies and categories dairy substitutes",
    desc: "A product cannot be both a dairy product and a dairy substitute.",
  },
  {
    raw: "en: mutually exclusive tags for categories meat and categories meat analogues",
    desc: "A product cannot be both real meat and a meat analogue / plant meat.",
  },
  {
    raw: "en: mutually exclusive tags for categories alcoholic beverages and categories non-alcoholic beverages",
    desc: "A product cannot be both an alcoholic beverage and a non-alcoholic beverage.",
  },
  {
    raw: "en: mutually exclusive tags for categories hard cheeses and categories soft cheeses",
    desc: "A product cannot be both a hard cheese and a soft cheese.",
  },
  {
    raw: "en: mutually exclusive tags for categories semi-skimmed-milks and categories whole milks",
    desc: "A product cannot be both semi-skimmed and whole milk.",
  },
  {
    raw: "en: mutually exclusive tags for categories skimmed milks and categories whole milks",
    desc: "A product cannot be both skimmed milk and whole milk.",
  },
  {
    raw: "en: mutually exclusive tags for categories pasteurised products and categories unpasteurised products",
    desc: "A product cannot be both pasteurized and unpasteurized category.",
  },
  {
    raw: "en: mutually exclusive tags for categories ground peppers and categories peppercorns",
    desc: "A product cannot be both ground pepper and whole peppercorns.",
  },
  {
    raw: "en: mutually exclusive tags for categories long grain rices and categories medium grain rices",
    desc: "Rice cannot be both long grain and medium grain.",
  },
  {
    raw: "en: mutually exclusive tags for categories long grain rices and categories short grain rices",
    desc: "Rice cannot be both long grain and short grain.",
  },
  {
    raw: "en: mutually exclusive tags for categories medium grain rices and categories short grain rices",
    desc: "Rice cannot be both medium grain and short grain.",
  },
  {
    raw: "en: mutually exclusive tags for categories beverages and beverages preparations and categories meals",
    desc: "A product cannot be both a beverage preparation and a meal.",
  },
];

export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

export const cleanTagName = (tag: string): string => {
  const withoutPrefix = tag.replace(/^[a-z]{2}:/, "");
  return withoutPrefix.replace(/[-_]/g, " ").trim();
};

export const parseConflictRule = (
  tagId: string,
  _name?: string,
  products?: number,
  fallbackDesc?: string,
): ConflictRule | null => {
  const normalizedId = tagId.trim();
  const clean = normalizedId.replace(/^[a-z]{2}:/, "");

  // Match mutually-exclusive-tags-for-(categories|labels)-(.*)-and-(categories|labels)-(.*)
  const regex =
    /^mutually-exclusive-tags-for-(categories|labels)-(.*?)-and-(categories|labels)-(.*)$/;
  const match = clean.match(regex);

  if (!match) {
    // Attempt relaxed match if id differs slightly
    const relaxed = clean.match(
      /^mutually[-_ ]exclusive.*?for[-_ ](categories|labels)?[-_ ]?(.*?)[-_ ]and[-_ ](categories|labels)?[-_ ]?(.*)$/,
    );
    if (!relaxed) return null;
    const f1 = (relaxed[1] || "categories") as "categories" | "labels";
    const t1 = relaxed[2];
    const t2 = relaxed[4];
    const c1 = cleanTagName(t1);
    const c2 = cleanTagName(t2);
    return {
      tagId: normalizedId,
      field: f1,
      tag1: t1.includes(":") ? t1 : `en:${t1.replace(/\s+/g, "-")}`,
      tag2: t2.includes(":") ? t2 : `en:${t2.replace(/\s+/g, "-")}`,
      cleanTag1: c1,
      cleanTag2: c2,
      title: `${capitalize(c1)} vs. ${capitalize(c2)}`,
      description:
        fallbackDesc ||
        `These two ${f1} cannot both appear on the same product.`,
      count: products,
    };
  }

  const field1 = match[1] as "categories" | "labels";
  const rawTag1 = match[2];
  const field2 = match[3] as "categories" | "labels";
  const rawTag2 = match[4];

  const field: ConflictField = field1 === field2 ? field1 : "both";
  const cleanTag1 = cleanTagName(rawTag1);
  const cleanTag2 = cleanTagName(rawTag2);

  return {
    tagId: normalizedId,
    field,
    tag1: rawTag1.includes(":") ? rawTag1 : `en:${rawTag1}`,
    tag2: rawTag2.includes(":") ? rawTag2 : `en:${rawTag2}`,
    cleanTag1,
    cleanTag2,
    title: `${capitalize(cleanTag1)} vs. ${capitalize(cleanTag2)}`,
    description:
      fallbackDesc ||
      `These two ${field} cannot both appear on the same product.`,
    count: products,
  };
};

export const INITIAL_CONFLICT_RULES: ConflictRule[] = RAW_FALLBACK_RULES.map(
  (item) => {
    const tagId = item.raw
      .replace(/^en:\s*/, "en:")
      .replace(/\s+/g, "-")
      .toLowerCase();
    const parsed = parseConflictRule(tagId, undefined, undefined, item.desc);
    if (parsed) return parsed;
    return {
      tagId,
      field: item.raw.includes("categories") ? "categories" : "labels",
      tag1: "tag1",
      tag2: "tag2",
      cleanTag1: "Tag 1",
      cleanTag2: "Tag 2",
      title: item.raw,
      description: item.desc,
    };
  },
);

/**
 * Fetch mutually exclusive facets from Open Food Facts.
 * Falls back to curated static list when endpoint is blocked or unavailable.
 */
export async function fetchMutuallyExclusiveRules(): Promise<ConflictRule[]> {
  const url = `${OFF_URL}/facets/data-quality-errors.json?filter=mutually`;

  try {
    const res = await axios.get<FacetResponse>(url, {
      timeout: 8000,
      withCredentials: true,
      headers: {
        Accept: "application/json",
      },
    });

    if (res.data?.tags && Array.isArray(res.data.tags)) {
      const parsedRules: ConflictRule[] = [];
      const seenTagIds = new Set<string>();

      for (const facetTag of res.data.tags) {
        if (!facetTag.id) continue;
        const parsed = parseConflictRule(
          facetTag.id,
          facetTag.name,
          facetTag.products,
        );
        if (parsed) {
          parsedRules.push(parsed);
          seenTagIds.add(parsed.tagId);
        }
      }

      // Merge with initial rules for completeness
      for (const fallback of INITIAL_CONFLICT_RULES) {
        if (!seenTagIds.has(fallback.tagId)) {
          parsedRules.push(fallback);
        }
      }

      if (parsedRules.length > 0) {
        return parsedRules;
      }
    }
  } catch (error) {
    console.warn(
      "Could not load dynamic facet list, using fallback rules:",
      error,
    );
  }

  return INITIAL_CONFLICT_RULES;
}

/**
 * Fetch products affected by a given mutually exclusive conflict tag.
 */
export async function fetchConflictProducts(
  conflictTagId: string,
  page = 1,
  pageSize = 20,
): Promise<{ products: LogicBombProduct[]; totalCount: number }> {
  const searchUrl = `${OFF_SEARCH}?action=process&json=1&page=${page}&page_size=${pageSize}&fields=code,product_name,brands,categories,categories_tags,labels,labels_tags,images,image_front_url&tagtype_0=data_quality_errors&tag_contains_0=contains&tag_0=${encodeURIComponent(
    conflictTagId,
  )}`;

  const res = await axios.get<{
    count?: number;
    products?: LogicBombProduct[];
  }>(searchUrl, {
    timeout: 12000,
    withCredentials: true,
  });

  return {
    products: res.data?.products || [],
    totalCount: res.data?.count || 0,
  };
}

/**
 * Send patch to Open Food Facts API v3 to fix the categories / labels.
 */
export async function saveProductLogicFix(
  code: string,
  updates: {
    categories?: string;
    labels?: string;
  },
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await axios.patch(
      `${OFF_API_URL_V3}/product/${code}`,
      { product: updates },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (res.status >= 200 && res.status < 300) {
      return { success: true };
    }
    return {
      success: false,
      message: `Server returned status ${res.status}`,
    };
  } catch (error: unknown) {
    let msg = "Failed to update product";
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as Record<string, unknown> | undefined;
      const statusVerbose =
        typeof data?.status_verbose === "string" ? data.status_verbose : "";
      const serverMsg = typeof data?.message === "string" ? data.message : "";
      msg = statusVerbose || serverMsg || error.message || msg;
    } else if (error instanceof Error) {
      msg = error.message;
    }
    return { success: false, message: msg };
  }
}

/**
 * Helper to check if a specific tag is in a product's tags list or comma string
 */
export function matchesTag(
  candidateTag: string,
  targetTagId: string,
  targetCleanTag: string,
): boolean {
  const normCandidate = candidateTag
    .trim()
    .toLowerCase()
    .replace(/^[a-z]{2}:/, "");
  const normTarget = targetTagId
    .trim()
    .toLowerCase()
    .replace(/^[a-z]{2}:/, "");
  const normClean = targetCleanTag.trim().toLowerCase().replace(/\s+/g, "-");

  return (
    normCandidate === normTarget ||
    normCandidate === normClean ||
    normCandidate.includes(normClean) ||
    normClean.includes(normCandidate)
  );
}

/**
 * Normalizes a list of tags / text after removing a conflicting tag.
 */
export function removeTagFromList(
  tags: string[],
  tagToRemove: string,
  cleanTagToRemove: string,
): string[] {
  return tags.filter((t) => !matchesTag(t, tagToRemove, cleanTagToRemove));
}

/**
 * Replaces or removes a tag inside a raw comma-separated text string.
 */
export function removeTagFromText(
  text: string,
  tagToRemove: string,
  cleanTagToRemove: string,
): string {
  if (!text) return "";
  const parts = text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const filtered = parts.filter(
    (p) => !matchesTag(p, tagToRemove, cleanTagToRemove),
  );
  return filtered.join(", ");
}
