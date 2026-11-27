import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
} from "@mui/material";
import CropIcon from "@mui/icons-material/Crop";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {
  PolyglotProduct,
  DetectedLanguageInfo,
  LANGUAGE_METADATA,
} from "../types";

export interface CropResult {
  imgid: string;
  imageField: string; // e.g. "ingredients_ar", "front_fr"
  targetType: "front" | "ingredients" | "packaging";
  targetLang: string;
  extractedText: string;
  coordinates: { x1: number; y1: number; x2: number; y2: number };
}

interface PolyglotImageCropperModalProps {
  open: boolean;
  onClose: () => void;
  product: PolyglotProduct;
  imageUrl: string;
  imgid: string;
  detectedOcr?: DetectedLanguageInfo | null;
  availableLanguages: string[];
  initialTargetLang?: string;
  initialTargetType?: "front" | "ingredients" | "packaging";
  onApplyCrop: (result: CropResult) => Promise<void>;
}

export default function PolyglotImageCropperModal({
  open,
  onClose,
  imageUrl,
  imgid,
  detectedOcr,
  availableLanguages,
  initialTargetLang = "fr",
  initialTargetType = "ingredients",
  onApplyCrop,
}: PolyglotImageCropperModalProps) {
  const { t } = useTranslation();

  const [targetLang, setTargetLang] = React.useState<string>(initialTargetLang);
  const [targetType, setTargetType] = React.useState<
    "front" | "ingredients" | "packaging"
  >(initialTargetType);
  const [isApplying, setIsApplying] = React.useState<boolean>(false);

  // Image natural dimensions
  const [imageDimensions, setImageDimensions] = React.useState<{
    width: number;
    height: number;
  }>({ width: 1000, height: 1000 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Crop selection state in percentages (0..100)
  const [cropPercent, setCropPercent] = React.useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }>({ x1: 10, y1: 10, x2: 90, y2: 90 });

  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // Start crop dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(
      0,
      Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
    );
    const y = Math.max(
      0,
      Math.min(100, ((e.clientY - rect.top) / rect.height) * 100),
    );

    setDragStart({ x, y });
    setCropPercent({ x1: x, y1: y, x2: x, y2: y });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = Math.max(
      0,
      Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
    );
    const currentY = Math.max(
      0,
      Math.min(100, ((e.clientY - rect.top) / rect.height) * 100),
    );

    setCropPercent({
      x1: Math.min(dragStart.x, currentX),
      y1: Math.min(dragStart.y, currentY),
      x2: Math.max(dragStart.x, currentX),
      y2: Math.max(dragStart.y, currentY),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Quick crop preset buttons
  const applyPreset = (type: "all" | "left" | "right" | "top" | "bottom") => {
    if (type === "all") {
      setCropPercent({ x1: 5, y1: 5, x2: 95, y2: 95 });
    } else if (type === "left") {
      setCropPercent({ x1: 5, y1: 5, x2: 50, y2: 95 });
    } else if (type === "right") {
      setCropPercent({ x1: 50, y1: 5, x2: 95, y2: 95 });
    } else if (type === "top") {
      setCropPercent({ x1: 5, y1: 5, x2: 95, y2: 50 });
    } else if (type === "bottom") {
      setCropPercent({ x1: 5, y1: 50, x2: 95, y2: 95 });
    }
  };

  // Filter OCR words inside crop selection
  const extractedText = React.useMemo(() => {
    if (!detectedOcr?.wordBoxes || detectedOcr.wordBoxes.length === 0) {
      return detectedOcr?.fullText || "";
    }

    const natWidth = imageDimensions.width;
    const natHeight = imageDimensions.height;

    // Convert crop percentages to natural image pixels
    const px1 = (cropPercent.x1 / 100) * natWidth;
    const py1 = (cropPercent.y1 / 100) * natHeight;
    const px2 = (cropPercent.x2 / 100) * natWidth;
    const py2 = (cropPercent.y2 / 100) * natHeight;

    const matchedWords = detectedOcr.wordBoxes.filter((w) => {
      const centerX = (w.x0 + w.x1) / 2;
      const centerY = (w.y0 + w.y1) / 2;
      return (
        centerX >= px1 && centerX <= px2 && centerY >= py1 && centerY <= py2
      );
    });

    if (matchedWords.length > 0) {
      return matchedWords.map((w) => w.text).join(" ");
    }

    return detectedOcr.fullText || "";
  }, [detectedOcr, cropPercent, imageDimensions]);

  // Submit crop
  const handleConfirm = async () => {
    setIsApplying(true);
    const natWidth = imageDimensions.width;
    const natHeight = imageDimensions.height;

    const coordinates = {
      x1: Math.round((cropPercent.x1 / 100) * natWidth),
      y1: Math.round((cropPercent.y1 / 100) * natHeight),
      x2: Math.round((cropPercent.x2 / 100) * natWidth),
      y2: Math.round((cropPercent.y2 / 100) * natHeight),
    };

    const imageField = `${targetType}_${targetLang}`;

    try {
      await onApplyCrop({
        imgid,
        imageField,
        targetType,
        targetLang,
        extractedText,
        coordinates,
      });
      onClose();
    } finally {
      setIsApplying(false);
    }
  };

  const currentMeta = LANGUAGE_METADATA[targetLang] || {
    flag: "🌐",
    name: targetLang.toUpperCase(),
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, overflow: "hidden" },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <CropIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {t(
              "polyglot.cropper.title",
              "Recadrer la photo & Extraire le texte",
            )}
          </Typography>
        </Stack>
        <Button
          size="small"
          onClick={onClose}
          sx={{ minWidth: 32, p: 0.5, color: "text.secondary" }}
        >
          <CloseIcon fontSize="small" />
        </Button>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Typography variant="body2" color="text.secondary">
          {t(
            "polyglot.cropper.hint",
            "Tracez un cadre avec votre souris sur la partie de l'emballage à isoler (ex : la liste d'ingrédients). Le texte OCR correspondant sera extrait automatiquement.",
          )}
        </Typography>

        {/* Preset Crop shortcuts */}
        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: "text.secondary" }}
          >
            {t("polyglot.cropper.presets", "Cadrage rapide :")}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => applyPreset("all")}
            sx={{ borderRadius: 2, fontSize: "0.75rem", textTransform: "none" }}
          >
            Photo entière
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => applyPreset("left")}
            sx={{ borderRadius: 2, fontSize: "0.75rem", textTransform: "none" }}
          >
            Moitié gauche
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => applyPreset("right")}
            sx={{ borderRadius: 2, fontSize: "0.75rem", textTransform: "none" }}
          >
            Moitié droite
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => applyPreset("top")}
            sx={{ borderRadius: 2, fontSize: "0.75rem", textTransform: "none" }}
          >
            Haut
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => applyPreset("bottom")}
            sx={{ borderRadius: 2, fontSize: "0.75rem", textTransform: "none" }}
          >
            Bas
          </Button>
        </Stack>

        {/* Visual Crop Workspace */}
        <Box
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          sx={{
            position: "relative",
            width: "100%",
            maxHeight: 400,
            overflow: "hidden",
            bgcolor: "black",
            borderRadius: 2.5,
            cursor: "crosshair",
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={imageUrl}
            alt="À recadrer"
            onLoad={(e) => {
              const el = e.currentTarget;
              if (el.naturalWidth && el.naturalHeight) {
                setImageDimensions({
                  width: el.naturalWidth,
                  height: el.naturalHeight,
                });
              }
            }}
            style={{
              maxWidth: "100%",
              maxHeight: 400,
              objectFit: "contain",
              pointerEvents: "none",
            }}
          />

          {/* Semi-transparent Overlay */}
          <Box
            sx={{
              position: "absolute",
              top: `${cropPercent.y1}%`,
              left: `${cropPercent.x1}%`,
              width: `${Math.max(2, cropPercent.x2 - cropPercent.x1)}%`,
              height: `${Math.max(2, cropPercent.y2 - cropPercent.y1)}%`,
              border: "2px solid #00E676",
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
              pointerEvents: "none",
              borderRadius: "4px",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 4,
                left: 4,
                bgcolor: "#00E676",
                color: "#000",
                px: 0.75,
                py: 0.2,
                borderRadius: 1,
                fontSize: "0.65rem",
                fontWeight: 800,
              }}
            >
              Zone sélectionnée
            </Box>
          </Box>
        </Box>

        {/* Extracted Text Preview */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "action.hover",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <DocumentScannerIcon fontSize="small" color="primary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {t(
                "polyglot.cropper.extracted_ocr_text",
                "Texte extrait de la zone :",
              )}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "monospace",
              bgcolor: "background.paper",
              p: 1.5,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
              maxHeight: 100,
              overflowY: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {extractedText ||
              t(
                "polyglot.cropper.no_text_extracted",
                "(Aucun texte détecté dans cette zone)",
              )}
          </Typography>
        </Paper>

        {/* Destination Assignment Selector */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
        >
          <FormControl size="small" sx={{ minWidth: 160, flex: 1 }}>
            <InputLabel id="target-type-label">Type d&apos;image</InputLabel>
            <Select
              labelId="target-type-label"
              value={targetType}
              label="Type d'image"
              onChange={(e) => setTargetType(e.target.value)}
            >
              <MenuItem value="ingredients">📋 Liste des Ingrédients</MenuItem>
              <MenuItem value="front">🏷️ Face avant (Nom)</MenuItem>
              <MenuItem value="packaging">📦 Emballage / Autre</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160, flex: 1 }}>
            <InputLabel id="target-lang-label">
              Langue de destination
            </InputLabel>
            <Select
              labelId="target-lang-label"
              value={targetLang}
              label="Langue de destination"
              onChange={(e) => setTargetLang(e.target.value)}
            >
              {availableLanguages.map((lang) => {
                const meta = LANGUAGE_METADATA[lang] || {
                  flag: "🌐",
                  name: lang.toUpperCase(),
                };
                return (
                  <MenuItem key={lang} value={lang}>
                    {meta.flag} {meta.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 2, justifyContent: "space-between" }}>
        <Button
          onClick={onClose}
          color="inherit"
          sx={{ textTransform: "none" }}
        >
          {t("polyglot.btn_cancel", "Annuler")}
        </Button>

        <Button
          variant="contained"
          color="success"
          size="large"
          disabled={isApplying}
          onClick={() => void handleConfirm()}
          startIcon={<CheckIcon />}
          sx={{
            borderRadius: 2.5,
            px: 3,
            textTransform: "none",
            fontWeight: 700,
            boxShadow: 2,
          }}
        >
          {t("polyglot.cropper.btn_validate", "Valider pour {{lang}}", {
            lang: `${currentMeta.flag} ${currentMeta.name}`,
          })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
