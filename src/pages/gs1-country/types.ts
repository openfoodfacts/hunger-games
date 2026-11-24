export interface Gs1CountryConfig {
  prefix: string;
  countryTag: string;
  facetSlug: string;
  name: string;
  flag: string;
  expectedLangs: string[];
}

export interface Gs1Product {
  code: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  image_front_url?: string;
  image_front_small_url?: string;
  image_url?: string;
  image_small_url?: string;
  images?: Record<string, unknown>;
  categories?: string;
  categories_tags?: string[];
  quantity?: string;
  creator?: string;
  countries?: string;
  countries_tags?: string[];
  lang?: string;
  ingredients_text?: string;
}

export type VpnFilterMode = "all" | "us_only";

export interface Gs1ActionHistory {
  code: string;
  productName: string;
  countryName: string;
  countryTag: string;
  action: "added" | "rejected" | "skipped";
  timestamp: number;
}
