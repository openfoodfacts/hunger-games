import axios from "axios";
import robotoff from "../../robotoff";
import rawBrandImagesMap from "./brandImagesMap.json";
import rawBrandsData from "./brandsData.json";

export type ProjectId =
  | "openfoodfacts"
  | "openbeautyfacts"
  | "openpetfoodfacts"
  | "openproductsfacts";

export interface ProjectConfig {
  id: ProjectId;
  name: string;
  domain: string;
  worldUrl: string;
  staticUrl: string;
  hasRobotoff: boolean;
  color: string;
}

export const PROJECTS: Record<ProjectId, ProjectConfig> = {
  openfoodfacts: {
    id: "openfoodfacts",
    name: "Open Food Facts",
    domain: "openfoodfacts.org",
    worldUrl: "https://world.openfoodfacts.org",
    staticUrl: "https://static.openfoodfacts.org",
    hasRobotoff: true,
    color: "#e65100",
  },
  openbeautyfacts: {
    id: "openbeautyfacts",
    name: "Open Beauty Facts",
    domain: "openbeautyfacts.org",
    worldUrl: "https://world.openbeautyfacts.org",
    staticUrl: "https://static.openbeautyfacts.org",
    hasRobotoff: false,
    color: "#c2185b",
  },
  openpetfoodfacts: {
    id: "openpetfoodfacts",
    name: "Open Pet Food Facts",
    domain: "openpetfoodfacts.org",
    worldUrl: "https://world.openpetfoodfacts.org",
    staticUrl: "https://static.openpetfoodfacts.org",
    hasRobotoff: false,
    color: "#2e7d32",
  },
  openproductsfacts: {
    id: "openproductsfacts",
    name: "Open Products Facts",
    domain: "openproductsfacts.org",
    worldUrl: "https://world.openproductsfacts.org",
    staticUrl: "https://static.openproductsfacts.org",
    hasRobotoff: false,
    color: "#1565c0",
  },
};

export interface BrandItem {
  name: string;
  slug: string;
  products: number;
  opportunities: number;
  isTaxonomized: boolean;
  wikidata?: string | null;
  imageUrl?: string | null;
}

interface RawBrand {
  n: string;
  s: string;
  p: number;
  q: number;
  t: number;
  w?: string | null;
}

const brandImagesMap: Record<string, string> = rawBrandImagesMap;

export function normalizeBrandKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getBrandImageUrl(
  name: string,
  slug?: string,
): string | undefined {
  const normName = normalizeBrandKey(name);
  let filename = brandImagesMap[normName];
  if (!filename && slug) {
    const normSlug = normalizeBrandKey(slug);
    filename = brandImagesMap[normSlug];
  }
  if (!filename) {
    return undefined;
  }
  return `https://raw.githubusercontent.com/openfoodfacts/brand-images/refs/heads/main/xx/brands/${encodeURIComponent(
    filename,
  )}`;
}

/**
 * Load initial Open Food Facts cached brands
 */
export function getInitialOFFBrands(): BrandItem[] {
  return (rawBrandsData as RawBrand[]).map((b) => ({
    name: b.n,
    slug: b.s,
    products: b.p,
    opportunities: b.q,
    isTaxonomized: b.t === 1,
    wikidata: b.w ?? undefined,
    imageUrl: getBrandImageUrl(b.n, b.s),
  }));
}

/**
 * Fetch Robotoff unanswered brand questions with aggressive local storage caching
 */
export async function fetchRobotoffBrandOpportunities(
  countryCode?: string,
  count = 200,
): Promise<Record<string, number>> {
  const cacheKey = `brandinator_opportunities_${countryCode || "world"}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as {
        timestamp: number;
        data: Record<string, number>;
      };
      // 30 minute cache validity
      if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
        return parsed.data;
      }
    }
  } catch {
    // ignore localStorage errors
  }

  try {
    const response = await robotoff.getUnansweredValues({
      type: "brand",
      campaign: "",
      countryCode: countryCode === "world" ? "" : countryCode || "",
      page: 1,
      count,
    });

    const questions = response.data.questions || [];
    const resultMap: Record<string, number> = {};
    for (const [tag, num] of questions) {
      resultMap[tag.toLowerCase()] = num;
      resultMap[normalizeBrandKey(tag)] = num;
    }

    try {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ timestamp: Date.now(), data: resultMap }),
      );
    } catch {
      // ignore localStorage quota error
    }

    return resultMap;
  } catch (err) {
    console.warn("Failed to fetch Robotoff brand opportunities:", err);
    return {};
  }
}

/**
 * Fetch static brand taxonomy for a project
 */
export async function fetchProjectBrandTaxonomy(
  project: ProjectConfig,
): Promise<
  Record<
    string,
    { name?: Record<string, string>; wikidata?: Record<string, string> }
  >
> {
  const cacheKey = `brandinator_taxonomy_${project.id}`;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached) as Record<
        string,
        { name?: Record<string, string>; wikidata?: Record<string, string> }
      >;
    }
  } catch {
    // ignore
  }

  try {
    const res = await axios.get<
      Record<
        string,
        { name?: Record<string, string>; wikidata?: Record<string, string> }
      >
    >(`${project.staticUrl}/data/taxonomies/brands.json`, { timeout: 10000 });
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(res.data));
    } catch {
      // ignore
    }
    return res.data;
  } catch (err) {
    console.warn(`Could not load taxonomy for ${project.id}:`, err);
    return {};
  }
}

/**
 * Fetch facet brands for sister projects (Open Beauty Facts, Open Pet Food Facts, Open Products Facts)
 */
export async function fetchProjectFacetsBrands(
  project: ProjectConfig,
  filter?: string,
): Promise<BrandItem[]> {
  const cacheKey = `brandinator_facets_${project.id}_${filter || ""}`;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached) as BrandItem[];
    }
  } catch {
    // ignore
  }

  const url = filter
    ? `${project.worldUrl}/facets/brands.json?filter=${encodeURIComponent(
        filter,
      )}`
    : `${project.worldUrl}/facets/brands.json`;

  const [facetsRes, taxonomy] = await Promise.all([
    axios
      .get<{
        tags?: {
          id: string;
          name: string;
          products: number;
          known?: number;
          url?: string;
        }[];
      }>(url, { timeout: 12000 })
      .catch((err) => {
        console.warn(`Could not load facets for ${project.id}:`, err);
        return { data: { tags: [] } };
      }),
    fetchProjectBrandTaxonomy(project),
  ]);

  const tags = facetsRes.data.tags || [];

  const items: BrandItem[] = tags.map((t) => {
    const cleanId = t.id.includes(":") ? t.id.split(":", 2)[1] : t.id;
    const taxEntry = taxonomy[t.id] || taxonomy[`xx:${cleanId}`];
    const taxName =
      taxEntry?.name?.xx || taxEntry?.name?.en || taxEntry?.name?.fr;
    const wikidata = taxEntry?.wikidata?.en;

    const displayName = taxName || t.name || cleanId;
    return {
      name: displayName,
      slug: cleanId,
      products: t.products || 0,
      opportunities: 0,
      isTaxonomized: Boolean(taxEntry || t.known === 1),
      wikidata,
      imageUrl: getBrandImageUrl(displayName, cleanId),
    };
  });

  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(items));
  } catch {
    // ignore
  }

  return items;
}
