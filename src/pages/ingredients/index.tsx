import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Link from "@mui/material/Link";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import HideImageOutlinedIcon from "@mui/icons-material/HideImageOutlined";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { useCountry } from "../../contexts/CountryProvider";
import { MapInteractionCSS } from "react-map-interaction";

import Loader from "../loader";
import off from "../../off";
import { useTranslation } from "react-i18next";
import useData from "./useData";
import ImageAnnotation from "./ImageAnnotation";
import { OFF_URL } from "../../const";
import type { IngredientProduct } from "./useData";
import countries from "../../assets/countries.json";

interface CountryOption {
  id: string;
  label: string;
  languageCode: string;
  countryCode: string;
}

type SearchParamsSetter = (
  update: (previous: URLSearchParams) => URLSearchParams,
) => void;

const useTypedSearchParams = useSearchParams as unknown as () => [
  URLSearchParams,
  SearchParamsSetter,
];

type ProductInterfaceProps = { product: IngredientProduct; next: () => void };

function ProductInterface({ product, next }: ProductInterfaceProps) {
  const { t } = useTranslation();

  const { selectedImages, product_name, code, scans_n } = product;
  const [images, setImages] = React.useState(selectedImages);
  const [imageTab, setImageTab] = React.useState(
    selectedImages[0]?.countryCode ?? "",
  );
  const [unselectError, setUnselectError] = React.useState<string | null>(null);

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setImageTab(newValue);
  };

  const getIngredientText = (countryCode: string) => {
    const value = product[`ingredients_text_${countryCode}`];
    return typeof value === "string" ? value : "";
  };

  const unselectMutation = useMutation({
    mutationFn: async ({
      imageField,
      countryCode,
    }: {
      imageField: string;
      countryCode: string;
    }) => {
      setUnselectError(null);
      await off.unselectImage({
        code,
        id:
          imageField ||
          (countryCode ? `ingredients_${countryCode}` : "ingredients"),
      });
      return { imageField, countryCode };
    },
    onSuccess: ({ imageField, countryCode }) => {
      const remaining = images.filter(
        (img) =>
          img.imageField !== imageField && img.countryCode !== countryCode,
      );
      if (remaining.length > 0) {
        setImages(remaining);
        setImageTab(remaining[0].countryCode);
      } else {
        next();
      }
    },
    onError: (err: Error) => {
      setUnselectError(
        err.message ||
          t("ingredients.unselect_error", "Failed to unselect photo"),
      );
    },
  });

  return (
    <div style={{ padding: "0 5px" }}>
      <Typography variant="h6">
        {product_name || "No product name"} (scan: {scans_n})
        <br />
        <a href={off.getProductUrl(code)}>{code}</a>
      </Typography>
      <Stack direction="column">
        {images?.length > 0 && (
          <TabContext value={imageTab}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                onChange={handleChange}
                aria-label="language code of the selected image"
              >
                {images.map(({ countryCode }) => {
                  return (
                    <Tab
                      key={`${code}-${countryCode}`}
                      label={
                        countryCode ? `Lang ${countryCode}` : "default lang"
                      }
                      value={countryCode}
                    />
                  );
                })}
              </TabList>
            </Box>
            {images.map(
              ({
                countryCode,
                imageField,
                imageUrl,
                fetchDataUrl,
                uploaded_t,
                uploader,
              }) => {
                return (
                  <TabPanel value={countryCode} key={`${code}-${countryCode}`}>
                    <Stack direction="row">
                      <Box sx={{ width: "50%", height: "60vh" }}>
                        <MapInteractionCSS
                          showControls
                          minScale={0.5}
                          translationBounds={{
                            xMax: 100,
                            yMax: 100,
                          }}
                        >
                          <img
                            src={imageUrl}
                            style={{
                              width: "50%",
                              objectFit: "contain",
                            }}
                          />
                        </MapInteractionCSS>

                        <Typography sx={{ textAlign: "center" }}>
                          <Link
                            href={`${OFF_URL}/contributor/${uploader}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {uploader}
                          </Link>{" "}
                          {uploaded_t &&
                            new Date(uploaded_t * 1000).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ justifyContent: "center", mt: 1 }}
                        >
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<HideImageOutlinedIcon />}
                            loading={unselectMutation.isPending}
                            disabled={unselectMutation.isPending}
                            onClick={() => {
                              unselectMutation.mutate({
                                imageField,
                                countryCode,
                              });
                            }}
                          >
                            {t(
                              "ingredients.unselect_photo",
                              "Unselect photo (bad photo)",
                            )}
                          </Button>
                        </Stack>
                        {unselectError && (
                          <Typography
                            color="error"
                            variant="caption"
                            sx={{
                              display: "block",
                              textAlign: "center",
                              mt: 0.5,
                            }}
                          >
                            {unselectError}
                          </Typography>
                        )}
                      </Box>
                      <ImageAnnotation
                        fetchDataUrl={fetchDataUrl}
                        code={code}
                        imageLang={countryCode}
                        offText={getIngredientText(countryCode)}
                      />
                    </Stack>
                  </TabPanel>
                );
              },
            )}
          </TabContext>
        )}
      </Stack>
      <Button onClick={next} fullWidth variant="outlined" sx={{ mt: 2 }}>
        {t("ingredients.skip")}
      </Button>
    </div>
  );
}

export default function IngredientsPage() {
  const { t } = useTranslation();
  const [country, setCountry] = useCountry();
  const [searchParams, setSearchParams] = useTypedSearchParams();
  const popularity =
    searchParams.get("popularity") ?? "top-90-percent-scans-2025";

  const { data, removeHead, isLoading, error, retry } = useData(
    country,
    popularity,
  );

  const selectedCountry = React.useMemo(() => {
    if (!country || country === "world") {
      return null;
    }
    return (
      countries.find(
        (c) => c.countryCode.toLowerCase() === country.toLowerCase(),
      ) || null
    );
  }, [country]);

  const handleCountryChange = (
    _event: React.SyntheticEvent,
    newValue: CountryOption | null,
  ) => {
    setCountry(newValue?.countryCode || "", "page");
  };

  const handlePopularityChange = (newPopularity: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newPopularity) {
        next.set("popularity", newPopularity);
      } else {
        next.delete("popularity");
      }
      return next;
    });
  };

  return (
    <React.Suspense fallback={<Loader />}>
      <Stack
        spacing={2}
        sx={{
          px: { xs: 2, sm: 5 },
          pt: 4,
          pb: 2,
        }}
      >
        <Typography>{t("ingredients.description")}</Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: "center", width: "100%", maxWidth: 800 }}
        >
          <Autocomplete<CountryOption>
            value={selectedCountry}
            onChange={handleCountryChange}
            options={countries}
            isOptionEqualToValue={(option, value) =>
              option.countryCode === value.countryCode
            }
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("ingredients.filters.country", "Country")}
                placeholder={t(
                  "ingredients.filters.all_countries",
                  "All countries (world)",
                )}
                size="small"
              />
            )}
            sx={{ minWidth: 240, flex: 1 }}
          />

          <FormControl size="small" sx={{ minWidth: 260, flex: 1 }}>
            <InputLabel id="ingredients-popularity-label">
              {t("ingredients.filters.popularity", "Popularity")}
            </InputLabel>
            <Select
              labelId="ingredients-popularity-label"
              value={popularity}
              label={t("ingredients.filters.popularity", "Popularity")}
              onChange={(e: SelectChangeEvent) =>
                handlePopularityChange(e.target.value)
              }
            >
              <MenuItem value="top-90-percent-scans-2025">
                {t(
                  "ingredients.filters.top_90_percent_2025",
                  "Top 90% scans (2025)",
                )}
              </MenuItem>
              <MenuItem value="top-90-percent-scans-2024">
                {t(
                  "ingredients.filters.top_90_percent_2024",
                  "Top 90% scans (2024)",
                )}
              </MenuItem>
              <MenuItem value="all">
                {t(
                  "ingredients.filters.all_popularity",
                  "All products (no filter)",
                )}
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>
      {/* <IngeredientDisplay /> */}
      {isLoading ? (
        "loading..."
      ) : error && data.length === 0 ? (
        <Stack
          spacing={1}
          sx={{
            alignItems: "center",
          }}
        >
          <Typography>Unable to load products: {error}</Typography>
          <Button onClick={retry} variant="outlined">
            Retry
          </Button>
        </Stack>
      ) : data && data.length === 0 ? (
        "No data"
      ) : (
        <ProductInterface
          key={data[0].code}
          product={data[0]}
          next={removeHead}
        />
      )}

      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </React.Suspense>
  );
}
