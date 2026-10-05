import type { ProductV3 } from "@openfoodfacts/openfoodfacts-nodejs";
import type { ProductImage } from "../../off";

export type EditablePackagingComponent = {
  id: string;
  numberOfUnits: number | string;
  shape: string | null;
  shapeName?: string;
  material: string | null;
  materialName?: string;
  recycling: string | null;
  recyclingName?: string;
};

export type PackagingWrite = {
  number_of_units?: number;
  shape?: { id: string };
  material?: { id: string };
  recycling?: { id: string };
};

export type ProductDescription = Pick<
  ProductV3,
  | "code"
  | "image_packaging_url"
  | "packagings"
  | "product_name"
  | "quantity"
  | "categories_tags"
  | "labels_tags"
  | "ingredients_text"
  | "creator"
  | "countries"
> & {
  code: string;
  images?: Record<string, ProductImage | string>;
  selected_images?: Record<string, unknown>;
  unique_scans_n?: number;
};

export type ShapeOption = {
  id: string;
  label: string;
  icon?: string;
  emoji?: string;
};

export type MaterialOption = {
  id: string;
  label: string;
  category: "gentle" | "resin" | "metal" | "wood" | "glass" | "paper";
  color?: string;
  icon?: string;
  emoji?: string;
  badge?: string;
};

export type RecyclingOption = {
  id: string;
  label: string;
  color: "success" | "warning" | "error" | "info" | "default";
  icon?: string;
  emoji?: string;
};

export type PresetCombo = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  badge?: string;
  components: Array<{
    numberOfUnits: number | string;
    shape: string;
    shapeName: string;
    material: string;
    materialName: string;
    recycling?: string;
    recyclingName?: string;
  }>;
};

export type DetectedPackagingItem = {
  source: "ocr" | "category" | "label" | "quantity" | "robotoff";
  confidence: "high" | "medium" | "low";
  description: string;
  numberOfUnits?: number;
  shape?: { id: string; name: string };
  material?: { id: string; name: string };
  recycling?: { id: string; name: string };
};

export type OcrAnalysisResult = {
  fullText: string;
  detectedItems: DetectedPackagingItem[];
  shapesFound: string[];
  materialsFound: string[];
  recyclingsFound: string[];
  suggestedQuantityUnits?: number;
};
