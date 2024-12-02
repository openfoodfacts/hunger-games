import axios, { AxiosResponse } from "axios";

type TagType = "categories";

export type TaxonomyItem = {
  id: string;
  text: string;
  taxonomy_name: string;
};

export type GetTaxonomyParams = {
  /**
   * @default "categories"
   */
  categories?: TagType;
  /**
   * @default ["fr", "en"]
   */
  languages?: string[];
  /**
   * The tag
   */
  tag: string;
};
export default function getTaxonomy(
  params: GetTaxonomyParams,
): Promise<AxiosResponse<{ options?: TaxonomyItem[] }>> {
  const { categories = "categories", tag, languages = ["fr", "en"] } = params;

  return axios.get(
    `https://world.openfoodfacts.org/api/v2/taxonomy?tagtype=${categories}&tags=${tag}&lc=${languages.join(
      ",",
    )}`,
  );
}
