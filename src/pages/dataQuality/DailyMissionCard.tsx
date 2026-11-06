import * as React from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import { alpha, useTheme } from "@mui/material/styles";

import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import ShuffleRoundedIcon from "@mui/icons-material/ShuffleRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CelebrationRoundedIcon from "@mui/icons-material/CelebrationRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";

import ZoomableImage from "../../components/ZoomableImage";
import { DataQualityProduct, MissionFilterType } from "./types";
import {
  formatErrorTag,
  getProductEditUrl,
  getProductViewUrl,
  getNutritionExtractorUrl,
  saveLocalFixedBarcode,
  getLocalFixedBarcodes,
} from "./dataQualityService";

interface DailyMissionCardProps {
  products: DataQualityProduct[];
  onFixedProduct: (barcode: string) => void;
  onLoadMoreProducts: () => void;
  onShuffleProducts: () => void;
  userFixCount: number;
}

export default function DailyMissionCard({
  products,
  onFixedProduct,
  onLoadMoreProducts,
  onShuffleProducts,
  userFixCount,
}: DailyMissionCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [activeFilter, setActiveFilter] =
    React.useState<MissionFilterType>("all");
  const [selectedImageTab, setSelectedImageTab] = React.useState<
    Record<string, number>
  >({});
  const [celebratingBarcode, setCelebratingBarcode] = React.useState<
    string | null
  >(null);

  const fixedBarcodes = React.useMemo(() => {
    void userFixCount;
    return new Set(getLocalFixedBarcodes());
  }, [userFixCount]);

  const filteredProducts = React.useMemo(() => {
    let result = products;

    if (activeFilter === "nutrition") {
      result = result.filter((p) =>
        p.data_quality_errors_tags.some(
          (tag) => tag.includes("nutrition") || tag.includes("energy"),
        ),
      );
    } else if (activeFilter === "ingredients") {
      result = result.filter((p) =>
        p.data_quality_errors_tags.some((tag) => tag.includes("ingredient")),
      );
    } else if (activeFilter === "high_popularity") {
      result = [...result].sort((a, b) => b.unique_scans_n - a.unique_scans_n);
    }

    return result;
  }, [products, activeFilter]);

  const handleMarkAsFixed = (barcode: string) => {
    saveLocalFixedBarcode(barcode);
    setCelebratingBarcode(barcode);
    setTimeout(() => {
      setCelebratingBarcode(null);
      onFixedProduct(barcode);
    }, 1200);
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header and Hero Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.07,
          )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <Chip
                icon={<AutoFixHighRoundedIcon fontSize="small" />}
                label={t("data_quality.mission.badge", "Daily Fix Mission")}
                color="primary"
                size="small"
                sx={{ fontWeight: 800, fontSize: "0.72rem" }}
              />
              {userFixCount > 0 && (
                <Chip
                  icon={<CelebrationRoundedIcon fontSize="small" />}
                  label={t("data_quality.mission.fixed_today", {
                    count: userFixCount,
                    defaultValue: `${userFixCount} fixed!`,
                  })}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 800, fontSize: "0.72rem" }}
                />
              )}
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {t(
                "data_quality.mission.title",
                "Below are your products to fix",
              )}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 720, mt: 0.5 }}
            >
              {t(
                "data_quality.mission.subtitle",
                "These products have verified photos and are frequently scanned by consumers. Fixing them has immediate high impact!",
              )}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ShuffleRoundedIcon />}
              onClick={onShuffleProducts}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
            >
              {t("data_quality.mission.randomize", "Randomize")}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineRoundedIcon />}
              onClick={onLoadMoreProducts}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
            >
              {t(
                "data_quality.mission.want_to_be_a_hero",
                "Want to be a hero? +3 more",
              )}
            </Button>
          </Stack>
        </Stack>

        {/* Filter Chips Bar */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ flexWrap: "wrap", gap: 1 }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              color: "text.secondary",
              mr: 0.5,
            }}
          >
            <FilterListRoundedIcon
              sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.5 }}
            />
            {t("data_quality.mission.filter_by", "Filter:")}
          </Typography>
          {[
            {
              id: "all",
              label: t("data_quality.mission.filters.all", "All Issues"),
            },
            {
              id: "nutrition",
              label: t(
                "data_quality.mission.filters.nutrition",
                "Nutrition Errors",
              ),
            },
            {
              id: "ingredients",
              label: t(
                "data_quality.mission.filters.ingredients",
                "Ingredients Errors",
              ),
            },
            {
              id: "high_popularity",
              label: t(
                "data_quality.mission.filters.popularity",
                "Most Scanned First",
              ),
            },
          ].map((filter) => (
            <Chip
              key={filter.id}
              label={filter.label}
              clickable
              color={activeFilter === filter.id ? "primary" : "default"}
              variant={activeFilter === filter.id ? "filled" : "outlined"}
              size="small"
              onClick={() => setActiveFilter(filter.id as MissionFilterType)}
              sx={{ fontWeight: 700, borderRadius: 1.5 }}
            />
          ))}
        </Stack>
      </Paper>

      {/* Products Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 2.5,
        }}
      >
        {filteredProducts.map((product) => {
          const isFixed = fixedBarcodes.has(product.code);
          const isCelebrating = celebratingBarcode === product.code;
          const imageTab = selectedImageTab[product.code] || 0;

          const imagesList = [
            {
              label: t("data_quality.mission.images.nutrition", "Nutrition"),
              url: product.image_nutrition_url,
            },
            {
              label: t(
                "data_quality.mission.images.ingredients",
                "Ingredients",
              ),
              url: product.image_ingredients_url,
            },
            {
              label: t("data_quality.mission.images.front", "Front"),
              url: product.image_front_url,
            },
          ].filter((img) => Boolean(img.url));

          const currentImageUrl =
            imagesList[imageTab]?.url || imagesList[0]?.url;
          const hasNutritionError = product.data_quality_errors_tags.some(
            (tag) =>
              tag.includes("nutrition") ||
              tag.includes("energy") ||
              tag.includes("salt") ||
              tag.includes("serving"),
          );

          return (
            <Card
              key={product.code}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${
                  isFixed
                    ? theme.palette.success.main
                    : isCelebrating
                      ? theme.palette.warning.main
                      : theme.palette.divider
                }`,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                backgroundColor: isFixed
                  ? alpha(theme.palette.success.main, 0.04)
                  : theme.palette.background.paper,
                "&:hover": {
                  boxShadow: theme.shadows[3],
                },
              }}
            >
              {isCelebrating && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 10,
                    backgroundColor: alpha(theme.palette.success.main, 0.92),
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 3,
                    p: 3,
                    textAlign: "center",
                  }}
                >
                  <CelebrationRoundedIcon sx={{ fontSize: 64, mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {t("data_quality.mission.bravo", "Bravo & Thank You!")}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                    {t(
                      "data_quality.mission.bravo_desc",
                      "Your fix makes Open Food Facts better for everyone.",
                    )}
                  </Typography>
                </Box>
              )}

              {/* Product Header */}
              <Box sx={{ p: 2, pb: 1.5 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={1}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        color: "text.secondary",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {product.code}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 800,
                        lineHeight: 1.25,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        minHeight: "2.5em",
                      }}
                      title={product.product_name}
                    >
                      {product.product_name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {product.brands || "—"}
                    </Typography>
                  </Box>

                  <Tooltip
                    title={t("data_quality.mission.scans_tooltip", {
                      count: product.unique_scans_n,
                      defaultValue: `${product.unique_scans_n.toLocaleString()} scans recorded`,
                    })}
                  >
                    <Chip
                      icon={
                        <LocalFireDepartmentRoundedIcon
                          sx={{ fontSize: "16px !important", color: "#e65100" }}
                        />
                      }
                      label={`${product.unique_scans_n.toLocaleString()} scans`}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        backgroundColor: "#FFF3E0",
                        color: "#E65100",
                        borderRadius: 1.5,
                        height: 24,
                      }}
                    />
                  </Tooltip>
                </Stack>
              </Box>

              {/* Image Viewer with Tabs */}
              <Box sx={{ px: 2 }}>
                {imagesList.length > 1 && (
                  <Tabs
                    value={imageTab}
                    onChange={(_e, v: number) =>
                      setSelectedImageTab((prev) => ({
                        ...prev,
                        [product.code]: v,
                      }))
                    }
                    variant="fullWidth"
                    sx={{
                      minHeight: 32,
                      mb: 1,
                      "& .MuiTab-root": {
                        minHeight: 32,
                        py: 0.5,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        textTransform: "none",
                      },
                    }}
                  >
                    {imagesList.map((img, i) => (
                      <Tab key={img.label} label={img.label} value={i} />
                    ))}
                  </Tabs>
                )}

                <Box
                  sx={{
                    height: 210,
                    borderRadius: 2,
                    overflow: "hidden",
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#1e1e1e" : "#f8f9fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {currentImageUrl ? (
                    <ZoomableImage
                      src={currentImageUrl}
                      zoomIn
                      style={{ width: "100%", height: "100%" }}
                      imageProps={{
                        alt: product.product_name,
                        style: {
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        },
                      }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      {t("data_quality.mission.no_image", "No photo available")}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Data Quality Issues List */}
              <CardContent sx={{ flex: 1, p: 2, pt: 1.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "error.main",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mb: 1,
                  }}
                >
                  <WarningAmberRoundedIcon fontSize="small" />
                  {t(
                    "data_quality.mission.detected_errors",
                    "Quality Anomaly:",
                  )}
                </Typography>

                <Stack spacing={1} sx={{ mb: 2 }}>
                  {product.data_quality_errors_tags.map((tag) => {
                    const info = formatErrorTag(tag);
                    return (
                      <Alert
                        key={tag}
                        severity="warning"
                        variant="outlined"
                        sx={{
                          py: 0.5,
                          px: 1,
                          fontSize: "0.78rem",
                          borderRadius: 2,
                          "& .MuiAlert-icon": { py: 0.5, mr: 1 },
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 800, fontSize: "0.8rem" }}
                        >
                          {info.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", lineHeight: 1.3 }}
                        >
                          {info.description}
                        </Typography>
                      </Alert>
                    );
                  })}
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                {/* Action Buttons */}
                <Stack spacing={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    component="a"
                    href={getProductEditUrl(product.code)}
                    target="_blank"
                    rel="noreferrer"
                    endIcon={<OpenInNewRoundedIcon fontSize="small" />}
                    sx={{
                      fontWeight: 700,
                      borderRadius: 2,
                      textTransform: "none",
                      py: 0.8,
                    }}
                  >
                    {t(
                      "data_quality.mission.edit_on_off",
                      "Edit on Open Food Facts",
                    )}
                  </Button>

                  {hasNutritionError && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      component="a"
                      href={getNutritionExtractorUrl(product.code)}
                      target="_blank"
                      rel="noreferrer"
                      startIcon={<TableChartRoundedIcon fontSize="small" />}
                      sx={{
                        fontWeight: 700,
                        borderRadius: 2,
                        textTransform: "none",
                        py: 0.6,
                      }}
                    >
                      {t(
                        "data_quality.mission.open_nutrition_game",
                        "Extract Nutrition Table AI",
                      )}
                    </Button>
                  )}

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant={isFixed ? "outlined" : "contained"}
                      color="success"
                      fullWidth
                      startIcon={<CheckCircleRoundedIcon />}
                      onClick={() => handleMarkAsFixed(product.code)}
                      disabled={isFixed}
                      sx={{
                        fontWeight: 700,
                        borderRadius: 2,
                        textTransform: "none",
                      }}
                    >
                      {isFixed
                        ? t("data_quality.mission.fixed", "Fixed ✓")
                        : t("data_quality.mission.mark_fixed", "Mark as Fixed")}
                    </Button>

                    <Button
                      variant="outlined"
                      color="inherit"
                      component="a"
                      href={getProductViewUrl(product.code)}
                      target="_blank"
                      rel="noreferrer"
                      sx={{
                        minWidth: 44,
                        px: 1,
                        borderRadius: 2,
                      }}
                      title={t(
                        "data_quality.mission.view_product",
                        "View product page",
                      )}
                    >
                      <OpenInNewRoundedIcon fontSize="small" />
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
