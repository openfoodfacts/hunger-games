import axios, { AxiosResponse } from "axios";

type TagType = "categories" | "labels" | "brands";

export type TaxonomyItem = {
  /**
   * The unique identifier of the taxonomy item
   * Format [lg]:[id]
   */
  children?: string[];
  /**
   * The unique identifier of the taxonomy item
   * Format [lg]:[id]
   */
  parents?: string[];
};

export type GetTaxonomyParams = {
  /**
   * @default "categories"
   */
  taxonomy?: string;
  /**
   * @default []
   */
  languages?: string[];
  /**
   * The tag
   */
  tag: string;
};

/**
 * Translate our internal categories naming to OFF API taxonomy naming
 */
const categoryTranslator = {
  label: "labels",
  category: "categories",
  brand: "brands",
};

export default async function getTaxonomy(
  params: GetTaxonomyParams,
): Promise<Record<string, TaxonomyItem>> {
  const { taxonomy, tag, languages = [] } = params;

  const tagtype =
    categoryTranslator[taxonomy as keyof typeof categoryTranslator];
  if (!tagtype || !tag) {
    return {};
  }
  return await axios
    .get(
      `https://world.openfoodfacts.org/api/v2/taxonomy?tagtype=${tagtype}&tags=${tag}${
        languages && languages.length > 0 ? `&lc=${languages.join(",")}` : ""
      }`,
    )
    .then((response) => response.data);
}
