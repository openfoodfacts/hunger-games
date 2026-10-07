export interface QuantityProduct {
  code: string;
  product_name?: string;
  brands?: string;
  quantity?: string;
  product_quantity?: number | string;
  product_quantity_unit?: string;
  serving_size?: string;
  serving_quantity?: number | string;
  serving_quantity_unit?: string;
  image_front_url?: string;
  image_nutrition_url?: string;
  image_ingredients_url?: string;
  image_packaging_url?: string;
  images?: Record<string, unknown>;
  countries_tags?: string[];
  data_quality_warnings_tags?: string[];
  data_quality_errors_tags?: string[];
}

export interface QuantityWarningOption {
  id: string;
  tag: string;
  labelKey: string;
  descriptionKey: string;
}

export const QUANTITY_WARNING_OPTIONS: QuantityWarningOption[] = [
  {
    id: "all",
    tag: "",
    labelKey: "quantities.warnings.all.label",
    descriptionKey: "quantities.warnings.all.description",
  },
  {
    id: "quantity-not-recognized",
    tag: "quantity-not-recognized",
    labelKey: "quantities.warnings.quantity_not_recognized.label",
    descriptionKey: "quantities.warnings.quantity_not_recognized.description",
  },
  {
    id: "serving-quantity-over-product-quantity",
    tag: "serving-quantity-over-product-quantity",
    labelKey: "quantities.warnings.serving_over_product.label",
    descriptionKey: "quantities.warnings.serving_over_product.description",
  },
  {
    id: "product-quantity-over-10kg",
    tag: "product-quantity-over-10kg",
    labelKey: "quantities.warnings.product_over_10kg.label",
    descriptionKey: "quantities.warnings.product_over_10kg.description",
  },
  {
    id: "product-quantity-under-1g",
    tag: "product-quantity-under-1g",
    labelKey: "quantities.warnings.product_under_1g.label",
    descriptionKey: "quantities.warnings.product_under_1g.description",
  },
  {
    id: "serving-quantity-defined-but-quantity-undefined",
    tag: "serving-quantity-defined-but-quantity-undefined",
    labelKey: "quantities.warnings.serving_without_product.label",
    descriptionKey: "quantities.warnings.serving_without_product.description",
  },
  {
    id: "product-quantity-in-mg",
    tag: "product-quantity-in-mg",
    labelKey: "quantities.warnings.product_in_mg.label",
    descriptionKey: "quantities.warnings.product_in_mg.description",
  },
  {
    id: "serving-quantity-less-than-product-quantity-divided-by-1000",
    tag: "serving-quantity-less-than-product-quantity-divided-by-1000",
    labelKey: "quantities.warnings.serving_under_product.label",
    descriptionKey: "quantities.warnings.serving_under_product.description",
  },
  {
    id: "serving-quantity-over-500g",
    tag: "serving-quantity-over-500g",
    labelKey: "quantities.warnings.serving_over_500g.label",
    descriptionKey: "quantities.warnings.serving_over_500g.description",
  },
  {
    id: "serving-quantity-under-1g",
    tag: "serving-quantity-under-1g",
    labelKey: "quantities.warnings.serving_under_1g.label",
    descriptionKey: "quantities.warnings.serving_under_1g.description",
  },
  {
    id: "nutrition-data-per-serving-serving-quantity-is-not-recognized",
    tag: "nutrition-data-per-serving-serving-quantity-is-not-recognized",
    labelKey: "quantities.warnings.serving_not_recognized.label",
    descriptionKey: "quantities.warnings.serving_not_recognized.description",
  },
];
