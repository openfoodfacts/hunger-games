import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Chip,
  Alert,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import LoginIcon from "@mui/icons-material/Login";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { OFF_URL } from "../../../const";
import {
  PolyglotProduct,
  DetectedLanguageInfo,
  PolyglotChallengeOption,
  LANGUAGE_METADATA,
} from "../types";

interface PolyglotPhotoCleanerProps {
  product: PolyglotProduct;
  detectedOcr?: DetectedLanguageInfo | null;
  challenge: PolyglotChallengeOption;
  isLoggedIn: boolean;
  isSaving: boolean;
  onUnselect: (imageRole: string) => Promise<void>;
  onTransfer: (
    sourceRole: string,
    targetRole: string,
    imgid: string,
  ) => Promise<void>;
  onShare: (targetRole: string, imgid: string) => Promise<void>;
  onSkip: () => void;
}

export default function PolyglotPhotoCleaner({
  product,
  detectedOcr,
  challenge,
  isLoggedIn,
  isSaving,
  onUnselect,
  onTransfer,
  onShare,
  onSkip,
}: PolyglotPhotoCleanerProps) {
  const { t } = useTranslation();

  const sourceLang = challenge.sourceLang || product.lang || "en";
  const detectedLangCode = detectedOcr?.languageCode?.toLowerCase();
  const targetLang =
    (detectedLangCode && LANGUAGE_METADATA[detectedLangCode]
      ? detectedLangCode
      : challenge.targetLang) || "fr";

  const sourceMeta = LANGUAGE_METADATA[sourceLang] || {
    flag: "🌐",
    name: sourceLang.toUpperCase(),
  };
  const targetMeta = LANGUAGE_METADATA[targetLang] || {
    flag: "🌐",
    name: targetLang.toUpperCase(),
  };

  // Determine active photo role being inspected (front, ingredients, packaging)
  const imageType = "front"; // default primary inspected role
  const sourceImageRole = `${imageType}_${sourceLang}`;
  const targetImageRole = `${imageType}_${targetLang}`;

  // Find the primary raw image id
  const imgid = React.useMemo(() => {
    if (!product.images) return "1";
    const numericKeys = Object.keys(product.images)
      .filter((k) => !isNaN(Number(k)))
      .sort((a, b) => Number(a) - Number(b));
    return numericKeys[0] || "1";
  }, [product.images]);

  const handlersRef = React.useRef({
    onUnselect,
    onTransfer,
    onShare,
    onSkip,
    isSaving,
    sourceImageRole,
    targetImageRole,
    imgid,
  });

  React.useEffect(() => {
    handlersRef.current = {
      onUnselect,
      onTransfer,
      onShare,
      onSkip,
      isSaving,
      sourceImageRole,
      targetImageRole,
      imgid,
    };
  });

  // Keyboard shortcuts (1: Unselect, 2: Transfer, 3: Share, S: Skip)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      const prevent =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

      if (prevent || handlersRef.current.isSaving) {
        return;
      }

      if (e.key === "1") {
        e.preventDefault();
        void handlersRef.current.onUnselect(
          handlersRef.current.sourceImageRole,
        );
      } else if (e.key === "2") {
        e.preventDefault();
        void handlersRef.current.onTransfer(
          handlersRef.current.sourceImageRole,
          handlersRef.current.targetImageRole,
          handlersRef.current.imgid,
        );
      } else if (e.key === "3") {
        e.preventDefault();
        void handlersRef.current.onShare(
          handlersRef.current.targetImageRole,
          handlersRef.current.imgid,
        );
      } else if (
        e.key === "s" ||
        e.key === "S" ||
        e.key === "p" ||
        e.key === "P"
      ) {
        e.preventDefault();
        handlersRef.current.onSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <CardContent
        sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}
      >
        {/* Header Question */}
        <Box>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 0.5 }}
          >
            <Chip
              size="small"
              label={t("polyglot.modes.photos_badge", "Tri de photos")}
              color="primary"
              sx={{ fontWeight: 600, fontSize: "0.75rem" }}
            />
            <Typography variant="caption" color="text.secondary">
              {t("polyglot.product_code", "Code")} : {product.code}
            </Typography>
          </Stack>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
            {product.product_name ||
              product.brands ||
              t("polyglot.unnamed_product", "Produit sans nom")}
          </Typography>
        </Box>

        {/* Cognitive Focus Banner */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2.5,
            bgcolor: "action.hover",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            {t(
              "polyglot.photos.inspection_title",
              "Cette photo est-elle bien dans cette langue ?",
            )}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
          >
            <Typography variant="body2" color="text.secondary">
              {t("polyglot.photos.currently_assigned_to", "Attribuée à :")}
            </Typography>
            <Chip
              size="small"
              label={`${sourceMeta.flag} ${sourceMeta.name}`}
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          </Stack>

          {detectedOcr && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 1.5 }}
            >
              <Typography variant="body2" color="text.secondary">
                {t(
                  "polyglot.photos.detected_by_ocr",
                  "Texte lu sur l'emballage :",
                )}
              </Typography>
              <Chip
                size="small"
                label={`${targetMeta.flag} ${targetMeta.name} (${Math.round(detectedOcr.confidence * 100)}%)`}
                color="success"
                sx={{ fontWeight: 700 }}
              />
            </Stack>
          )}
        </Box>

        {!isLoggedIn && (
          <Alert
            severity="warning"
            icon={<LoginIcon />}
            sx={{ borderRadius: 2 }}
          >
            {t(
              "polyglot.login_hint",
              "Connectez-vous à Open Food Facts pour que vos corrections soient enregistrées.",
            )}
          </Alert>
        )}

        <Divider />

        {/* 1-Click Action Buttons */}
        <Stack spacing={1.5}>
          {/* Action 1: Unselect */}
          <Button
            variant="contained"
            color="error"
            size="large"
            disabled={isSaving}
            onClick={() => void onUnselect(sourceImageRole)}
            startIcon={<DeleteIcon />}
            sx={{
              py: 1.25,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
              justifyContent: "space-between",
              boxShadow: 1,
            }}
          >
            <span>
              {t(
                "polyglot.photos.btn_unselect",
                "Retirer de {{lang}} (Mauvaise langue)",
                { lang: sourceMeta.name },
              )}
            </span>
            <Chip
              size="small"
              label="Touche 1"
              sx={{
                bgcolor: "rgba(255,255,255,0.25)",
                color: "white",
                fontWeight: 700,
                height: 20,
              }}
            />
          </Button>

          {/* Action 2: Transfer to detected language */}
          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={isSaving}
            onClick={() =>
              void onTransfer(sourceImageRole, targetImageRole, imgid)
            }
            startIcon={<SwapHorizIcon />}
            sx={{
              py: 1.25,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
              justifyContent: "space-between",
              boxShadow: 1,
            }}
          >
            <span>
              {t("polyglot.photos.btn_transfer", "Transférer vers {{lang}}", {
                lang: targetMeta.name,
              })}
            </span>
            <Chip
              size="small"
              label="Touche 2"
              sx={{
                bgcolor: "rgba(255,255,255,0.25)",
                color: "white",
                fontWeight: 700,
                height: 20,
              }}
            />
          </Button>

          {/* Action 3: Shared Multilingual Packaging */}
          <Button
            variant="outlined"
            color="success"
            size="large"
            disabled={isSaving}
            onClick={() => void onShare(targetImageRole, imgid)}
            startIcon={<DoneAllIcon />}
            sx={{
              py: 1.2,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
              justifyContent: "space-between",
              borderWidth: 2,
              "&:hover": { borderWidth: 2 },
            }}
          >
            <span>
              {t(
                "polyglot.photos.btn_share",
                "Emballage multilingue (Valider aussi pour {{lang}})",
                { lang: targetMeta.name },
              )}
            </span>
            <Chip
              size="small"
              label="Touche 3"
              sx={{
                bgcolor: "success.light",
                color: "success.contrastText",
                fontWeight: 700,
                height: 20,
              }}
            />
          </Button>

          {/* Action 4: Skip */}
          <Button
            variant="text"
            color="inherit"
            disabled={isSaving}
            onClick={onSkip}
            startIcon={<SkipNextIcon />}
            sx={{
              textTransform: "none",
              color: "text.secondary",
              fontWeight: 600,
              justifyContent: "space-between",
              px: 2,
            }}
          >
            <span>{t("polyglot.btn_skip", "Passer ce produit")}</span>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              Touche S
            </Typography>
          </Button>
        </Stack>

        <Divider />

        {/* External Link */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            component="a"
            href={`${OFF_URL}/product/${product.code}`}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            endIcon={<OpenInNewIcon fontSize="small" />}
            sx={{
              textTransform: "none",
              fontSize: "0.75rem",
              color: "text.secondary",
            }}
          >
            {t("polyglot.view_on_off", "Voir la fiche sur Open Food Facts")}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
