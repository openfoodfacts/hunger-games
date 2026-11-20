import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  TextField,
  Chip,
  Alert,
  Divider,
  Paper,
  Grid,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import LoginIcon from "@mui/icons-material/Login";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { OFF_URL } from "../../../const";
import {
  PolyglotProduct,
  PolyglotChallengeOption,
  LANGUAGE_METADATA,
} from "../types";

interface PolyglotTextSwapperProps {
  product: PolyglotProduct;
  challenge: PolyglotChallengeOption;
  isLoggedIn: boolean;
  isSaving: boolean;
  onSaveFields: (fields: Record<string, string>) => Promise<void>;
  onSkip: () => void;
}

export default function PolyglotTextSwapper({
  product,
  challenge,
  isLoggedIn,
  isSaving,
  onSaveFields,
  onSkip,
}: PolyglotTextSwapperProps) {
  const { t } = useTranslation();

  const langA = challenge.sourceLang || product.lang || "en";
  const langB = challenge.targetLang || "fr";

  const metaA = LANGUAGE_METADATA[langA] || {
    flag: "🌐",
    name: langA.toUpperCase(),
  };
  const metaB = LANGUAGE_METADATA[langB] || {
    flag: "🌐",
    name: langB.toUpperCase(),
  };

  // Helper to get initial field value from product
  const getInitialValue = React.useCallback(
    (prefix: "product_name" | "ingredients_text", lang: string) => {
      const specificKey = `${prefix}_${lang}` as keyof PolyglotProduct;
      const specificVal = product[specificKey];
      if (typeof specificVal === "string" && specificVal.trim()) {
        return specificVal;
      }
      if (product.lang === lang) {
        const rootVal = product[prefix];
        if (typeof rootVal === "string" && rootVal.trim()) {
          return rootVal;
        }
      }
      return "";
    },
    [product],
  );

  const currentKey = `${product.code}-${langA}-${langB}`;
  const [prevProductKey, setPrevProductKey] = React.useState(currentKey);

  // Local state for editing fields
  const [nameA, setNameA] = React.useState<string>(() =>
    getInitialValue("product_name", langA),
  );
  const [nameB, setNameB] = React.useState<string>(() =>
    getInitialValue("product_name", langB),
  );
  const [ingredientsA, setIngredientsA] = React.useState<string>(() =>
    getInitialValue("ingredients_text", langA),
  );
  const [ingredientsB, setIngredientsB] = React.useState<string>(() =>
    getInitialValue("ingredients_text", langB),
  );
  const [hasChanged, setHasChanged] = React.useState<boolean>(false);

  // Reset state during render if product or language pair changed
  if (currentKey !== prevProductKey) {
    setPrevProductKey(currentKey);
    setNameA(getInitialValue("product_name", langA));
    setNameB(getInitialValue("product_name", langB));
    setIngredientsA(getInitialValue("ingredients_text", langA));
    setIngredientsB(getInitialValue("ingredients_text", langB));
    setHasChanged(false);
  }

  // Action 1: Swap fields between Language A and Language B
  const handleSwap = () => {
    setNameA(nameB);
    setNameB(nameA);
    setIngredientsA(ingredientsB);
    setIngredientsB(ingredientsA);
    setHasChanged(true);
  };

  // Action 2: Move from Language A to Language B (clear A)
  const handleMoveAtoB = () => {
    setNameB(nameA);
    setNameA("");
    setIngredientsB(ingredientsA);
    setIngredientsA("");
    setHasChanged(true);
  };

  // Action 3: Move from Language B to Language A (clear B)
  const handleMoveBtoA = () => {
    setNameA(nameB);
    setNameB("");
    setIngredientsA(ingredientsB);
    setIngredientsB("");
    setHasChanged(true);
  };

  // Reset to original
  const handleReset = () => {
    setNameA(getInitialValue("product_name", langA));
    setNameB(getInitialValue("product_name", langB));
    setIngredientsA(getInitialValue("ingredients_text", langA));
    setIngredientsB(getInitialValue("ingredients_text", langB));
    setHasChanged(false);
  };

  // Save changes
  const handleSave = () => {
    const fields: Record<string, string> = {
      [`product_name_${langA}`]: nameA.trim(),
      [`product_name_${langB}`]: nameB.trim(),
      [`ingredients_text_${langA}`]: ingredientsA.trim(),
      [`ingredients_text_${langB}`]: ingredientsB.trim(),
    };
    void onSaveFields(fields);
  };

  const handlersRef = React.useRef({
    handleSwap,
    handleMoveAtoB,
    onSkip,
    isSaving,
  });

  React.useEffect(() => {
    handlersRef.current = {
      handleSwap,
      handleMoveAtoB,
      onSkip,
      isSaving,
    };
  });

  // Keyboard shortcuts (1: Swap, 2: Move A->B, S: Skip)
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
        handlersRef.current.handleSwap();
      } else if (e.key === "2") {
        e.preventDefault();
        handlersRef.current.handleMoveAtoB();
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
        {/* Header */}
        <Box>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 0.5 }}
          >
            <Chip
              size="small"
              label={t("polyglot.modes.texts_badge", "Textes côte-à-côte")}
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

        {/* Cognitive Guidance */}
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          {t(
            "polyglot.texts.instruction",
            "Vérifiez les textes dans chaque langue. Utilisez les boutons pour inverser (Swap) ou déplacer le contenu sans retaper.",
          )}
        </Alert>

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

        {/* Quick 1-Click Operation Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            bgcolor: "action.hover",
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {/* Swap Button */}
            <Button
              variant="contained"
              color="primary"
              size="small"
              disabled={isSaving}
              onClick={handleSwap}
              startIcon={<SwapHorizIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
              }}
            >
              {t("polyglot.texts.btn_swap", "Inverser {{langA}} ⇄ {{langB}}", {
                langA: metaA.name,
                langB: metaB.name,
              })}{" "}
              <Chip
                size="small"
                label="1"
                sx={{
                  ml: 1,
                  height: 18,
                  fontSize: "0.7rem",
                  bgcolor: "rgba(255,255,255,0.25)",
                  color: "white",
                  fontWeight: 700,
                }}
              />
            </Button>

            {/* Move A -> B */}
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              disabled={isSaving}
              onClick={handleMoveAtoB}
              endIcon={<ArrowForwardIcon fontSize="small" />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              {t(
                "polyglot.texts.btn_move_a_to_b",
                "Déplacer {{langA}} ➜ {{langB}}",
                {
                  langA: metaA.name,
                  langB: metaB.name,
                },
              )}
            </Button>

            {/* Move B -> A */}
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              disabled={isSaving}
              onClick={handleMoveBtoA}
              startIcon={<ArrowBackIcon fontSize="small" />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              {metaB.name} ➜ {metaA.name}
            </Button>
          </Stack>

          {hasChanged && (
            <Button
              size="small"
              color="inherit"
              onClick={handleReset}
              startIcon={<RestartAltIcon fontSize="small" />}
              sx={{
                textTransform: "none",
                fontSize: "0.8rem",
                color: "text.secondary",
              }}
            >
              {t("polyglot.texts.reset", "Réinitialiser")}
            </Button>
          )}
        </Paper>

        {/* Side-by-Side Multilingual Columns */}
        <Grid container spacing={2}>
          {/* Column A */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {metaA.flag} {metaA.name}
                </Typography>
                <Chip
                  size="small"
                  label={langA.toUpperCase()}
                  variant="outlined"
                  sx={{ fontSize: "0.7rem", height: 20 }}
                />
              </Stack>

              <TextField
                label={t(
                  "polyglot.texts.product_name_label",
                  "Nom du produit ({{lang}})",
                  {
                    lang: metaA.name,
                  },
                )}
                value={nameA}
                onChange={(e) => {
                  setNameA(e.target.value);
                  setHasChanged(true);
                }}
                size="small"
                fullWidth
                variant="outlined"
              />

              <TextField
                label={t(
                  "polyglot.texts.ingredients_label",
                  "Ingrédients ({{lang}})",
                  {
                    lang: metaA.name,
                  },
                )}
                value={ingredientsA}
                onChange={(e) => {
                  setIngredientsA(e.target.value);
                  setHasChanged(true);
                }}
                size="small"
                fullWidth
                multiline
                minRows={3}
                maxRows={6}
                variant="outlined"
              />
            </Paper>
          </Grid>

          {/* Column B */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {metaB.flag} {metaB.name}
                </Typography>
                <Chip
                  size="small"
                  label={langB.toUpperCase()}
                  color="success"
                  variant="outlined"
                  sx={{ fontSize: "0.7rem", height: 20, fontWeight: 600 }}
                />
              </Stack>

              <TextField
                label={t(
                  "polyglot.texts.product_name_label",
                  "Nom du produit ({{lang}})",
                  {
                    lang: metaB.name,
                  },
                )}
                value={nameB}
                onChange={(e) => {
                  setNameB(e.target.value);
                  setHasChanged(true);
                }}
                size="small"
                fullWidth
                variant="outlined"
              />

              <TextField
                label={t(
                  "polyglot.texts.ingredients_label",
                  "Ingrédients ({{lang}})",
                  {
                    lang: metaB.name,
                  },
                )}
                value={ingredientsB}
                onChange={(e) => {
                  setIngredientsB(e.target.value);
                  setHasChanged(true);
                }}
                size="small"
                fullWidth
                multiline
                minRows={3}
                maxRows={6}
                variant="outlined"
              />
            </Paper>
          </Grid>
        </Grid>

        <Divider />

        {/* Primary Save / Skip Actions */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="space-between"
        >
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
            }}
          >
            {t("polyglot.btn_skip", "Passer ce produit")} (S)
          </Button>

          <Button
            variant="contained"
            color="success"
            size="large"
            disabled={isSaving || !hasChanged}
            onClick={handleSave}
            startIcon={<SaveIcon />}
            sx={{
              py: 1.25,
              px: 4,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
              boxShadow: 2,
            }}
          >
            {t(
              "polyglot.texts.btn_save_changes",
              "Enregistrer les modifications",
            )}
          </Button>
        </Stack>

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
