import type { Product } from "../../off";

export type ConflictField = "categories" | "labels" | "both";

export interface ConflictRule {
  tagId: string;
  field: ConflictField;
  tag1: string;
  tag2: string;
  cleanTag1: string;
  cleanTag2: string;
  title: string;
  description?: string;
  count?: number;
}

export interface LogicBombProduct {
  code: string;
  product_name?: string;
  brands?: string;
  categories?: string;
  categories_tags?: string[];
  labels?: string;
  labels_tags?: string[];
  images?: Product["images"];
  image_front_url?: string;
}

export interface FacetTagItem {
  id: string;
  name: string;
  products?: number;
  known?: number;
  url?: string;
}

export interface FacetResponse {
  count?: number;
  tags?: FacetTagItem[];
}
