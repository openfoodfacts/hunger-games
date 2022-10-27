import * as React from "react";

import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";

import LabelFilter from "../../components/QuestionFilter/LabelFilter";
import LogoForm from "../../components/LogoForm";
import LogoGrid from "../../components/LogoGrid";
import robotoff from "../../robotoff";
import off from "../../off";
import useUrlParams from "../../hooks/useUrlParams";
import { DialogActions } from "@mui/material";

const PRODUCT_PAGE_SIZE = 2;

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

const OFF_2_ROBOTOFF = {
  categories: "category",
  labels: "label",
};
const fetchProducts = async ({ page, filter }) => {
  try {
    const {
      data: { count, products },
    } = await off.searchProducts({
      page,
      pageSize: PRODUCT_PAGE_SIZE,
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
          setCanLoadMore(count > productPage * PRODUCT_PAGE_SIZE);
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

const AnnotateSelectedLogos = (props) => {
  const { isOpen, logos, closeAnnotation, toggleLogoSelection } = props;

  const sendAnnotation = async ({ type, value }) => {
    try {
      await robotoff.annotateLogos(
        logos
          .filter((logo) => logo.selected)
          .map(({ id }) => ({
            logo_id: id,
            value,
            type,
          }))
      );
      logos
        .filter((logo) => logo.selected)
        .forEach(({ id }) => {
          toggleLogoSelection(id);
        });
      closeAnnotation();
    } catch {}
  };
  return (
    <Dialog open={isOpen} onClose={closeAnnotation} maxWidth="xl">
      <DialogContent>
        <LogoForm value="" type="" request={sendAnnotation} />
        <LogoGrid
          logos={logos.filter((logo) => logo.selected)}
          toggleLogoSelection={toggleLogoSelection}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeAnnotation}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
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

  const [isAnnotationOpen, setIsAnnotationOpen] = React.useState(false);
  const openAnnotation = React.useCallback(() => {
    setIsAnnotationOpen(true);
  }, []);
  const closeAnnotation = React.useCallback(() => {
    setIsAnnotationOpen(false);
  }, []);

  return (
    <div>
      <Paper sx={{ padding: 2, position: "sticky", top: 0, zIndex: 1 }}>
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

          {["categories", "labels"].includes(internalFilter.tagtype) ? (
            <LabelFilter
              showKey
              value={internalFilter.tag}
              onChange={(newValue) =>
                setInternalFilter((prev) => ({
                  ...prev,
                  tag: newValue,
                }))
              }
              label="tag"
              sx={{ minWidth: 200 }}
              insightType={OFF_2_ROBOTOFF[internalFilter.tagtype]}
            />
          ) : (
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
          )}

          <Button
            onClick={() => {
              setFilter(internalFilter);
            }}
          >
            Search
          </Button>
        </Stack>
      </Paper>
      {
        <>
          <LogoGrid logos={logos} toggleLogoSelection={toggleSelection} />
          <Paper sx={{ py: 1, position: "sticky", bottom: 0 }}>
            {isLoading && <LinearProgress sx={{ my: 2 }} />}
            <Stack direction="row" spacing={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={loadMore}
                disabled={isLoading || !canLoadMore}
              >
                Load More
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="success"
                onClick={openAnnotation}
              >
                Annotate
              </Button>
            </Stack>
          </Paper>
          <AnnotateSelectedLogos
            isOpen={isAnnotationOpen}
            logos={logos}
            closeAnnotation={closeAnnotation}
            toggleLogoSelection={toggleSelection}
          />
        </>
      }
    </div>
  );
}
