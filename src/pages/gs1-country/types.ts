export interface Gs1CountryConfig {
  prefix: string;
  countryTag: string;
  facetSlug: string;
  name: string;
  flag: string;
  expectedLangs: string[];
}

export interface SelectedImageEntry {
  display?: Record<string, string>;
}

export interface Gs1Product {
  code: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  image_front_url?: string;
  image_front_small_url?: string;
  image_ingredients_url?: string;
  image_nutrition_url?: string;
  image_packaging_url?: string;
  image_url?: string;
  image_small_url?: string;
  selected_images?: {
    front?: SelectedImageEntry;
    ingredients?: SelectedImageEntry;
    nutrition?: SelectedImageEntry;
    packaging?: SelectedImageEntry;
  };
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

export type CountryFilterMode = "all" | "other_only" | "none";

export interface Gs1ActionHistory {
  code: string;
  productName: string;
  countryName: string;
  countryTag: string;
  action: "added" | "rejected" | "skipped";
  timestamp: number;
}
