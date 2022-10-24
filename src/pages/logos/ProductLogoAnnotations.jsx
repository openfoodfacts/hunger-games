import * as React from "react";

import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import LogoGrid from "../../components/LogoGrid";
import robotoff from "../../robotoff";
import off from "../../off";
import useUrlParams from "../../hooks/useUrlParams";

const PAGE_SIZE = 5;

const AVAILABLE_TAG_TYPES = [
  "brands",
  "categories",
  "packaging",
  "labels",
  "origins",
  "manufacturing_places",
  "emb_codes",
  "purchase_places",
  "stores",
  "countries",
  "additives",
  "allergens",
  "traces",
  "nutrition_grades",
  "states",
];

const fetchProducts = async ({ page, filter }) => {
  try {
    const {
      data: { count, products },
    } = await off.searchProducts({
      page,
      pageSize: PAGE_SIZE,
      filters: [filter],
    });

    return {
      count,
      codes: products.map((x) => x.code),
    };
  } catch (error) {
    return {
      count: 0,
      codes: [],
    };
  }
};

const transformLogo = (logo) => {
  const src =
    logo.image.url ||
    robotoff.getCroppedImageUrl(
      off.getImageUrl(logo.image.source_image),
      logo.bounding_box
    );

  return { ...logo, selected: false, image: { ...logo.image, src } };
};

const requestProductLogos = async (barcode) => {
  const { data } = await robotoff.searchLogos(
    barcode,
    undefined,
    undefined,
    30
  );

  return data.logos.map(transformLogo);
};

const useLogoFetching = (filter) => {
  const [productPage, setProductPage] = React.useState(1);
  const [canLoadMore, setCanLoadMore] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const [fetchedProducts, setFetchedProducts] = React.useState([]);
  const [logos, setLogos] = React.useState([]);
  const requestedProductsRef = React.useRef({});

  React.useEffect(() => {
    setProductPage(1);
    setCanLoadMore(true);
    setFetchedProducts([]);
    setLogos([]);
    requestedProductsRef.current = {};
  }, [filter]);

  React.useEffect(() => {
    let isValid = true;
    setIsLoading(true);
    setCanLoadMore(false);
    fetchProducts({
      page: productPage,
      filter,
    })
      .then(({ count, codes }) => {
        if (isValid) {
          setFetchedProducts((prev) => [...prev, ...codes]);

          setIsLoading(false);
          setCanLoadMore(count > productPage * PAGE_SIZE);
        }
      })
      .catch(() => {
        if (isValid) {
          setIsLoading(false);
          setCanLoadMore(false);
        }
      });

    return () => {
      isValid = false;
    };
  }, [filter, productPage]);

  React.useEffect(() => {
    fetchedProducts.forEach((code) => {
      if (requestedProductsRef.current[code]) {
        return;
      }
      requestedProductsRef.current[code] = true;
      requestProductLogos(code)
        .then((logos) => {
          setLogos((prev) => [...prev, ...logos]);
        })
        .catch(() => {});
    });
  }, [fetchedProducts]);

  const loadMore = React.useCallback(() => {
    setProductPage((prev) => prev + 1);
  }, []);

  const toggleSelection = React.useCallback((id) => {
    setLogos((prevLogos) => {
      const indexToToggle = prevLogos.findIndex((logo) => logo.id === id);
      if (indexToToggle < 0) {
        return prevLogos;
      }
      return [
        ...prevLogos.slice(0, indexToToggle),
        {
          ...prevLogos[indexToToggle],
          selected: !prevLogos[indexToToggle].selected,
        },
        ...prevLogos.slice(indexToToggle + 1),
      ];
    });
  }, []);

  return [logos, loadMore, isLoading, canLoadMore, toggleSelection];
};

export default function AnnotateLogosFromProducts() {
  const [filter, setFilter] = useUrlParams({
    tagtype: "labels",
    tag_contains: "contains",
    tag: "en:eg-oko-verordnung",
  });

  const [internalFilter, setInternalFilter] = React.useState(() => filter);
  React.useEffect(() => {
    setInternalFilter(filter);
  }, [filter]);

  const [logos, loadMore, isLoading, canLoadMore, toggleSelection] =
    useLogoFetching(filter);

  return (
    <div>
      <Stack direction="row" spacing={1}>
        <TextField
          select
          value={internalFilter.tagtype}
          onChange={(event) =>
            setInternalFilter((prev) => ({
              ...prev,
              tagtype: event.target.value,
            }))
          }
          label="type"
          sx={{ minWidth: 200 }}
        >
          {AVAILABLE_TAG_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          value={internalFilter.tag}
          onChange={(event) =>
            setInternalFilter((prev) => ({
              ...prev,
              tag: event.target.value,
            }))
          }
          label="tag"
          sx={{ minWidth: 200 }}
        />
        <Button
          onClick={() => {
            setFilter(internalFilter);
          }}
        >
          Search
        </Button>
      </Stack>

      {
        <>
          <LogoGrid
            logos={logos}
            toggleLogoSelection={toggleSelection}
            // readOnly
          />
          {isLoading && <LinearProgress sx={{ mt: 5 }} />}
          <Button
            sx={{ width: "100%", my: 5, py: 3 }}
            variant="filled"
            onClick={loadMore}
            disabled={isLoading || !canLoadMore}
          >
            Load More
          </Button>
        </>
      }
    </div>
  );
}
