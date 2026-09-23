import * as React from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  Chip,
  Paper,
  Grid,
  Snackbar,
  Alert,
  Autocomplete,
} from "@mui/material";
import ScaleIcon from "@mui/icons-material/Scale";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import LoginIcon from "@mui/icons-material/Login";

import { useCountry } from "../../contexts/CountryProvider";
import LoginContext from "../../contexts/login";
import off from "../../off";
import { OFF_URL } from "../../const";
import countries from "../../assets/countries.json";
import Loader from "../loader";
import QuantityPhotoViewer from "./QuantityPhotoViewer";
import QuantityEditPanel from "./QuantityEditPanel";
import useQuantityData from "./useQuantityData";
import { QUANTITY_WARNING_OPTIONS, QuantityWarningOption } from "./types";

interface CountryOption {
  id: string;
  label: string;
  languageCode: string;
  countryCode: string;
}

export default function QuantitiesPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const barcodeParam = searchParams.get("code") || "";
  const warningParam = searchParams.get("warning") || "quantity-not-recognized";

  const [country, setCountry] = useCountry();
  const { isLoggedIn } = React.useContext(LoginContext);

  const selectedWarningOption = React.useMemo(() => {
    return (
      QUANTITY_WARNING_OPTIONS.find(
        (opt) => opt.tag === warningParam || opt.id === warningParam,
      ) || QUANTITY_WARNING_OPTIONS[1] // default to quantity-not-recognized
    );
  }, [warningParam]);

  const {
    currentProduct,
    totalCount,
    solvedCount,
    isLoading,
    error,
    skipCurrent,
    solveCurrent,
    retry,
  } = useQuantityData(
    country,
    selectedWarningOption.tag,
    barcodeParam || undefined,
  );

  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState<string | null>(
    null,
  );
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<
    "success" | "error"
  >("success");

  const selectedCountry = React.useMemo(() => {
    if (!country || country === "world") return null;
    return countries.find((c) => c.countryCode === country) || null;
  }, [country]);

  const facetWebUrl = React.useMemo(() => {
    if (selectedWarningOption.tag) {
      return `https://world.openfoodfacts.org/data-quality-warning/${selectedWarningOption.tag}`;
    }
    return "https://world.openfoodfacts.org/facets/data-quality-warnings?filter=quantity";
  }, [selectedWarningOption.tag]);

  const handleSave = async (newQuantity: string, newServingSize?: string) => {
    if (!currentProduct) return;

    if (!isLoggedIn) {
      setSnackbarMessage(
        t(
          "quantities.login_required",
          "Veuillez vous connecter à Open Food Facts pour enregistrer vos modifications.",
        ),
      );
      setSnackbarSeverity("error");
      return;
    }

    setIsSaving(true);
    try {
      await off.updateProductQuantity({
        code: currentProduct.code,
        quantity: newQuantity,
        servingSize: newServingSize,
        comment: `Fix quantity (${selectedWarningOption.id}) via Hunger Games`,
      });

      setSnackbarMessage(
        t("quantities.save_success", "Quantité enregistrée avec succès !"),
      );
      setSnackbarSeverity("success");
      solveCurrent();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : t("quantities.save_error", "Erreur lors de l'enregistrement");
      setSnackbarMessage(msg);
      setSnackbarSeverity("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: { xs: 1.5, sm: 2.5, md: 3 } }}>
      {/* Top Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #FFFDF7 0%, #FFF4E5 100%)",
          border: "1px solid #FFE0B2",
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
                  bgcolor: "#FF6F00",
                  color: "white",
                  p: 1.25,
                  borderRadius: 2,
                  display: "flex",
                }}
              >
                <ScaleIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight={800}
                  color="#341100"
                >
                  {t("quantities.title", "Poids & Quantités")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t(
                    "quantities.subtitle",
                    "Corrigez et normalisez les quantités et contenances de produits signalées par les alertes de qualité.",
                  )}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack
            direction="row"
            spacing={1.5}
            flexWrap="wrap"
            alignItems="center"
          >
            <Chip
              icon={<CheckCircleIcon />}
              label={`${solvedCount} ${t("quantities.fixed_session", "corrigés cette session")}`}
              color="success"
              variant="filled"
              sx={{ fontWeight: 600 }}
            />
            {totalCount > 0 && (
              <Chip
                label={`${totalCount.toLocaleString()} ${t("quantities.total_in_facet", "au total dans la facette")}`}
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            )}
            <Button
              size="small"
              variant="text"
              target="_blank"
              href={facetWebUrl}
              endIcon={<OpenInNewIcon fontSize="small" />}
            >
              {t("quantities.view_facet", "Facette OFF")}
            </Button>
          </Stack>
        </Stack>

        {/* Filters bar */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ mt: 2.5, alignItems: { xs: "stretch", md: "center" } }}
        >
          {/* Warning Selector */}
          <Autocomplete<QuantityWarningOption>
            value={selectedWarningOption}
            onChange={(_event, newValue) => {
              const newTag = newValue?.tag || "all";
              const next = new URLSearchParams(searchParams);
              if (newTag === "all" || !newTag) {
                next.delete("warning");
              } else {
                next.set("warning", newTag);
              }
              setSearchParams(next);
            }}
            options={QUANTITY_WARNING_OPTIONS}
            getOptionLabel={(opt) => opt.label}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("quantities.filter_warning", "Type d'anomalie")}
                size="small"
                sx={{ bgcolor: "white", borderRadius: 1 }}
              />
            )}
            sx={{ flex: 1.5, minWidth: { xs: "100%", md: 320 } }}
          />

          {/* Country Selector */}
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
            sx={{ flex: 1, minWidth: { xs: "100%", md: 220 } }}
          />

          {/* Barcode Search */}
          <TextField
            size="small"
            placeholder={t(
              "reverso.barcode_placeholder",
              "Filtrer par code-barres...",
            )}
            value={barcodeParam}
            onChange={(e) => {
              const val = e.target.value.trim();
              const next = new URLSearchParams(searchParams);
              if (val) {
                next.set("code", val);
              } else {
                next.delete("code");
              }
              setSearchParams(next);
            }}
            sx={{
              flex: 1,
              minWidth: { xs: "100%", md: 220 },
              bgcolor: "white",
              borderRadius: 1,
            }}
          />

          {barcodeParam && (
            <Button
              size="small"
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete("code");
                setSearchParams(next);
              }}
              variant="outlined"
            >
              {t("reverso.clear_filter", "Effacer")}
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
              "quantities.login_notice_banner",
              "Pour enregistrer directement vos corrections de quantité sur Open Food Facts, veuillez vous connecter.",
            )}
          </Alert>
        )}
      </Paper>

      {/* Main Content */}
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
            bgcolor: "background.paper",
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <CheckCircleIcon
            sx={{ fontSize: 64, color: "success.main", mb: 2 }}
          />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {t("quantities.empty_title", "Bravo ! Aucun produit à corriger.")}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 520, mx: "auto" }}
          >
            {t(
              "quantities.empty_desc",
              "Tous les produits de cette sélection ont été examinés ou il n'y a plus d'anomalies de quantité pour ce filtre.",
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
          {/* Left Column: Photos Viewer */}
          <Grid size={{ xs: 12, md: 6, lg: 7 }}>
            <QuantityPhotoViewer product={currentProduct} />
          </Grid>

          {/* Right Column: Quantity Edit Panel */}
          <Grid size={{ xs: 12, md: 6, lg: 5 }}>
            <QuantityEditPanel
              product={currentProduct}
              isLoggedIn={isLoggedIn}
              onSave={handleSave}
              onSkip={skipCurrent}
              isSaving={isSaving}
            />
          </Grid>
        </Grid>
      )}

      {/* Notification Toast */}
      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={3500}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarMessage(null)}
          severity={snackbarSeverity}
          sx={{ width: "100%", boxShadow: 3, fontWeight: 600 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
