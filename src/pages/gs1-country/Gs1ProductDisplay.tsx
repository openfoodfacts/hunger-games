import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Link from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import PublicIcon from "@mui/icons-material/Public";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import { useTranslation } from "react-i18next";

import ZoomableImage from "../../components/ZoomableImage";
import { getGs1ExternalUrls } from "./gs1CountryService";
import type { Gs1CountryConfig, Gs1Product } from "./types";
import { getFullSizeImage, getImagesUrls } from "../questions/utils";

interface Gs1ProductDisplayProps {
  product: Gs1Product;
  country: Gs1CountryConfig;
  isSubmitting: boolean;
  onConfirmSoldInCountry: () => void;
  onRejectSoldInCountry: () => void;
  onSkip: () => void;
}

function formatCountryTag(tag: string): string {
  return tag.replace(/^en:/, "").replace(/-/g, " ");
}

export default function Gs1ProductDisplay({
  product,
  country,
  isSubmitting,
  onConfirmSoldInCountry,
  onRejectSoldInCountry,
  onSkip,
}: Gs1ProductDisplayProps) {
  const { t } = useTranslation();

  // Selected images (Front, Ingredients, Nutrition, Packaging) with full-res URLs
  const selectedImages = React.useMemo(() => {
    const list: Array<{ url: string; urlFull: string; label: string }> = [];
    const seen = new Set<string>();

    const addImage = (url: string | undefined, label: string) => {
      if (!url || seen.has(url)) return;
      seen.add(url);
      list.push({
        url,
        urlFull: getFullSizeImage(url),
        label,
      });
    };

    const categories: Array<{
      key: "front" | "ingredients" | "nutrition" | "packaging";
      title: string;
      fallbackUrl?: string;
    }> = [
      {
        key: "front",
        title: t("gs1_country.front_image", "Front"),
        fallbackUrl: product.image_front_url || product.image_url,
      },
      {
        key: "ingredients",
        title: t("gs1_country.ingredients_image", "Ingredients"),
        fallbackUrl: product.image_ingredients_url,
      },
      {
        key: "nutrition",
        title: t("gs1_country.nutrition_image", "Nutrition"),
        fallbackUrl: product.image_nutrition_url,
      },
      {
        key: "packaging",
        title: t("gs1_country.packaging_image", "Packaging"),
        fallbackUrl: product.image_packaging_url,
      },
    ];

    for (const cat of categories) {
      const displayMap = product.selected_images?.[cat.key]?.display;
      if (displayMap && Object.keys(displayMap).length > 0) {
        for (const [lang, url] of Object.entries(displayMap)) {
          addImage(url, `${cat.title} (${lang})`);
        }
      } else {
        addImage(cat.fallbackUrl, cat.title);
      }
    }

    return list;
  }, [product, t]);

  // All uploaded product images in reverse chronological order
  const allImages = React.useMemo(() => {
    if (!product.images) return [];
    return getImagesUrls(
      product.images as Parameters<typeof getImagesUrls>[0],
      product.code,
    ).reverse();
  }, [product.images, product.code]);

  const [activeImageTab, setActiveImageTab] = React.useState(0);
  const currentSelectedImage =
    selectedImages[activeImageTab] ??
    (allImages[0]
      ? {
          url: allImages[0].imageUrl,
          urlFull: allImages[0].imageUrlFull,
          label: t("image", "Image"),
        }
      : null);

  const links = React.useMemo(
    () => getGs1ExternalUrls(product.code, country),
    [product.code, country],
  );

  const prefixMatch = product.code.startsWith(country.prefix);

  // Global keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (document.querySelector("[role='dialog']")) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          Boolean(
            target.closest(
              "input, textarea, select, button, a, [role='button'], [role='tab'], [role='menuitem'], [role='dialog'], [contenteditable='true']",
            ),
          ))
      ) {
        return;
      }
      if (isSubmitting) return;

      if (
        e.key === "y" ||
        e.key === "Y" ||
        e.key === "Enter" ||
        e.key === "1"
      ) {
        e.preventDefault();
        onConfirmSoldInCountry();
      } else if (e.key === "n" || e.key === "N" || e.key === "0") {
        e.preventDefault();
        onRejectSoldInCountry();
      } else if (e.key === "s" || e.key === "S" || e.key === " ") {
        e.preventDefault();
        onSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onConfirmSoldInCountry, onRejectSoldInCountry, onSkip]);

  const productName =
    product.product_name ||
    product.product_name_en ||
    t("gs1_country.unnamed_product", "Unnamed product");

  const codePrefix = prefixMatch
    ? product.code.slice(0, country.prefix.length)
    : "";
  const codeRest = prefixMatch
    ? product.code.slice(country.prefix.length)
    : product.code;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Grid container spacing={3}>
        {/* Left: Selected Images & All Pictures Explorer */}
        <Grid size={{ xs: 12, md: 6, lg: 5 }}>
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, mb: 0.75 }}
              >
                {t("gs1_country.selected_images", "Selected Images")}
              </Typography>
              {selectedImages.length > 1 && (
                <Tabs
                  value={activeImageTab}
                  onChange={(_, val: number) => setActiveImageTab(val)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    mb: 1,
                    minHeight: 36,
                    "& .MuiTab-root": {
                      minHeight: 36,
                      py: 0.5,
                      fontSize: "0.8rem",
                    },
                  }}
                >
                  {selectedImages.map((img) => (
                    <Tab key={img.url} label={img.label} />
                  ))}
                </Tabs>
              )}

              <Box
                sx={{
                  width: "100%",
                  minHeight: { xs: 280, md: 360 },
                  maxHeight: { xs: 400, md: 440 },
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "action.hover",
                  display: "grid",
                  placeItems: "center",
                  position: "relative",
                }}
              >
                {currentSelectedImage ? (
                  <ZoomableImage
                    src={currentSelectedImage.url}
                    srcFull={currentSelectedImage.urlFull}
                    zoomIn
                    imageProps={{
                      style: {
                        width: "100%",
                        height: "100%",
                        maxHeight: "400px",
                        objectFit: "contain",
                      },
                    }}
                  />
                ) : (
                  <Stack spacing={1} sx={{ alignItems: "center", p: 3 }}>
                    <ImageNotSupportedOutlinedIcon
                      sx={{ fontSize: 48, color: "text.disabled" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {t("gs1_country.no_image", "No product image available")}
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Box>

            {allImages.length > 0 && (
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 800, mb: 0.75 }}
                >
                  {t(
                    "gs1_country.all_pictures",
                    "All Pictures ({{count}}) — click to view full resolution",
                    { count: allImages.length },
                  )}
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    width: "100%",
                    gap: 1,
                    gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
                    maxHeight: "18rem",
                    overflowY: "auto",
                    p: 1,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "action.hover",
                  }}
                >
                  {allImages.map((img) => (
                    <Box
                      key={img.imageUrl}
                      sx={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "1 / 1",
                        overflow: "hidden",
                        bgcolor: "background.paper",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <ZoomableImage
                        src={img.imageUrl}
                        srcFull={img.imageUrlFull}
                        style={{ width: "100%", height: "100%" }}
                        imageProps={{
                          loading: "lazy",
                          style: {
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Stack>
        </Grid>

        {/* Right: Question, Metadata & Actions */}
        <Grid size={{ xs: 12, md: 6, lg: 7 }}>
          <Stack spacing={2.5} sx={{ height: "100%" }}>
            {/* Question Banner */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "action.hover",
                borderLeft: "4px solid",
                borderColor: "primary.main",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {country.flag}{" "}
                {t(
                  "gs1_country.question",
                  "Is this product sold in {{country}}?",
                  { country: country.name },
                )}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {t(
                  "gs1_country.question_hint",
                  "Barcode starts with {{prefix}} (GS1 {{country}}), and {{country}} is not currently listed in countries where sold.",
                  { prefix: country.prefix, country: country.name },
                )}
              </Typography>
            </Box>

            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                {t(
                  "gs1_country.gs1_caveat_warning",
                  "A GS1 prefix does not necessarily mean a product is sold in this country: some barcodes are pooled across countries by multinationals for a given brand, and national brands may use their barcodes for export-only products. A good hint is the language shown on the packaging, if it is not shared across countries (e.g. Czech). Please use your best judgment before answering Yes.",
                )}
              </Typography>
            </Alert>

            {/* Product Details */}
            <Stack spacing={1.5}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {productName}
              </Typography>

              {/* Barcode with highlighted GS1 prefix */}
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", flexWrap: "wrap" }}
              >
                <Typography variant="body2" color="text.secondary">
                  {t("gs1_country.barcode_label", "Barcode:")}
                </Typography>
                <Chip
                  size="small"
                  variant="outlined"
                  sx={{ fontFamily: "monospace", fontWeight: 700 }}
                  label={
                    <span>
                      {codePrefix && (
                        <Box
                          component="span"
                          sx={{
                            color: "primary.main",
                            fontWeight: 900,
                            textDecoration: "underline",
                          }}
                        >
                          {codePrefix}
                        </Box>
                      )}
                      {codeRest}
                    </span>
                  }
                />
                {product.lang && (
                  <Chip
                    size="small"
                    variant="outlined"
                    color={
                      country.expectedLangs.includes(product.lang)
                        ? "success"
                        : "default"
                    }
                    label={`${t("gs1_country.lang_label", "Product lang")}: ${product.lang}`}
                  />
                )}
              </Stack>

              {product.brands && (
                <Typography variant="body2">
                  <strong>{t("gs1_country.brands_label", "Brands:")}</strong>{" "}
                  {product.brands}
                </Typography>
              )}

              {product.quantity && (
                <Typography variant="body2">
                  <strong>
                    {t("gs1_country.quantity_label", "Quantity:")}
                  </strong>{" "}
                  {product.quantity}
                </Typography>
              )}

              {product.categories && (
                <Typography variant="body2">
                  <strong>
                    {t("gs1_country.categories_label", "Categories:")}
                  </strong>{" "}
                  {product.categories}
                </Typography>
              )}

              {/* Current countries */}
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.75 }}>
                  {t(
                    "gs1_country.current_countries",
                    "Currently listed countries:",
                  )}
                </Typography>
                {product.countries_tags && product.countries_tags.length > 0 ? (
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ flexWrap: "wrap", gap: 0.75 }}
                  >
                    {product.countries_tags.map((tag) => (
                      <Chip
                        key={tag}
                        size="small"
                        label={formatCountryTag(tag)}
                        variant="outlined"
                        sx={{ textTransform: "capitalize", fontWeight: 600 }}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t("gs1_country.no_countries_listed", "None listed")}
                  </Typography>
                )}
              </Box>
            </Stack>

            {/* External Reference Links */}
            <Stack
              direction="row"
              spacing={2}
              sx={{ flexWrap: "wrap", alignItems: "center" }}
            >
              <Link
                href={links.offProductUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                <PublicIcon fontSize="small" />
                {t("gs1_country.view_on_off", "View on Open Food Facts")}
                <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
              </Link>

              <Link
                href={links.offEditUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                <EditRoundedIcon fontSize="small" />
                {t("gs1_country.edit_on_off", "Edit on OFF")}
                <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
              </Link>

              <Link
                href={links.offFacetUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                {t("gs1_country.view_facet", "Facet list")}
                <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
              </Link>
            </Stack>

            {/* Action Buttons */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ mt: "auto", pt: 2 }}
            >
              <Button
                variant="contained"
                color="success"
                size="large"
                disabled={isSubmitting}
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <DoneIcon />
                  )
                }
                onClick={onConfirmSoldInCountry}
                sx={{ flex: 1, fontWeight: 800, py: 1.5 }}
              >
                {t("gs1_country.yes_sold_button", "Yes, sold in {{country}}", {
                  country: country.name,
                })}
              </Button>

              <Button
                variant="contained"
                color="error"
                size="large"
                disabled={isSubmitting}
                startIcon={<CloseIcon />}
                onClick={onRejectSoldInCountry}
                sx={{ flex: 1, fontWeight: 800, py: 1.5 }}
              >
                {t(
                  "gs1_country.no_sold_button",
                  "No, not sold in {{country}}",
                  { country: country.name },
                )}
              </Button>

              <Button
                variant="outlined"
                size="large"
                disabled={isSubmitting}
                startIcon={<SkipNextIcon />}
                onClick={onSkip}
                sx={{ fontWeight: 700, py: 1.5 }}
              >
                {t("skip", "Skip")}
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
