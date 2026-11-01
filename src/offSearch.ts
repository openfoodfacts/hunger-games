import { checkedJsonFetch } from "./utils/checkedFetch";
import { OFF_SEARCH_A_LISIOUS } from "./const";

export type TaxonomyNames =
  | "additive"
  | "allergen"
  | "amino_acid"
  | "brand"
  | "category"
  | "country"
  | "data_quality"
  | "label"
  | "food_group"
  | "improvement"
  | "ingredient"
  | "ingredients_analysis"
  | "ingredients_processing"
  | "language"
  | "mineral"
  | "misc"
  | "nova_group"
  | "nucleotide"
  | "nutrient"
  | "origin"
  | "other_nutritional_substance"
  | "packaging_material"
  | "packaging_recycling"
  | "packaging_shape"
  | "periods_after_opening"
  | "preservation"
  | "state"
  | "vitamin";

const taxonomy_names: TaxonomyNames[] = [
  "additive",
  "allergen",
  "amino_acid",
  "brand",
  "category",
  "country",
  "data_quality",
  "label",
  "food_group",
  "improvement",
  "ingredient",
  "ingredients_analysis",
  "ingredients_processing",
  "language",
  "mineral",
  "misc",
  "nova_group",
  "nucleotide",
  "nutrient",
  "origin",
  "other_nutritional_substance",
  "packaging_material",
  "packaging_recycling",
  "packaging_shape",
  "periods_after_opening",
  "preservation",
  "state",
  "vitamin",
];

const searchTaxonomy: Partial<
  Record<TaxonomyNames, (query: string, language?: string) => Promise<unknown>>
> = {};

taxonomy_names.forEach((taxonomy) => {
  searchTaxonomy[taxonomy] = (query: string, language?: string) =>
    checkedJsonFetch<unknown>(
      `${OFF_SEARCH_A_LISIOUS}?taxonomy_names=${taxonomy}&q=${query}&lang=${
        language || "en"
      }`,
    );
});

export type TaxonomyItem = {
  id: string;
  text: string;
  taxonomy_name: string;
};

export default searchTaxonomy as Record<
  TaxonomyNames,
  (query: string, language?: string) => Promise<{ options?: TaxonomyItem[] }>
>;
