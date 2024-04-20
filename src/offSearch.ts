import axios, { AxiosResponse } from "axios";
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

const searchTaxonomy = {};

taxonomy_names.forEach((taxonomy) => {
  searchTaxonomy[taxonomy] = (querry: string, language?: string) =>
    axios.get(
      `${OFF_SEARCH_A_LISIOUS}?taxonomy_names=${taxonomy}&q=${querry}&lang=${
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
  (
    querry: string,
    language?: string,
  ) => Promise<AxiosResponse<{ options?: TaxonomyItem[] }>>
>;
