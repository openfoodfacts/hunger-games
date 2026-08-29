import type { ProductV3 } from "@openfoodfacts/openfoodfacts-nodejs";
import axios from "axios";
import * as React from "react";
import { OFF_SEARCH, OFF_API_URL_V3 } from "../../const";
import type { ProductImage } from "../../off";

type Parameters = {
  page: number;
  country?: string;
  creator?: string;
  code?: string;
};

export type EditablePackaging = {
  id: number;
  material: string | null;
  number: string;
  recycling: string | null;
  shape: string | null;
};

export type PackagingUpdate = Partial<Omit<EditablePackaging, "id">>;

export type ProductDescription = Pick<
  ProductV3,
  "code" | "image_packaging_url" | "packagings" | "product_name"
> & {
  code: string;
  images: Record<string, ProductImage | string>;
};

type SearchResponse = {
  products?: ProductDescription[];
  product?: ProductDescription;
  count?: number;
  page_size?: number;
};

type BufferState = {
  data: ProductDescription[] | null;
  error: string | null;
  maxPage: number;
  page: number;
  requestId: number;
  searchKey: string;
};

type BufferResult = [
  ProductDescription[] | null,
  () => void,
  string | null,
  () => void,
];

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
}: Omit<Parameters, "page">): BufferResult => {
  const searchKey = `${country ?? ""}:${creator ?? ""}:${code ?? ""}`;
  const [state, setState] = React.useState<BufferState>(() => ({
    data: null,
    error: null,
    maxPage: 100,
    page: Math.ceil(Math.random() * 100),
    requestId: 0,
    searchKey,
  }));

  if (state.searchKey !== searchKey) {
    setState({
      data: null,
      error: null,
      maxPage: 100,
      page: 1,
      requestId: 0,
      searchKey,
    });
  }

  const activeState =
    state.searchKey === searchKey
      ? state
      : {
          data: null,
          error: null,
          maxPage: 100,
          page: 1,
          requestId: 0,
          searchKey,
        };
  const url = getProductsToAnnotateUrl({
    page: activeState.page,
    country,
    creator,
    code,
  });

  React.useEffect(() => {
    let isValid = true;
    void axios
      .get<SearchResponse>(url)
      .then(({ data }) => {
        if (!isValid) {
          return;
        }
        const products = data.products ?? (data.product ? [data.product] : []);
        const pageSize = data.page_size ?? 1;
        const maxPage = Math.max(1, Math.ceil((data.count ?? 0) / pageSize));
        setState((previous) => ({
          ...previous,
          data: products,
          error: null,
          maxPage,
        }));
      })
      .catch((error: unknown) => {
        console.error(error);
        if (isValid) {
          setState((previous) => ({
            ...previous,
            error:
              error instanceof Error
                ? error.message
                : "The product request failed.",
          }));
        }
      });
    return () => {
      isValid = false;
    };
  }, [url, activeState.requestId]);

  const next = () => {
    setState((previous) => {
      if (previous.data && previous.data.length > 1) {
        return { ...previous, data: previous.data.slice(1) };
      }
      return {
        ...previous,
        data: null,
        error: null,
        page: Math.min(previous.maxPage, previous.page + 1),
      };
    });
  };

  const retry = () => {
    setState((previous) => ({
      ...previous,
      data: null,
      error: null,
      requestId: previous.requestId + 1,
    }));
  };

  return [activeState.data, next, activeState.error, retry];
};
