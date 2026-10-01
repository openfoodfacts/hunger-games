export interface BookProduct {
  code: string;
  product_name?: string;
  product_name_en?: string;
  product_name_fr?: string;
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
}

export type PrefixFilter = "all" | "978" | "979";

export interface BookActionHistory {
  code: string;
  productName: string;
  action: "moved" | "not_a_book" | "skipped";
  timestamp: number;
}
