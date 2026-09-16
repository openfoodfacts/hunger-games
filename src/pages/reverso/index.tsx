import * as React from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Alert,
  Chip,
  Paper,
  Grid,
  Snackbar,
  CircularProgress,
  Autocomplete,
  Link as MuiLink,
} from "@mui/material";

import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import BoltIcon from "@mui/icons-material/Bolt";
import LoginIcon from "@mui/icons-material/Login";

import { useCountry } from "../../contexts/CountryProvider";
import LoginContext from "../../contexts/login";
import off from "../../off";
import { OFF_URL } from "../../const";
import countries from "../../assets/countries.json";
import ZoomableImage from "../../components/ZoomableImage";
import Loader from "../loader";
import useReversoData, { ReversoProduct } from "./useReversoData";

interface CountryOption {
  id: string;
  label: string;
  languageCode: string;
  countryCode: string;
}

// 1 kcal = 4.184 kJ
const KCAL_TO_KJ_RATIO = 4.184;

function calculateRatio(kj: number, kcal: number): number | null {
  if (!kcal || kcal <= 0 || !kj || kj <= 0) return null;
  return Math.round((kj / kcal) * 100) / 100;
}

function isRatioConsistent(ratio: number | null): boolean {
  if (ratio === null) return false;
  // Reasonable ratio between kJ and kcal is around 4.18 (allow margin 3.8 to 4.5)
  return ratio >= 3.8 && ratio <= 4.5;
}

export default function ReversoPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const barcodeParam = searchParams.get("code") || "";
  const [country, setCountry] = useCountry();
  const { isLoggedIn } = React.useContext(LoginContext);

  const {
    currentProduct,
    remainingInQueue,
    totalCount,
    solvedCount,
    isLoading,
    error,
    removeHead,
    solveCurrent,
    retry,
  } = useReversoData(country, barcodeParam || undefined);

  // Nutriments state for current product
  const [kcalValue, setKcalValue] = React.useState<string>("");
  const [kjValue, setKjValue] = React.useState<string>("");
  const [kcalServing, setKcalServing] = React.useState<string>("");
  const [kjServing, setKjServing] = React.useState<string>("");
  const [activeImageIndex, setActiveImageIndex] = React.useState<number>(0);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [copiedCode, setCopiedCode] = React.useState<boolean>(false);

  // Initialize values when currentProduct changes
  React.useEffect(() => {
    if (!currentProduct) {
      setKcalValue("");
      setKjValue("");
      setKcalServing("");
      setKjServing("");
      setActiveImageIndex(0);
      return;
    }

    const nutriments = currentProduct.nutriments || {};

    const rawKcal =
      nutriments["energy-kcal_100g"] ??
      nutriments["energy-kcal_value"] ??
      nutriments["energy-kcal"] ??
      "";
    const rawKj =
      nutriments["energy-kj_100g"] ??
      nutriments["energy-kj_value"] ??
      nutriments["energy-kj"] ??
      "";

    const rawKcalServing =
      nutriments["energy-kcal_serving"] ??
      nutriments["energy-kcal_prepared_serving"] ??
      "";
    const rawKjServing =
      nutriments["energy-kj_serving"] ??
      nutriments["energy-kj_prepared_serving"] ??
      "";

    // Automatically propose the swapped values since this product is in the reversed facet!
    setKcalValue(rawKj !== "" ? String(rawKj) : "");
    setKjValue(rawKcal !== "" ? String(rawKcal) : "");
    setKcalServing(rawKjServing !== "" ? String(rawKjServing) : "");
    setKjServing(rawKcalServing !== "" ? String(rawKcalServing) : "");
    setActiveImageIndex(0);
  }, [currentProduct]);

  // Extract all available images
  const productImages = React.useMemo(() => {
    if (!currentProduct) return [];
    const images: { url: string; urlFull?: string; label: string }[] = [];

    if (currentProduct.image_nutrition_url) {
      images.push({
        url: currentProduct.image_nutrition_url,
        urlFull: currentProduct.image_nutrition_url.replace(
          /\.400\.jpg$/,
          ".jpg",
        ),
        label: t("reverso.image_nutrition", "Tableau nutritionnel"),
      });
    }

    if (currentProduct.image_front_url) {
      images.push({
        url: currentProduct.image_front_url,
        urlFull: currentProduct.image_front_url.replace(/\.400\.jpg$/, ".jpg"),
        label: t("reverso.image_front", "Face avant"),
      });
    }

    // Add any raw numbered images
    if (currentProduct.images && currentProduct.code) {
      const formattedCode = off.getFormatedBarcode(currentProduct.code);
      const rootImageUrl = off.getImageUrl(formattedCode);
      Object.keys(currentProduct.images)
        .filter((key) => !isNaN(Number(key)))
        .sort((a, b) => Number(a) - Number(b))
        .forEach((key) => {
          const imgUrl = `${rootImageUrl}/${key}.400.jpg`;
          const imgFull = `${rootImageUrl}/${key}.jpg`;
          if (!images.some((i) => i.url === imgUrl)) {
            images.push({
              url: imgUrl,
              urlFull: imgFull,
              label: `${t("reverso.photo", "Photo")} #${key}`,
            });
          }
        });
    }

    return images;
  }, [currentProduct, t]);

  // Swap function
  const handleSwap = () => {
    setKcalValue((prevKcal) => {
      const currentKj = kjValue;
      setKjValue(prevKcal);
      return currentKj;
    });

    if (kcalServing || kjServing) {
      setKcalServing((prevServingKcal) => {
        const currentServingKj = kjServing;
        setKjServing(prevServingKcal);
        return currentServingKj;
      });
    }
  };

  // Handle Save
  const handleSave = async () => {
    if (!currentProduct) return;
    if (!isLoggedIn) {
      setErrorMessage(
        t(
          "reverso.login_required",
          "Veuillez vous connecter à Open Food Facts pour enregistrer la modification.",
        ),
      );
      return;
    }

    if (!kcalValue || !kjValue) {
      setErrorMessage(
        t(
          "reverso.values_required",
          "Veuillez renseigner à la fois la valeur en kcal et en kJ.",
        ),
      );
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await off.updateProductNutriments({
        code: currentProduct.code,
        energyKcal: kcalValue,
        energyKj: kjValue,
        nutritionDataPer: currentProduct.nutrition_data_per || "100g",
        energyKcalServing: kcalServing || undefined,
        energyKjServing: kjServing || undefined,
        comment: "Fix reversed kcal/kJ (Reverso game)",
      });

      setSaveSuccess(true);
      solveCurrent();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Copy barcode to clipboard
  const handleCopyBarcode = () => {
    if (currentProduct?.code) {
      navigator.clipboard.writeText(currentProduct.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Stored values before swap for comparison
  const storedKcal =
    currentProduct?.nutriments?.["energy-kcal_100g"] ??
    currentProduct?.nutriments?.["energy-kcal"] ??
    "";
  const storedKj =
    currentProduct?.nutriments?.["energy-kj_100g"] ??
    currentProduct?.nutriments?.["energy-kj"] ??
    "";

  const numKcal = parseFloat(kcalValue);
  const numKj = parseFloat(kjValue);
  const currentRatio = calculateRatio(numKj, numKcal);
  const ratioIsGood = isRatioConsistent(currentRatio);

  const selectedCountry = React.useMemo(() => {
    if (!country || country === "world") return null;
    return countries.find((c) => c.countryCode === country) || null;
  }, [country]);

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: { xs: 2, md: 3 } }}>
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #FFF9F2 0%, #FFF0E6 100%)",
          border: "1px solid #FFE0CC",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
          }}
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  bgcolor: "#FF5722",
                  color: "white",
                  p: 1,
                  borderRadius: 2,
                  display: "flex",
                }}
              >
                <SwapHorizIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight={800}
                  color="#341100"
                >
                  {t("reverso.title", "Reverso")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t(
                    "reverso.subtitle",
                    "Corrigez les produits dont les valeurs énergétiques en kcal et kJ sont inversées (1 kcal ≈ 4,184 kJ).",
                  )}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Chip
              icon={<CheckCircleIcon />}
              label={`${solvedCount} ${t("reverso.fixed_session", "corrigés cette session")}`}
              color="success"
              variant="filled"
              sx={{ fontWeight: 600 }}
            />
            {totalCount > 0 && (
              <Chip
                label={`${totalCount} ${t("reverso.total_in_facet", "au total dans la facette")}`}
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            )}
            <Button
              size="small"
              variant="text"
              target="_blank"
              href="https://world.openfoodfacts.org/facets/data-quality-errors/energy-value-in-kcal-and-kj-are-reversed.json"
              endIcon={<OpenInNewIcon fontSize="small" />}
            >
              {t("reverso.view_facet", "Facette")}
            </Button>
          </Stack>
        </Stack>

        {/* Search & Filters */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mt: 2.5, alignItems: "center" }}
        >
          <Autocomplete<CountryOption>
            value={selectedCountry}
            onChange={(_event, newValue) => {
              setCountry(newValue?.countryCode || "", "page");
            }}
            options={countries}
            isOptionEqualToValue={(opt, val) =>
              opt.countryCode === val.countryCode
            }
            getOptionLabel={(opt) => opt.label}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("questions.filters.long_label.country", "Pays")}
                size="small"
                sx={{ bgcolor: "white", borderRadius: 1 }}
              />
            )}
            sx={{ width: { xs: "100%", sm: 260 } }}
          />

          <TextField
            size="small"
            placeholder={t(
              "reverso.barcode_placeholder",
              "Filtrer par code-barres...",
            )}
            value={barcodeParam}
            onChange={(e) => {
              const val = e.target.value.trim();
              if (val) {
                setSearchParams({ code: val });
              } else {
                setSearchParams({});
              }
            }}
            sx={{
              width: { xs: "100%", sm: 260 },
              bgcolor: "white",
              borderRadius: 1,
            }}
          />

          {barcodeParam && (
            <Button
              size="small"
              onClick={() => setSearchParams({})}
              variant="outlined"
            >
              {t("reverso.clear_filter", "Effacer le filtre")}
            </Button>
          )}
        </Stack>

        {!isLoggedIn && (
          <Alert
            severity="info"
            icon={<LoginIcon />}
            action={
              <Button
                color="inherit"
                size="small"
                component="a"
                href={`${OFF_URL}/cgi/login.pl`}
                target="_blank"
              >
                {t("login.title", "Se connecter")}
              </Button>
            }
            sx={{ mt: 2 }}
          >
            {t(
              "reverso.login_notice",
              "Vous pouvez inspecter les produits. Pour enregistrer vos corrections directement sur Open Food Facts, veuillez vous connecter.",
            )}
          </Alert>
        )}
      </Paper>

      {/* Main Content State */}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={retry}>
              {t("common.retry", "Réessayer")}
            </Button>
          }
        >
          {error}
        </Alert>
      ) : !currentProduct ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: "#FAFAFA",
            border: "1px dashed #CCC",
          }}
        >
          <CheckCircleIcon
            sx={{ fontSize: 64, color: "success.main", mb: 2 }}
          />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {t("reverso.empty_title", "Bravo ! Aucun produit à corriger.")}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 500, mx: "auto" }}
          >
            {t(
              "reverso.empty_desc",
              "Tous les produits de cette sélection ont été examinés ou il n'y a plus d'erreurs d'inversion kcal/kJ.",
            )}
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => {
              setSearchParams({});
              setCountry("", "page");
              retry();
            }}
          >
            {t("reverso.refresh_all", "Réinitialiser et recharger")}
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Left Column: Photos / Packaging viewer */}
          <Grid size={{ xs: 12, md: 6, lg: 7 }}>
            <Card
              elevation={2}
              sx={{
                borderRadius: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#FAFAFA",
                  borderBottom: "1px solid #EAEAEA",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle1" fontWeight={700}>
                  {productImages[activeImageIndex]?.label ||
                    t("reverso.packaging_photo", "Photo du produit")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t(
                    "reverso.zoom_hint",
                    "Zoomez sur le tableau nutritionnel pour vérifier les valeurs",
                  )}
                </Typography>
              </Box>

              <Box
                sx={{
                  position: "relative",
                  flexGrow: 1,
                  minHeight: 450,
                  bgcolor: "#201A17",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {productImages.length > 0 ? (
                  <ZoomableImage
                    src={productImages[activeImageIndex].url}
                    srcFull={productImages[activeImageIndex].urlFull}
                    zoomIn
                    style={{
                      width: "100%",
                      height: "500px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    imageProps={{
                      style: {
                        maxWidth: "100%",
                        maxHeight: "500px",
                        objectFit: "contain",
                      },
                    }}
                  />
                ) : (
                  <Stack alignItems="center" spacing={1} color="white">
                    <ErrorOutlineIcon sx={{ fontSize: 48, opacity: 0.6 }} />
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {t(
                        "reverso.no_photos",
                        "Aucune photo disponible pour ce produit.",
                      )}
                    </Typography>
                  </Stack>
                )}
              </Box>

              {/* Thumbnail Selector */}
              {productImages.length > 1 && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    p: 1.5,
                    bgcolor: "#F5F5F5",
                    overflowX: "auto",
                    borderTop: "1px solid #EAEAEA",
                  }}
                >
                  {productImages.map((img, idx) => (
                    <Box
                      key={img.url}
                      onClick={() => setActiveImageIndex(idx)}
                      sx={{
                        cursor: "pointer",
                        width: 70,
                        height: 70,
                        borderRadius: 1.5,
                        overflow: "hidden",
                        border:
                          activeImageIndex === idx
                            ? "2px solid #FF5722"
                            : "2px solid transparent",
                        opacity: activeImageIndex === idx ? 1 : 0.6,
                        transition: "all 0.2s",
                        flexShrink: 0,
                        bgcolor: "#EEE",
                      }}
                    >
                      <img
                        src={img.url}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </Card>
          </Grid>

          {/* Right Column: Reverso Interactive Correction Panel */}
          <Grid size={{ xs: 12, md: 6, lg: 5 }}>
            <Card
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
              }}
            >
              {/* Product Details Header */}
              <Box>
                <Typography variant="h6" fontWeight={800} color="#341100">
                  {currentProduct.product_name ||
                    t("reverso.unnamed_product", "Produit sans nom")}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={500}
                >
                  {currentProduct.brands ||
                    t("reverso.unspecified_brand", "Marque non précisée")}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mt: 1 }}
                >
                  <Chip
                    label={currentProduct.code}
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: "monospace", fontWeight: 600 }}
                  />
                  <Tooltip
                    title={copiedCode ? "Copié !" : "Copier le code-barres"}
                  >
                    <IconButton
                      size="small"
                      onClick={() => void handleCopyBarcode()}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Button
                    size="small"
                    component="a"
                    target="_blank"
                    href={off.getProductUrl(currentProduct.code)}
                    endIcon={<OpenInNewIcon fontSize="small" />}
                  >
                    {t("questions.view", "Voir")}
                  </Button>
                  <Button
                    size="small"
                    component="a"
                    target="_blank"
                    href={off.getProductEditUrl(currentProduct.code)}
                    endIcon={<EditIcon fontSize="small" />}
                  >
                    {t("reverso.edit", "Éditer")}
                  </Button>
                </Stack>
              </Box>

              {/* Current Problem Diagnosis Alert */}
              <Alert
                severity="warning"
                icon={<BoltIcon />}
                sx={{
                  borderRadius: 2,
                  "& .MuiAlert-message": { width: "100%" },
                }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  {t(
                    "reverso.error_detected",
                    "Inversion détectée dans la base :",
                  )}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  • {t("reverso.stored_kcal", "kcal actuel :")}{" "}
                  <strong>{storedKcal || "?"} kcal</strong> (
                  <span style={{ color: "#D84315" }}>
                    trop grand, correspond à des kJ
                  </span>
                  )
                </Typography>
                <Typography variant="body2">
                  • {t("reverso.stored_kj", "kJ actuel :")}{" "}
                  <strong>{storedKj || "?"} kJ</strong> (
                  <span style={{ color: "#D84315" }}>
                    trop faible, correspond à des kcal
                  </span>
                  )
                </Typography>
              </Alert>

              {/* Reverso Interactive Swapper */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: "#FFFDF9",
                  border: "1.5px solid #FFD8A8",
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color="#341100"
                  sx={{ mb: 2 }}
                >
                  {t(
                    "reverso.proposed_correction",
                    "Correction proposée (pour 100g) :",
                  )}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  {/* Energy kcal Box */}
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      label="Énergie (kcal)"
                      value={kcalValue}
                      onChange={(e) => setKcalValue(e.target.value)}
                      type="number"
                      size="medium"
                      fullWidth
                      slotProps={{
                        input: {
                          endAdornment: (
                            <Typography
                              variant="caption"
                              fontWeight={700}
                              color="text.secondary"
                            >
                              kcal
                            </Typography>
                          ),
                        },
                      }}
                      sx={{ bgcolor: "white", borderRadius: 1 }}
                    />
                  </Box>

                  {/* Big Swap Button */}
                  <Tooltip
                    title={t(
                      "reverso.swap_button_tooltip",
                      "Inverser les valeurs kcal ⇄ kJ",
                    )}
                  >
                    <IconButton
                      onClick={handleSwap}
                      sx={{
                        bgcolor: "#FF5722",
                        color: "white",
                        p: 1.5,
                        boxShadow: "0 4px 10px rgba(255, 87, 34, 0.3)",
                        "&:hover": {
                          bgcolor: "#E64A19",
                          transform: "scale(1.05)",
                        },
                        transition: "all 0.2s",
                      }}
                    >
                      <SwapHorizIcon sx={{ fontSize: 28 }} />
                    </IconButton>
                  </Tooltip>

                  {/* Energy kJ Box */}
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      label="Énergie (kJ)"
                      value={kjValue}
                      onChange={(e) => setKjValue(e.target.value)}
                      type="number"
                      size="medium"
                      fullWidth
                      slotProps={{
                        input: {
                          endAdornment: (
                            <Typography
                              variant="caption"
                              fontWeight={700}
                              color="text.secondary"
                            >
                              kJ
                            </Typography>
                          ),
                        },
                      }}
                      sx={{ bgcolor: "white", borderRadius: 1 }}
                    />
                  </Box>
                </Stack>

                {/* Optional Per Serving Inputs (if product has serving values) */}
                {(currentProduct.nutriments?.["energy-kcal_serving"] ||
                  currentProduct.nutriments?.["energy-kj_serving"] ||
                  kcalServing ||
                  kjServing) && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="text.secondary"
                      sx={{ display: "block", mb: 1 }}
                    >
                      {t("reverso.per_serving", "Par portion")} (
                      {currentProduct.serving_size || "portion"}) :
                    </Typography>
                    <Stack direction="row" spacing={1.5}>
                      <TextField
                        label="kcal / portion"
                        value={kcalServing}
                        onChange={(e) => setKcalServing(e.target.value)}
                        type="number"
                        size="small"
                        sx={{ flex: 1, bgcolor: "white" }}
                      />
                      <TextField
                        label="kJ / portion"
                        value={kjServing}
                        onChange={(e) => setKjServing(e.target.value)}
                        type="number"
                        size="small"
                        sx={{ flex: 1, bgcolor: "white" }}
                      />
                    </Stack>
                  </Box>
                )}

                {/* Ratio consistency calculation */}
                <Box sx={{ mt: 2 }}>
                  {currentRatio !== null && (
                    <Chip
                      icon={
                        ratioIsGood ? <CheckCircleIcon /> : <ErrorOutlineIcon />
                      }
                      label={
                        ratioIsGood
                          ? `Ratio kJ/kcal = ${currentRatio} (~4,18) • Cohérent !`
                          : `Ratio kJ/kcal = ${currentRatio} (attention: 1 kcal ≈ 4,18 kJ)`
                      }
                      color={ratioIsGood ? "success" : "warning"}
                      variant={ratioIsGood ? "filled" : "outlined"}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        width: "100%",
                        justifyContent: "flex-start",
                      }}
                    />
                  )}
                </Box>
              </Paper>

              {/* Error feedback if any */}
              {errorMessage && (
                <Alert severity="error" onClose={() => setErrorMessage(null)}>
                  {errorMessage}
                </Alert>
              )}

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={removeHead}
                  startIcon={<SkipNextIcon />}
                  sx={{ flex: 1 }}
                >
                  {t("common.skip", "Passer")}
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={() => void handleSave()}
                  disabled={isSaving || !kcalValue || !kjValue}
                  startIcon={
                    isSaving ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <CheckCircleIcon />
                    )
                  }
                  sx={{
                    flex: 2,
                    fontWeight: 700,
                    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
                  }}
                >
                  {isSaving
                    ? t("reverso.saving", "Enregistrement...")
                    : t("reverso.save_and_next", "Inverser et Enregistrer")}
                </Button>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Success Notification */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={2500}
        onClose={() => setSaveSuccess(false)}
        message={t(
          "reverso.save_success",
          "✓ Produit corrigé et enregistré sur Open Food Facts !",
        )}
      />
    </Box>
  );
}
