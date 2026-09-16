import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Stack,
  Button,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import HandshakeIcon from "@mui/icons-material/Handshake";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import LoginIcon from "@mui/icons-material/Login";
import off from "../../../off";
import { PolyglotProduct, DetectedLanguageInfo } from "../types";

interface PolyglotActionPanelProps {
  product: PolyglotProduct;
  detectedOcr?: DetectedLanguageInfo | null;
  isLoggedIn: boolean;
  isSaving: boolean;
  onSave: (
    actionType: "move_all" | "move_text" | "shared_image",
    targetLang: string,
  ) => Promise<void>;
  onSkip: () => void;
}

const LANGUAGE_NAMES: Record<string, string> = {
  fr: "Français 🇫🇷",
  en: "Anglais 🇬🇧",
  de: "Allemand 🇩🇪",
  es: "Espagnol 🇪🇸",
  it: "Italien 🇮🇹",
  nl: "Néerlandais 🇳🇱",
  he: "Hébreu 🇮🇱",
};

export default function PolyglotActionPanel({
  product,
  detectedOcr,
  isLoggedIn,
  isSaving,
  onSave,
  onSkip,
}: PolyglotActionPanelProps) {
  const { t } = useTranslation();
  const [copiedBarcode, setCopiedBarcode] = React.useState(false);

  // Target language detected or suggested
  const currentLang = product.lang || "en";
  const suggestedLang =
    detectedOcr?.languageCode || (currentLang === "en" ? "fr" : "en");

  const currentLangLabel =
    LANGUAGE_NAMES[currentLang] || currentLang.toUpperCase();
  const suggestedLangLabel =
    LANGUAGE_NAMES[suggestedLang] || suggestedLang.toUpperCase();

  // Find sample text
  const productName =
    product.product_name || product[`product_name_${currentLang}`] || "";
  const ingredientsText =
    product.ingredients_text ||
    product[`ingredients_text_${currentLang}`] ||
    "";

  // Keyboard shortcuts (1, 2, 3, Escape, s)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "1") {
        e.preventDefault();
        void onSave("move_all", suggestedLang);
      } else if (e.key === "2") {
        e.preventDefault();
        void onSave("shared_image", suggestedLang);
      } else if (e.key === "3") {
        e.preventDefault();
        void onSave("move_text", suggestedLang);
      } else if (e.key === "Escape" || e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSave, onSkip, suggestedLang]);

  const handleCopyBarcode = () => {
    if (product.code) {
      void navigator.clipboard.writeText(product.code);
      setCopiedBarcode(true);
      setTimeout(() => setCopiedBarcode(false), 2000);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
      }}
    >
      {/* Product Header */}
      <Box>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {product.brands || t("polyglot.unknown_brand", "Marque inconnue")}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              {productName || t("polyglot.unknown_product", "Produit sans nom")}
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.5} alignItems="center">
            <Tooltip
              title={
                copiedBarcode
                  ? t("polyglot.copied", "Copié !")
                  : t("polyglot.copy_barcode", "Copier le code-barres")
              }
            >
              <Chip
                label={product.code}
                size="small"
                onClick={handleCopyBarcode}
                icon={
                  <ContentCopyIcon sx={{ fontSize: "0.85rem !important" }} />
                }
                sx={{
                  fontFamily: "monospace",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              />
            </Tooltip>

            <Tooltip title={t("polyglot.open_off", "Voir sur Open Food Facts")}>
              <IconButton
                size="small"
                component="a"
                href={off.getProductUrl(product.code)}
                target="_blank"
                rel="noopener"
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Contributor diagnosis card */}
      <Box
        sx={{
          p: 2,
          borderRadius: 2.5,
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.04)"
              : "rgba(0,0,0,0.02)",
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Situation du produit
          </Typography>
          <Chip
            size="small"
            label={`Actuellement en : ${currentLangLabel}`}
            sx={{ fontWeight: 600, fontSize: "0.75rem" }}
          />
        </Stack>

        {productName && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Nom renseigné :
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              « {productName} »
            </Typography>
          </Box>
        )}

        {ingredientsText && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Extrait des ingrédients :
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "text.secondary",
                fontStyle: "italic",
                maxHeight: 60,
                overflow: "hidden",
              }}
            >
              « {ingredientsText.slice(0, 180)}... »
            </Typography>
          </Box>
        )}

        <Divider />

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            Constat :
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "success.main", fontWeight: 700 }}
          >
            L&apos;emballage et les textes correspondent à :{" "}
            {suggestedLangLabel}
          </Typography>
        </Stack>
      </Box>

      {!isLoggedIn && (
        <Alert severity="warning" icon={<LoginIcon />} sx={{ borderRadius: 2 }}>
          {t(
            "polyglot.login_hint",
            "Connectez-vous à Open Food Facts pour que vos corrections soient enregistrées sous votre profil.",
          )}
        </Alert>
      )}

      {/* Action buttons */}
      <Stack spacing={1.5} sx={{ pt: 1 }}>
        {/* Action 1: Tout passer dans la langue cible */}
        <Button
          variant="contained"
          size="large"
          disabled={isSaving}
          onClick={() => void onSave("move_all", suggestedLang)}
          startIcon={
            isSaving ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <FlashOnIcon />
            )
          }
          endIcon={
            <Box
              component="span"
              sx={{
                bgcolor: "rgba(0,0,0,0.2)",
                px: 1,
                py: 0.25,
                borderRadius: 1,
                fontSize: "0.75rem",
                fontWeight: "bold",
              }}
            >
              1
            </Box>
          }
          sx={{
            py: 1.6,
            borderRadius: 2.5,
            fontWeight: "bold",
            justifyContent: "space-between",
            textTransform: "none",
            fontSize: "0.95rem",
          }}
        >
          {t(
            "polyglot.move_all_action",
            "⚡ Tout passer en {{lang}} (Nom, ingrédients et photos)",
            {
              lang: suggestedLangLabel,
            },
          )}
        </Button>

        {/* Action 2: Valable pour les deux langues (emballage partagé) */}
        <Button
          variant="outlined"
          size="large"
          disabled={isSaving}
          onClick={() => void onSave("shared_image", suggestedLang)}
          startIcon={<HandshakeIcon />}
          endIcon={
            <Box
              component="span"
              sx={{
                bgcolor: "action.hover",
                px: 1,
                py: 0.25,
                borderRadius: 1,
                fontSize: "0.75rem",
                fontWeight: "bold",
              }}
            >
              2
            </Box>
          }
          sx={{
            py: 1.4,
            borderRadius: 2.5,
            fontWeight: "bold",
            justifyContent: "space-between",
            textTransform: "none",
            fontSize: "0.9rem",
          }}
        >
          {t(
            "polyglot.shared_image_action",
            "Valable pour {{lang1}} ET {{lang2}} (Emballage commun)",
            {
              lang1: suggestedLangLabel,
              lang2: currentLangLabel,
            },
          )}
        </Button>

        {/* Action 3: Déplacer uniquement les textes */}
        <Button
          variant="outlined"
          color="inherit"
          size="medium"
          disabled={isSaving}
          onClick={() => void onSave("move_text", suggestedLang)}
          startIcon={<TextFieldsIcon />}
          endIcon={
            <Box
              component="span"
              sx={{
                bgcolor: "action.hover",
                px: 1,
                py: 0.25,
                borderRadius: 1,
                fontSize: "0.75rem",
                fontWeight: "bold",
              }}
            >
              3
            </Box>
          }
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            justifyContent: "space-between",
            textTransform: "none",
            fontSize: "0.85rem",
          }}
        >
          {t(
            "polyglot.move_text_action",
            "Déplacer uniquement les textes vers {{lang}}",
            {
              lang: suggestedLangLabel,
            },
          )}
        </Button>

        {/* Action Skip */}
        <Button
          variant="text"
          color="inherit"
          disabled={isSaving}
          onClick={onSkip}
          startIcon={<SkipNextIcon />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontSize: "0.85rem",
            color: "text.secondary",
          }}
        >
          {t("polyglot.skip_product", "Passer ce produit (S)")}
        </Button>
      </Stack>
    </Paper>
  );
}
