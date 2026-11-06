import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Paper,
  CircularProgress,
  Collapse,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ScaleIcon from "@mui/icons-material/Scale";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import off from "../../off";
import { QuantityProduct } from "./types";

interface QuantityEditPanelProps {
  product: QuantityProduct;
  isLoggedIn: boolean;
  onSave: (newQuantity: string, newServingSize?: string) => Promise<void>;
  onSkip: () => void;
  isSaving: boolean;
}

const COMMON_UNITS = ["g", "kg", "ml", "cl", "l", "oz", "fl oz"];

export default function QuantityEditPanel({
  product,
  isLoggedIn,
  onSave,
  onSkip,
  isSaving,
}: QuantityEditPanelProps) {
  const { t } = useTranslation();

  const [quantityInput, setQuantityInput] = React.useState<string>("");
  const [servingSizeInput, setServingSizeInput] = React.useState<string>("");
  const [showServingInput, setShowServingInput] =
    React.useState<boolean>(false);
  const [copiedCode, setCopiedCode] = React.useState<boolean>(false);
  const quantityInputRef = React.useRef<HTMLInputElement>(null);

  // Initialize input values when product changes
  React.useEffect(() => {
    setQuantityInput(product.quantity || "");
    setServingSizeInput(product.serving_size || "");

    const warnings = product.data_quality_warnings_tags || [];
    const hasServingWarning = warnings.some((w) => w.includes("serving"));
    setShowServingInput(hasServingWarning);

    // Auto-focus input
    setTimeout(() => {
      quantityInputRef.current?.focus();
      quantityInputRef.current?.select();
    }, 50);
  }, [product]);

  // Keyboard shortcut: Enter to save, Escape or 's' when not typing in text field to skip
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter from anywhere, or plain Enter when in the quantity input
      if (
        (e.key === "Enter" && (e.ctrlKey || e.metaKey)) ||
        (e.key === "Enter" &&
          document.activeElement === quantityInputRef.current)
      ) {
        e.preventDefault();
        if (quantityInput.trim()) {
          void onSave(
            quantityInput.trim(),
            servingSizeInput.trim() || undefined,
          );
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [quantityInput, servingSizeInput, onSave, onSkip]);

  const handleCopyBarcode = () => {
    if (product.code) {
      navigator.clipboard.writeText(product.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Generate smart suggestions based on product current values
  const smartSuggestions = React.useMemo(() => {
    const suggestions: string[] = [];
    const raw = (product.quantity || "").trim();

    // If pure number (e.g., "80", "125", "330")
    if (/^\d+(\.\d+)?$/.test(raw)) {
      suggestions.push(`${raw} g`, `${raw} ml`, `${raw} cl`);
    }

    // If number stuck to unit without space (e.g., "500g")
    const matchNoSpace = raw.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/);
    if (matchNoSpace) {
      suggestions.push(`${matchNoSpace[1]} ${matchNoSpace[2].toLowerCase()}`);
    }

    // If imperial parenthesis format like "0.75 oz (21 g)" -> "21 g"
    const matchParens = raw.match(/\(([^)]+)\)/);
    if (matchParens) {
      suggestions.push(matchParens[1].trim());
    }

    // If serving size is available and quantity is missing
    if (!raw && product.serving_size) {
      suggestions.push(product.serving_size);
    }

    return [...new Set(suggestions)];
  }, [product.quantity, product.serving_size]);

  // Warning tags matching quantity
  const relevantWarnings = React.useMemo(() => {
    const allTags = [
      ...(product.data_quality_warnings_tags || []),
      ...(product.data_quality_errors_tags || []),
    ];
    return allTags.filter(
      (tag) => tag.includes("quantity") || tag.includes("serving"),
    );
  }, [product]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quantityInput.trim()) return;
    void onSave(quantityInput.trim(), servingSizeInput.trim() || undefined);
  };

  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
      }}
    >
      {/* Product identification */}
      <Box>
        <Typography
          variant="h6"
          fontWeight={800}
          color="#341100"
          sx={{ lineHeight: 1.25 }}
        >
          {product.product_name ||
            t("quantities.unnamed_product", "Produit sans nom")}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={500}
          sx={{ mt: 0.5 }}
        >
          {product.brands ||
            t("quantities.unspecified_brand", "Marque non précisée")}
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mt: 1.5 }}
          flexWrap="wrap"
          gap={1}
        >
          <Chip
            label={product.code}
            size="small"
            variant="outlined"
            sx={{ fontFamily: "monospace", fontWeight: 600 }}
          />
          <Tooltip
            title={
              copiedCode
                ? t("common.copied", "Copié !")
                : t("common.copy_barcode", "Copier le code-barres")
            }
          >
            <IconButton size="small" onClick={handleCopyBarcode}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            component="a"
            target="_blank"
            href={off.getProductUrl(product.code)}
            endIcon={<OpenInNewIcon fontSize="small" />}
          >
            {t("questions.view", "Voir")}
          </Button>
          <Button
            size="small"
            component="a"
            target="_blank"
            href={off.getProductEditUrl(product.code)}
            endIcon={<EditIcon fontSize="small" />}
          >
            {t("reverso.edit", "Éditer")}
          </Button>
        </Stack>
      </Box>

      {/* Warning Diagnosis Alert */}
      <Alert
        severity="warning"
        icon={<WarningAmberIcon />}
        sx={{
          borderRadius: 2,
          "& .MuiAlert-message": { width: "100%" },
        }}
      >
        <Typography variant="subtitle2" fontWeight={700}>
          {t("quantities.detected_issue", "Anomalie détectée sur ce produit :")}
        </Typography>

        <Box sx={{ mt: 0.75, fontSize: "0.875rem" }}>
          {relevantWarnings.length > 0 ? (
            relevantWarnings.map((tag) => (
              <Box key={tag} sx={{ my: 0.25 }}>
                •{" "}
                <strong style={{ fontFamily: "monospace" }}>
                  {tag.replace(/^en:/, "")}
                </strong>
              </Box>
            ))
          ) : (
            <Typography variant="body2">
              •{" "}
              {t(
                "quantities.quantity_needs_review",
                "Vérifier et corriger la quantité indiquée sur l'emballage",
              )}
            </Typography>
          )}

          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 1, pt: 1, borderTop: "1px dashed rgba(0,0,0,0.15)" }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("quantities.current_quantity", "Quantité actuelle :")}
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {product.quantity || (
                  <span style={{ color: "#d32f2f", fontStyle: "italic" }}>
                    {t("quantities.missing", "Non renseignée")}
                  </span>
                )}
              </Typography>
            </Box>

            {product.serving_size && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("quantities.current_serving", "Portion actuelle :")}
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {product.serving_size}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </Alert>

      {/* Smart suggestions if available */}
      {smartSuggestions.length > 0 && (
        <Box sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <AutoFixHighIcon fontSize="small" color="primary" />
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
            >
              {t("quantities.suggestions", "Suggestions automatiques :")}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {smartSuggestions.map((sug) => (
              <Chip
                key={sug}
                label={sug}
                clickable
                color="primary"
                variant="outlined"
                onClick={() => setQuantityInput(sug)}
                sx={{ fontWeight: 600, fontSize: "0.9rem" }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Main Quantity Edit Input Form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Box>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            {t(
              "quantities.enter_quantity",
              "Saisir la quantité exacte (poids ou volume net) :",
            )}
          </Typography>

          <TextField
            inputRef={quantityInputRef}
            fullWidth
            size="medium"
            placeholder={t(
              "quantities.quantity_placeholder",
              "ex: 500 g, 75 cl, 1.5 l, 6 x 25 cl",
            )}
            value={quantityInput}
            onChange={(e) => setQuantityInput(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <ScaleIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              },
            }}
            sx={{
              bgcolor: "white",
              borderRadius: 1.5,
              "& .MuiOutlinedInput-root": {
                fontWeight: 600,
                fontSize: "1.1rem",
              },
            }}
          />
        </Box>

        {/* Quick units buttons */}
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          flexWrap="wrap"
          gap={0.5}
        >
          <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
            {t("quantities.append_unit", "Ajouter une unité :")}
          </Typography>
          {COMMON_UNITS.map((unit) => (
            <Button
              key={unit}
              size="small"
              variant="outlined"
              onClick={() => {
                const trimmed = quantityInput.trim();
                if (!trimmed) {
                  setQuantityInput(unit);
                } else if (/^\d+(\.\d+)?$/.test(trimmed)) {
                  setQuantityInput(`${trimmed} ${unit}`);
                } else {
                  setQuantityInput(`${trimmed} ${unit}`);
                }
                quantityInputRef.current?.focus();
              }}
              sx={{ minWidth: 38, px: 1, py: 0.25, fontWeight: 700 }}
            >
              {unit}
            </Button>
          ))}
        </Stack>

        {/* Toggle serving size field */}
        <Box>
          <Button
            size="small"
            variant="text"
            color="inherit"
            onClick={() => setShowServingInput((prev) => !prev)}
            endIcon={showServingInput ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ textTransform: "none", fontSize: "0.85rem", opacity: 0.8 }}
          >
            {showServingInput
              ? t("quantities.hide_serving", "Masquer la portion")
              : t(
                  "quantities.edit_serving",
                  "Modifier également la portion (serving size)",
                )}
          </Button>

          <Collapse in={showServingInput}>
            <Box sx={{ mt: 1.5 }}>
              <TextField
                fullWidth
                size="small"
                label={t("quantities.serving_size_label", "Taille de portion")}
                placeholder="ex: 30 g, 200 ml"
                value={servingSizeInput}
                onChange={(e) => setServingSizeInput(e.target.value)}
                sx={{ bgcolor: "white", borderRadius: 1 }}
              />
            </Box>
          </Collapse>
        </Box>

        {/* Primary Action Buttons */}
        <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onSkip}
            startIcon={<SkipNextIcon />}
            disabled={isSaving}
            sx={{ flex: 1, py: 1.25, fontWeight: 700 }}
          >
            {t("questions.skip", "Passer")} (Échap)
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={() => handleSubmit()}
            disabled={isSaving || !quantityInput.trim()}
            startIcon={
              isSaving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            sx={{
              flex: 2,
              py: 1.25,
              fontWeight: 800,
              fontSize: "1rem",
              boxShadow: "0 4px 14px rgba(52, 17, 0, 0.25)",
            }}
          >
            {isSaving
              ? t("quantities.saving", "Enregistrement...")
              : `${t("quantities.save_and_next", "Enregistrer et suivant")} (Entrée)`}
          </Button>
        </Stack>

        {!isLoggedIn && (
          <Alert severity="info" sx={{ mt: 1 }}>
            {t(
              "quantities.login_notice",
              "Vous pouvez inspecter et corriger les quantités. Pour enregistrer vos modifications sur Open Food Facts, veuillez vous connecter.",
            )}
          </Alert>
        )}
      </Box>
    </Paper>
  );
}
