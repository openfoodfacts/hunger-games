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
  Tabs,
  Tab,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import TextFieldsIcon from "@mui/icons-material/TextFields";

import { useCountry } from "../../contexts/CountryProvider";
import LoginContext from "../../contexts/login";
import off from "../../off";
import countries from "../../assets/countries.json";
import Loader from "../loader";
import PolyglotPhotoViewer from "./components/PolyglotPhotoViewer";
import PolyglotActionPanel from "./components/PolyglotActionPanel";
import PolyglotPhotoCleaner from "./components/PolyglotPhotoCleaner";
import PolyglotTextSwapper from "./components/PolyglotTextSwapper";
import usePolyglotData from "./usePolyglotData";
import {
  POLYGLOT_CHALLENGE_OPTIONS,
  PolyglotChallengeOption,
  PolyglotMode,
} from "./types";

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

export default function PolyglotPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useTypedSearchParams();
  const barcodeParam = searchParams.get("code") || "";
  const challengeParam = searchParams.get("challenge") || "en-contains-fr";
  const modeParam = (searchParams.get("mode") as PolyglotMode) || "photos";

  const handleModeChange = (
    _e: React.SyntheticEvent,
    newMode: PolyglotMode | null,
  ) => {
    if (!newMode) return;
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set("mode", newMode);
      return next;
    });
  };

  const [country, setCountry] = useCountry();
  const { isLoggedIn } = React.useContext(LoginContext);

  const selectedChallenge = React.useMemo(() => {
    return (
      POLYGLOT_CHALLENGE_OPTIONS.find(
        (opt) => opt.id === challengeParam || opt.tag === challengeParam,
      ) || POLYGLOT_CHALLENGE_OPTIONS[0]
    );
  }, [challengeParam]);

  const {
    currentProduct,
    detectedOcr,
    isOcrLoading,
    totalCount,
    solvedCount,
    isLoading,
    error,
    skipCurrent,
    solveCurrent,
    refetch,
  } = usePolyglotData(country, selectedChallenge, barcodeParam || undefined);

  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [score, setScore] = React.useState<number>(0);
  const [streak, setStreak] = React.useState<number>(0);
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

  const handleSave = async (
    actionType: "move_all" | "move_text" | "shared_image",
    targetLang: string,
  ) => {
    if (!currentProduct) return;

    if (!isLoggedIn) {
      setSnackbarMessage(
        t(
          "polyglot.login_required",
          "Veuillez vous connecter à Open Food Facts pour enregistrer vos corrections.",
        ),
      );
      setSnackbarSeverity("error");
      return;
    }

    setIsSaving(true);
    try {
      if (actionType === "move_all") {
        const oldLang = currentProduct.lang || "en";
        await off.updateProductLanguageData({
          code: currentProduct.code,
          lang: targetLang,
          moveOldLangData: { oldLang },
          comment: `Changer la langue principale vers ${targetLang} (Jeu Polyglot)`,
        });
        setScore((s) => s + 15);
      } else if (actionType === "shared_image") {
        // Assign image 1 to front_<targetLang>
        const targetField = `front_${targetLang}`;
        await off.setImageLanguage({
          code: currentProduct.code,
          imgid: "1",
          imageField: targetField,
          comment: `Valider la photo pour ${targetLang} en emballage partagé (Jeu Polyglot)`,
        });
        setScore((s) => s + 10);
      } else if (actionType === "move_text") {
        const fields: Record<string, string> = {};
        if (currentProduct.product_name) {
          fields[`product_name_${targetLang}`] = currentProduct.product_name;
        }
        if (currentProduct.ingredients_text) {
          fields[`ingredients_text_${targetLang}`] =
            currentProduct.ingredients_text;
        }
        await off.updateProductLanguageData({
          code: currentProduct.code,
          fields,
          comment: `Déplacer les textes vers ${targetLang} (Jeu Polyglot)`,
        });
        setScore((s) => s + 10);
      }

      setStreak((st) => st + 1);
      solveCurrent();
      setSnackbarMessage(
        t(
          "polyglot.save_success",
          "Bravo ! Le produit a été mis à jour avec succès.",
        ),
      );
      setSnackbarSeverity("success");
    } catch (err: unknown) {
      console.error(err);
      setSnackbarMessage(
        t(
          "polyglot.save_error",
          "Erreur lors de l'enregistrement de la correction.",
        ),
      );
      setSnackbarSeverity("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnselectPhoto = async (imageRole: string) => {
    if (!currentProduct) return;
    if (!isLoggedIn) {
      setSnackbarMessage(
        t(
          "polyglot.login_required",
          "Veuillez vous connecter à Open Food Facts pour enregistrer vos corrections.",
        ),
      );
      setSnackbarSeverity("error");
      return;
    }

    setIsSaving(true);
    try {
      await off.unselectProductImage({
        code: currentProduct.code,
        id: imageRole,
      });
      setScore((s) => s + 10);
      setStreak((st) => st + 1);
      solveCurrent();
      setSnackbarMessage(
        t(
          "polyglot.photos.unselect_success",
          "Photo retirée de cette langue avec succès !",
        ),
      );
      setSnackbarSeverity("success");
    } catch (err: unknown) {
      console.error(err);
      setSnackbarMessage(
        t(
          "polyglot.save_error",
          "Erreur lors de l'enregistrement de la correction.",
        ),
      );
      setSnackbarSeverity("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTransferPhoto = async (
    sourceRole: string,
    targetRole: string,
    imgid: string,
  ) => {
    if (!currentProduct) return;
    if (!isLoggedIn) {
      setSnackbarMessage(
        t(
          "polyglot.login_required",
          "Veuillez vous connecter à Open Food Facts pour enregistrer vos corrections.",
        ),
      );
      setSnackbarSeverity("error");
      return;
    }

    setIsSaving(true);
    try {
      await off.setImageLanguage({
        code: currentProduct.code,
        imgid,
        imageField: targetRole,
        comment: `Transférer la photo vers ${targetRole} (Jeu Polyglot)`,
      });
      if (sourceRole !== targetRole) {
        await off.unselectProductImage({
          code: currentProduct.code,
          id: sourceRole,
        });
      }
      setScore((s) => s + 15);
      setStreak((st) => st + 1);
      solveCurrent();
      setSnackbarMessage(
        t(
          "polyglot.photos.transfer_success",
          "Photo transférée vers la bonne langue !",
        ),
      );
      setSnackbarSeverity("success");
    } catch (err: unknown) {
      console.error(err);
      setSnackbarMessage(
        t(
          "polyglot.save_error",
          "Erreur lors de l'enregistrement de la correction.",
        ),
      );
      setSnackbarSeverity("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSharePhoto = async (targetRole: string, imgid: string) => {
    if (!currentProduct) return;
    if (!isLoggedIn) {
      setSnackbarMessage(
        t(
          "polyglot.login_required",
          "Veuillez vous connecter à Open Food Facts pour enregistrer vos corrections.",
        ),
      );
      setSnackbarSeverity("error");
      return;
    }

    setIsSaving(true);
    try {
      await off.setImageLanguage({
        code: currentProduct.code,
        imgid,
        imageField: targetRole,
        comment: `Valider la photo pour ${targetRole} en emballage partagé (Jeu Polyglot)`,
      });
      setScore((s) => s + 10);
      setStreak((st) => st + 1);
      solveCurrent();
      setSnackbarMessage(
        t(
          "polyglot.photos.share_success",
          "Photo validée pour l'emballage partagé !",
        ),
      );
      setSnackbarSeverity("success");
    } catch (err: unknown) {
      console.error(err);
      setSnackbarMessage(
        t(
          "polyglot.save_error",
          "Erreur lors de l'enregistrement de la correction.",
        ),
      );
      setSnackbarSeverity("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFields = async (fields: Record<string, string>) => {
    if (!currentProduct) return;
    if (!isLoggedIn) {
      setSnackbarMessage(
        t(
          "polyglot.login_required",
          "Veuillez vous connecter à Open Food Facts pour enregistrer vos corrections.",
        ),
      );
      setSnackbarSeverity("error");
      return;
    }

    setIsSaving(true);
    try {
      await off.updateProductLanguageData({
        code: currentProduct.code,
        fields,
        comment: "Mise à jour des textes multilingues (Jeu Polyglot)",
      });
      setScore((s) => s + 15);
      setStreak((st) => st + 1);
      solveCurrent();
      setSnackbarMessage(
        t("polyglot.texts.save_success", "Textes mis à jour avec succès !"),
      );
      setSnackbarSeverity("success");
    } catch (err: unknown) {
      console.error(err);
      setSnackbarMessage(
        t(
          "polyglot.save_error",
          "Erreur lors de l'enregistrement de la correction.",
        ),
      );
      setSnackbarSeverity("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    setStreak(0);
    skipCurrent();
  };

  const handleChallengeChange = (
    newChallenge: PolyglotChallengeOption | null,
  ) => {
    if (!newChallenge) return;
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set("challenge", newChallenge.id);
      next.delete("code");
      return next;
    });
  };

  const handleCountryChange = (newCountry: CountryOption | null) => {
    if (!newCountry) {
      setCountry("world");
    } else {
      setCountry(newCountry.countryCode);
    }
  };

  return (
    <Box sx={{ maxWidth: 1300, mx: "auto", px: { xs: 2, md: 3 }, py: 3 }}>
      {/* Top Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LanguageIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {t("polyglot.title", "Polyglot : Le Chasseur de Langues")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t(
                  "polyglot.subtitle",
                  "Aidez à remettre chaque photo, texte et emballage dans la bonne langue !",
                )}
              </Typography>
            </Box>
          </Stack>

          {/* Gamification Stats */}
          <Stack direction="row" spacing={3} alignItems="center">
            <Box sx={{ textAlign: "right" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 700 }}
              >
                SCORE
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "primary.main" }}
              >
                {score} pts
              </Typography>
            </Box>

            <Box sx={{ textAlign: "right" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 700 }}
              >
                SÉRIE
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: streak > 2 ? "error.main" : "success.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 0.5,
                }}
              >
                {streak > 2 && <WhatshotIcon fontSize="small" />} x{streak}
              </Typography>
            </Box>

            <Box sx={{ textAlign: "right" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 700 }}
              >
                RÉSOLUS
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {solvedCount}
              </Typography>
            </Box>
          </Stack>
        </Stack>

        {/* Filters Bar */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ mt: 3, alignItems: { xs: "stretch", md: "center" } }}
        >
          {/* Challenge Selector */}
          <Autocomplete<PolyglotChallengeOption>
            value={selectedChallenge}
            onChange={(_e, val) => handleChallengeChange(val)}
            options={POLYGLOT_CHALLENGE_OPTIONS}
            getOptionLabel={(opt) => opt.label}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            disableClearable
            sx={{ flex: 1.5 }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label={t("polyglot.challenge_label", "Défi de langue")}
              />
            )}
          />

          {/* Country Selector */}
          <Autocomplete<CountryOption>
            value={selectedCountry}
            onChange={(_e, val) => handleCountryChange(val)}
            options={countries}
            getOptionLabel={(c) => c.label}
            isOptionEqualToValue={(a, b) => a.countryCode === b.countryCode}
            sx={{ flex: 1 }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label={t("polyglot.country_filter", "Pays (optionnel)")}
                placeholder="Monde entier"
              />
            )}
          />

          {/* Total count badge */}
          {totalCount > 0 && (
            <Chip
              label={`${totalCount} produits dans cette sélection`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700, height: 38 }}
            />
          )}
        </Stack>
      </Paper>

      {/* Micro-Games Mode Tabs */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          mb: 3,
          overflow: "hidden",
        }}
      >
        <Tabs
          value={modeParam}
          onChange={handleModeChange}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            bgcolor: "background.paper",
            px: 1,
            "& .MuiTab-root": {
              py: 1.5,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
            },
          }}
        >
          <Tab
            value="photos"
            icon={<PhotoCameraIcon />}
            iconPosition="start"
            label={t("polyglot.modes.photos_tab", "1. Démêleur de photos")}
          />
          <Tab
            value="texts"
            icon={<TextFieldsIcon />}
            iconPosition="start"
            label={t(
              "polyglot.modes.texts_tab",
              "2. Textes côte-à-côte (Swap)",
            )}
          />
          <Tab
            value="full"
            icon={<LanguageIcon />}
            iconPosition="start"
            label={t("polyglot.modes.full_tab", "3. Bascule globale")}
          />
        </Tabs>
      </Paper>

      {/* Main Content Area */}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 3, mb: 3 }}>
          {error.message}
          <Button size="small" onClick={() => void refetch()} sx={{ ml: 2 }}>
            Réessayer
          </Button>
        </Alert>
      ) : !currentProduct ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <CheckCircleIcon
            sx={{ fontSize: 56, color: "success.main", mb: 1.5 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {t(
              "polyglot.all_solved_title",
              "Bravo ! Toutes les anomalies de cette sélection sont corrigées",
            )}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, maxWidth: 500, mx: "auto" }}
          >
            {t(
              "polyglot.all_solved_desc",
              "Vous avez épuisé les produits signalés pour ce filtre. Essayez un autre défi de langue !",
            )}
          </Typography>
          <Button
            variant="contained"
            onClick={() => handleChallengeChange(POLYGLOT_CHALLENGE_OPTIONS[1])}
            sx={{
              mt: 3,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Choisir un autre défi
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3} alignItems="flex-start">
          {/* Left: Photo viewer with OCR detection */}
          <Grid item xs={12} md={modeParam === "texts" ? 5 : 6}>
            <PolyglotPhotoViewer
              product={currentProduct}
              detectedOcr={detectedOcr}
              isOcrLoading={isOcrLoading}
            />
          </Grid>

          {/* Right: Contributor action panel according to active micro-game */}
          <Grid item xs={12} md={modeParam === "texts" ? 7 : 6}>
            {modeParam === "photos" && (
              <PolyglotPhotoCleaner
                product={currentProduct}
                detectedOcr={detectedOcr}
                challenge={selectedChallenge}
                isLoggedIn={isLoggedIn}
                isSaving={isSaving}
                onUnselect={handleUnselectPhoto}
                onTransfer={handleTransferPhoto}
                onShare={handleSharePhoto}
                onSkip={handleSkip}
              />
            )}
            {modeParam === "texts" && (
              <PolyglotTextSwapper
                product={currentProduct}
                challenge={selectedChallenge}
                isLoggedIn={isLoggedIn}
                isSaving={isSaving}
                onSaveFields={handleSaveFields}
                onSkip={handleSkip}
              />
            )}
            {modeParam === "full" && (
              <PolyglotActionPanel
                product={currentProduct}
                detectedOcr={detectedOcr}
                isLoggedIn={isLoggedIn}
                isSaving={isSaving}
                onSave={handleSave}
                onSkip={handleSkip}
              />
            )}
          </Grid>
        </Grid>
      )}

      {/* Snackbar Notifications */}
      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbarSeverity}
          onClose={() => setSnackbarMessage(null)}
          sx={{ borderRadius: 2.5, fontWeight: 600, boxShadow: 3 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
