import axios from "axios";
import * as React from "react";
import { OFF_SEARCH, OFF_API_URL_V3 } from "../../const";

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
  states: unknown;
  lang: string;
  image_packaging_url: string;
  packagings: Packaging[];
  product_name: string;
  images: unknown;
  creator: string;
};

function getProductsToAnnotateUrl({
  page = 1,
  country = "en:france",
  creator,
  code = "",
}: Parameters) {
  if (code) {
    return `${OFF_API_URL_V3}/product/${code}.json?fields=code,lang,image_packaging_url,product_name,packagings,images,creator,countries`;
  }
  let creatorTagNumber = 2;
  if (country) {
    creatorTagNumber += 1;
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

export const useBuffer = ({
  country,
  creator,
  code,
}: Omit<Parameters, "page">): [ProductDescription[], () => void] => {
  const [page, setPage] = React.useState(() => Math.ceil(Math.random() * 100));
  const [data, setData] = React.useState<ProductDescription[]>([]);
  const [maxPage, setMaxPage] = React.useState<number>(100);

  const canReset = React.useRef(false);

  // Reset data and page when country or creator changes
  React.useEffect(() => {
    if (canReset.current) {
      setData([]);
      setPage(1);
    }
  }, [country, creator]);

  // Increment page when data is empty
  React.useEffect(() => {
    if (data.length === 0) {
      setPage((p) => Math.min(maxPage, p + 1));
    }
  }, [data, maxPage]);

  // Fetch data when URL changes
  const url = getProductsToAnnotateUrl({ page, country, creator, code });

  React.useEffect(() => {
    let isValid = true;
    axios.get(url).then(({ data }) => {
      if (isValid) {
        const products = data.products ?? [data.product];
        setData(products);
        setMaxPage(Math.floor(data.count / data.page_size) + 1);
        canReset.current = true;
      }
    });
    return () => {
      isValid = false;
    };
  }, [url, country]);

  const next = () =>
    setData((prev) => (prev && prev.length > 0 ? prev.slice(1) : prev));

  return [data, next];
};
