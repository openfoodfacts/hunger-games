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
  label: string;
  description: string;
}

export const QUANTITY_WARNING_OPTIONS: QuantityWarningOption[] = [
  {
    id: "all",
    tag: "",
    label: "Toutes les anomalies de quantité",
    description:
      "Parcourir l'ensemble des anomalies et alertes sur les quantités",
  },
  {
    id: "quantity-not-recognized",
    tag: "quantity-not-recognized",
    label: "Quantité non reconnue (sans unité, typo...)",
    description:
      "La quantité est renseignée mais l'unité est manquante ou le format n'est pas reconnu (ex: 80, 125, 1/2 gallon)",
  },
  {
    id: "serving-quantity-over-product-quantity",
    tag: "serving-quantity-over-product-quantity",
    label: "Portion supérieure à la quantité totale",
    description:
      "La portion renseignée dépasse le poids ou volume net total du produit (ex: portion de 100g sur un produit de 30g)",
  },
  {
    id: "product-quantity-over-10kg",
    tag: "product-quantity-over-10kg",
    label: "Quantité > 10 kg (potentielle erreur d'échelle)",
    description:
      "Quantité anormalement élevée, souvent due à une saisie en grammes avec des zéros en trop (ex: 500000 g)",
  },
  {
    id: "product-quantity-under-1g",
    tag: "product-quantity-under-1g",
    label: "Quantité < 1 g (potentielle erreur d'échelle)",
    description:
      "Quantité anormalement faible, souvent due à une mauvaise virgule (ex: 0.05 g au lieu de 50 g)",
  },
  {
    id: "serving-quantity-defined-but-quantity-undefined",
    tag: "serving-quantity-defined-but-quantity-undefined",
    label: "Portion définie mais quantité totale manquante",
    description:
      "Une taille de portion est précisée mais la contenance totale du produit n'est pas renseignée",
  },
  {
    id: "product-quantity-in-mg",
    tag: "product-quantity-in-mg",
    label: "Quantité en mg",
    description:
      "La quantité globale du produit est exprimée en milligrammes au lieu de grammes",
  },
  {
    id: "serving-quantity-less-than-product-quantity-divided-by-1000",
    tag: "serving-quantity-less-than-product-quantity-divided-by-1000",
    label: "Portion < Quantité / 1000",
    description:
      "La portion est disproportionnellement petite par rapport au produit total",
  },
  {
    id: "serving-quantity-over-500g",
    tag: "serving-quantity-over-500g",
    label: "Portion > 500 g",
    description:
      "La portion individuelle dépasse 500 g, souvent confondue avec le poids du produit entier",
  },
  {
    id: "serving-quantity-under-1g",
    tag: "serving-quantity-under-1g",
    label: "Portion < 1 g",
    description: "La portion indiquée est inférieure à 1 g",
  },
  {
    id: "nutrition-data-per-serving-serving-quantity-is-not-recognized",
    tag: "nutrition-data-per-serving-serving-quantity-is-not-recognized",
    label: "Portion non reconnue",
    description:
      "La taille de portion n'a pas pu être convertie en valeur chiffrée avec unité",
  },
];
