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
import {
  getGs1ExternalUrls,
  hasUnitedStates,
  isOnlyUnitedStates,
} from "./gs1CountryService";
import type { Gs1CountryConfig, Gs1Product } from "./types";
import { getImagesUrls } from "../questions/utils";

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

  const images = React.useMemo(() => {
    const list: Array<{ url: string; urlFull: string; label: string }> = [];

    if (product.image_front_url) {
      list.push({
        url: product.image_front_url,
        urlFull: product.image_front_url,
        label: t("gs1_country.front_image", "Front"),
      });
    }

    if (product.images) {
      const urls = getImagesUrls(
        product.images as Parameters<typeof getImagesUrls>[0],
        product.code,
      );
      urls.forEach((u, i) => {
        if (
          !list.some(
            (item) =>
              item.url === u.imageUrl || item.urlFull === u.imageUrlFull,
          )
        ) {
          list.push({
            url: u.imageUrl,
            urlFull: u.imageUrlFull,
            label: `${t("image", "Image")} ${i + 1}`,
          });
        }
      });
    }

    if (list.length === 0 && product.image_url) {
      list.push({
        url: product.image_url,
        urlFull: product.image_url,
        label: t("gs1_country.front_image", "Front"),
      });
    }

    return list;
  }, [product, t]);

  const [activeImageTab, setActiveImageTab] = React.useState(0);
  const currentImage = images[activeImageTab] ?? null;

  const links = React.useMemo(
    () => getGs1ExternalUrls(product.code, country),
    [product.code, country],
  );

  const onlyUs = isOnlyUnitedStates(product);
  const includesUs = hasUnitedStates(product);
  const prefixMatch = product.code.startsWith(country.prefix);

  // Global keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
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
        {/* Left: Product Images */}
        <Grid size={{ xs: 12, md: 6, lg: 5 }}>
          <Stack spacing={1.5}>
            {images.length > 1 && (
              <Tabs
                value={activeImageTab}
                onChange={(_, val: number) => setActiveImageTab(val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 36,
                  "& .MuiTab-root": {
                    minHeight: 36,
                    py: 0.5,
                    fontSize: "0.8rem",
                  },
                }}
              >
                {images.map((img, idx) => (
                  <Tab key={img.url} label={img.label} value={idx} />
                ))}
              </Tabs>
            )}

            <Box
              sx={{
                width: "100%",
                minHeight: { xs: 320, md: 460 },
                maxHeight: { xs: 450, md: 540 },
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
              {currentImage ? (
                <ZoomableImage
                  src={currentImage.url}
                  srcFull={currentImage.urlFull}
                  zoomIn
                  style={{
                    width: "100%",
                    height: "100%",
                    maxHeight: "460px",
                    objectFit: "contain",
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

            {/* VPN / US highlight */}
            {onlyUs && (
              <Alert severity="info" icon={false} sx={{ borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  🇺🇸{" "}
                  {t(
                    "gs1_country.only_us_badge",
                    "Only United States is currently listed — strong VPN mismatch signal",
                  )}
                </Typography>
              </Alert>
            )}

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
                        color={
                          tag === "en:united-states" && includesUs
                            ? "warning"
                            : "default"
                        }
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
