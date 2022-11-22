import axios from "axios";
import * as React from "react";
import { OFF_SEARCH } from "../../const";

type Parameters = {
  page: number;
  country?: string;
  creator?: string;
  code?: string;
};

type Packaging = {
  material: string;
  number: string;
  recycling: string;
  shape: string;
};

type ProductDescription = {
  code: number;
  states: any;
  lang: string;
  image_packaging_url: string;
  packagings: Packaging[];
  product_name: string;
  images: any;
  creator: string;
};
function getProductsToAnnotateUrl({
  page = 1,
  country = "en:france",
  creator,
  code = "",
}: Parameters) {
  if (code) {
    return `https://world.openfoodfacts.org/api/v0/product/${code}.json?fields=code,lang,image_packaging_url,product_name,packagings,images,creator,countries`;
  }
  let creatorTagNumber = 2;
  let categoryTagNumber = 2;
  if (country) {
    creatorTagNumber += 1;
    categoryTagNumber += 1;
  }
  if (creator) {
    categoryTagNumber += 1;
  }

  return `${OFF_SEARCH}?json=true&${
    page ? `page=${page}&` : ""
  }fields=code,states,lang,image_packaging_url,packagings,product_name,images,creator,countries&action=process&sort_by=unique_scans_n&tagtype_0=states&tag_contains_0=contains&tag_0=packaging-to-be-completed&tagtype_1=states&tag_contains_1=contains&tag_1=packaging-photo-selected${
    country
      ? `&tagtype_2=countries&tag_contains_2=contains&tag_2=${country}`
      : ""
  }${
    creator
      ? `&tagtype_${creatorTagNumber}=creator&tag_contains_${creatorTagNumber}=contains&tag_${creatorTagNumber}=${creator}`
      : ""
  }`;
}

export const useBuffer = (country?: string, creator?: string) => {
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<ProductDescription[]>([]);

  React.useEffect(() => {
    setData([]);
    setPage(1);
  }, [country, creator]);

  React.useEffect(() => {
    if (data.length > 0) {
      return;
    }
    const url = getProductsToAnnotateUrl({ page, country, creator });

    axios.get(url).then(({ data }) => {
      setData(data.products);
      setPage((p) => p + 1);
    });
  }, [data]);

  return data;
};
