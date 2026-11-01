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
  Paper,
  Grid,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import CropIcon from "@mui/icons-material/Crop";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import LoginIcon from "@mui/icons-material/Login";
import off from "../../../off";
import {
  PolyglotProduct,
  DetectedLanguageInfo,
  LANGUAGE_METADATA,
} from "../types";
import PolyglotImageCropperModal, {
  CropResult,
} from "./PolyglotImageCropperModal";
import {
  hasArabicScript,
  hasLatinScript,
  splitMixedArabicLatin,
} from "../utils/textSplitter";

interface PolyglotLanguageZonesProps {
  product: PolyglotProduct;
  detectedOcr?: DetectedLanguageInfo | null;
  isLoggedIn: boolean;
  isSaving: boolean;
  onSaveAll: (data: {
    fields: Record<string, string>;
    crops?: CropResult[];
  }) => Promise<void>;
  onUnselectPhoto: (imageRole: string) => Promise<void>;
  onSkip: () => void;
}

function createInitialFields(
  product: PolyglotProduct,
  langs: string[],
): Record<string, { name: string; ingredients: string }> {
  const initial: Record<string, { name: string; ingredients: string }> = {};
  for (const lang of langs) {
    const nameKey = `product_name_${lang}` as keyof PolyglotProduct;
    const ingKey = `ingredients_text_${lang}` as keyof PolyglotProduct;
    const nameVal =
      (product[nameKey] as string) ||
      (product.lang === lang ? product.product_name : "") ||
      "";
    const ingVal =
      (product[ingKey] as string) ||
      (product.lang === lang ? product.ingredients_text : "") ||
      "";
    initial[lang] = { name: nameVal, ingredients: ingVal };
  }
  return initial;
}

export default function PolyglotLanguageZones({
  product,
  detectedOcr,
  isLoggedIn,
  isSaving,
  onSaveAll,
  onUnselectPhoto,
  onSkip,
}: PolyglotLanguageZonesProps) {
  const { t } = useTranslation();

  // Step 1: Detect initial languages present on the packaging
  const initialLanguages = React.useMemo(() => {
    const set = new Set<string>();

    // 1. Check if Arabic script exists in product title or ingredients
    const allText = `${product.product_name || ""} ${product.ingredients_text || ""} ${detectedOcr?.fullText || ""}`;
    if (hasArabicScript(allText)) {
      set.add("ar");
    }
    if (hasLatinScript(allText)) {
      // Default Latin to French or product.lang
      const defaultLatin =
        product.lang && product.lang !== "en" ? product.lang : "fr";
      set.add(defaultLatin);
    }

    // 2. Add detected languages from Cloud Vision OCR
    if (detectedOcr?.allDetectedLanguages) {
      for (const langObj of detectedOcr.allDetectedLanguages) {
        if (
          langObj.confidence >= 0.25 &&
          LANGUAGE_METADATA[langObj.languageCode]
        ) {
          set.add(langObj.languageCode);
        }
      }
    }

    // 3. Add product's existing languages_tags
    if (product.languages_tags) {
      for (const tag of product.languages_tags) {
        const code = tag.replace(/^en:/, "");
        if (LANGUAGE_METADATA[code]) set.add(code);
      }
    }

    // Fallback: at least French and Arabic if both scripts detected, or fr + en
    if (set.size === 0) {
      set.add("fr");
      set.add("en");
    }

    return Array.from(set);
  }, [product, detectedOcr]);

  const [activeLanguages, setActiveLanguages] =
    React.useState<string[]>(initialLanguages);

  // Sync when product code changes
  const [prevProductCode, setPrevProductCode] = React.useState(product.code);
  if (product.code !== prevProductCode) {
    setPrevProductCode(product.code);
    setActiveLanguages(initialLanguages);
    setFieldsByLang(createInitialFields(product, initialLanguages));
  }

  // Language fields state: record of { [lang]: { name: string, ingredients: string } }
  const [fieldsByLang, setFieldsByLang] = React.useState<
    Record<string, { name: string; ingredients: string }>
  >(() => createInitialFields(product, initialLanguages));

  // Crop Modal state
  const [cropModalOpen, setCropModalOpen] = React.useState<boolean>(false);
  const [selectedCropImage, setSelectedCropImage] = React.useState<{
    url: string;
    imgid: string;
    targetLang: string;
    targetType: "front" | "ingredients" | "packaging";
  } | null>(null);

  // Available raw photos
  const rawPhotos = React.useMemo(() => {
    const list: Array<{ imgid: string; url: string; urlFull: string }> = [];
    if (product.images && product.code) {
      const formattedCode = off.getFormatedBarcode(product.code);
      const rootImageUrl = off.getImageUrl(formattedCode);

      Object.keys(product.images)
        .filter((key) => !isNaN(Number(key)))
        .sort((a, b) => Number(a) - Number(b))
        .forEach((key) => {
          list.push({
            imgid: key,
            url: `${rootImageUrl}/${key}.400.jpg`,
            urlFull: `${rootImageUrl}/${key}.jpg`,
          });
        });
    }
    return list;
  }, [product]);

  // Drag and drop state
  const [draggedPhoto, setDraggedPhoto] = React.useState<{
    imgid: string;
    url: string;
  } | null>(null);
  const [dragOverZone, setDragOverZone] = React.useState<string | null>(null);

  // Text selection tracking for Cut & Transfer
  const [selectedTextInfo, setSelectedTextInfo] = React.useState<{
    fromLang: string;
    field: "name" | "ingredients";
    text: string;
  } | null>(null);

  // Add Language Menu state
  const [addLangAnchor, setAddLangAnchor] = React.useState<null | HTMLElement>(
    null,
  );

  const toggleLanguage = (lang: string) => {
    if (activeLanguages.includes(lang)) {
      if (activeLanguages.length > 1) {
        setActiveLanguages(activeLanguages.filter((l) => l !== lang));
      }
    } else {
      setActiveLanguages([...activeLanguages, lang]);
      setFieldsByLang((prev) => {
        if (prev[lang]) return prev;
        const nameKey = `product_name_${lang}` as keyof PolyglotProduct;
        const ingKey = `ingredients_text_${lang}` as keyof PolyglotProduct;
        const nameVal =
          (product[nameKey] as string) ||
          (product.lang === lang ? product.product_name : "") ||
          "";
        const ingVal =
          (product[ingKey] as string) ||
          (product.lang === lang ? product.ingredients_text : "") ||
          "";
        return {
          ...prev,
          [lang]: { name: nameVal, ingredients: ingVal },
        };
      });
    }
  };

  // Auto-split mixed text (e.g. Arabic & French)
  const handleAutoSplit = () => {
    // Check if Arabic and a Latin language (e.g. French) are among active languages
    const hasAr = activeLanguages.includes("ar");
    const latinLang = activeLanguages.find((l) => l !== "ar") || "fr";

    if (!hasAr) return;

    // Combine any ingredients text present
    const sourceIng =
      product.ingredients_text ||
      fieldsByLang[product.lang || "en"]?.ingredients ||
      fieldsByLang["en"]?.ingredients ||
      fieldsByLang["fr"]?.ingredients ||
      detectedOcr?.fullText ||
      "";

    const { arabicText, latinText } = splitMixedArabicLatin(sourceIng);

    setFieldsByLang((prev) => ({
      ...prev,
      ar: {
        ...prev.ar,
        ingredients: arabicText || prev.ar?.ingredients || "",
      },
      [latinLang]: {
        ...prev[latinLang],
        ingredients: latinText || prev[latinLang]?.ingredients || "",
      },
    }));
  };

  // Cut text selection and transfer to target language
  const handleCutSelectionToLang = (targetLang: string) => {
    if (!selectedTextInfo || !selectedTextInfo.text.trim()) return;
    const { fromLang, field, text } = selectedTextInfo;

    setFieldsByLang((prev) => {
      const sourceVal = prev[fromLang]?.[field] || "";
      const cleanedSource = sourceVal.replace(text, "").trim();

      const targetVal = prev[targetLang]?.[field] || "";
      const updatedTarget = targetVal ? `${targetVal}\n${text}` : text;

      return {
        ...prev,
        [fromLang]: { ...prev[fromLang], [field]: cleanedSource },
        [targetLang]: { ...prev[targetLang], [field]: updatedTarget },
      };
    });

    setSelectedTextInfo(null);
  };

  // Apply Crop result: update crop and inject extracted text into the target field
  const handleApplyCrop = async (result: CropResult) => {
    await off.setImageLanguage({
      code: product.code,
      imgid: result.imgid,
      imageField: result.imageField,
      coordinates: result.coordinates,
      comment: `Recadrer et assigner ${result.imageField} (Jeu Polyglot)`,
    });

    if (result.extractedText) {
      setFieldsByLang((prev) => {
        const langObj = prev[result.targetLang] || {
          name: "",
          ingredients: "",
        };
        if (result.targetType === "ingredients") {
          return {
            ...prev,
            [result.targetLang]: {
              ...langObj,
              ingredients: langObj.ingredients
                ? `${langObj.ingredients}\n${result.extractedText}`
                : result.extractedText,
            },
          };
        } else if (result.targetType === "front") {
          return {
            ...prev,
            [result.targetLang]: {
              ...langObj,
              name: langObj.name || result.extractedText,
            },
          };
        }
        return prev;
      });
    }
  };

  // Save all fields
  const handleSaveAll = async () => {
    const fieldsToSubmit: Record<string, string> = {};
    for (const [lang, val] of Object.entries(fieldsByLang)) {
      if (val.name.trim()) {
        fieldsToSubmit[`product_name_${lang}`] = val.name.trim();
      }
      if (val.ingredients.trim()) {
        fieldsToSubmit[`ingredients_text_${lang}`] = val.ingredients.trim();
      }
    }
    await onSaveAll({ fields: fieldsToSubmit });
  };

  const isBilingualArabicFrench =
    activeLanguages.includes("ar") &&
    (activeLanguages.includes("fr") || activeLanguages.includes("en"));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Step 1: Language Detection & Selection Bar */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, mb: 0.25 }}
              >
                {t(
                  "polyglot.dispatch.step1_title",
                  "Étape 1 : Quelles langues sont présentes sur l'emballage ?",
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t(
                  "polyglot.dispatch.step1_desc",
                  "Cochez les langues détectées sur le packaging pour créer leurs zones de rangement dédiées.",
                )}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              alignItems="center"
            >
              {Object.entries(LANGUAGE_METADATA).map(([code, meta]) => {
                const isSelected = activeLanguages.includes(code);
                // Show commonly active languages or selected ones
                if (
                  !isSelected &&
                  !["fr", "ar", "en", "de", "es", "it", "nl"].includes(code)
                ) {
                  return null;
                }
                return (
                  <Chip
                    key={code}
                    label={`${meta.flag} ${meta.name}`}
                    color={isSelected ? "primary" : "default"}
                    variant={isSelected ? "filled" : "outlined"}
                    onClick={() => toggleLanguage(code)}
                    sx={{
                      fontWeight: isSelected ? 700 : 500,
                      cursor: "pointer",
                    }}
                  />
                );
              })}

              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={(e) => setAddLangAnchor(e.currentTarget)}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "0.8rem",
                }}
              >
                Autre langue
              </Button>
              <Menu
                anchorEl={addLangAnchor}
                open={Boolean(addLangAnchor)}
                onClose={() => setAddLangAnchor(null)}
              >
                {Object.entries(LANGUAGE_METADATA)
                  .filter(([code]) => !activeLanguages.includes(code))
                  .map(([code, meta]) => (
                    <MenuItem
                      key={code}
                      onClick={() => {
                        toggleLanguage(code);
                        setAddLangAnchor(null);
                      }}
                    >
                      {meta.flag} {meta.name} ({meta.nativeName})
                    </MenuItem>
                  ))}
              </Menu>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Available Photos Shelf (Draggable & Croppable) */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                📷{" "}
                {t("polyglot.dispatch.photos_shelf", "Photos de l'emballage :")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (Glissez une photo vers une zone de langue, ou cliquez sur
                Recadrer)
              </Typography>
            </Stack>

            {isBilingualArabicFrench && (
              <Button
                size="small"
                variant="contained"
                color="secondary"
                startIcon={<AutoFixHighIcon />}
                onClick={handleAutoSplit}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  boxShadow: 1,
                }}
              >
                ⚡ Séparer Arabe & Français automatiquement
              </Button>
            )}
          </Stack>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ overflowX: "auto", pb: 1 }}
          >
            {rawPhotos.map((photo) => (
              <Paper
                key={photo.imgid}
                draggable
                onDragStart={() => setDraggedPhoto(photo)}
                onDragEnd={() => setDraggedPhoto(null)}
                elevation={0}
                sx={{
                  position: "relative",
                  width: 140,
                  flexShrink: 0,
                  p: 1,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  cursor: "grab",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 2,
                  },
                }}
              >
                <Box
                  component="img"
                  src={photo.url}
                  alt={`Photo #${photo.imgid}`}
                  sx={{
                    width: "100%",
                    height: 100,
                    objectFit: "contain",
                    borderRadius: 1.5,
                    bgcolor: "action.hover",
                  }}
                />
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mt: 0.5 }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    #{photo.imgid}
                  </Typography>
                  <Tooltip title="Recadrer et extraire le texte OCR">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        setSelectedCropImage({
                          url: photo.urlFull,
                          imgid: photo.imgid,
                          targetLang: activeLanguages[0] || "fr",
                          targetType: "ingredients",
                        });
                        setCropModalOpen(true);
                      }}
                      sx={{ p: 0.5 }}
                    >
                      <CropIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Floating Action: Cut & Transfer tooltip */}
      {selectedTextInfo && selectedTextInfo.text && (
        <Alert
          severity="info"
          icon={<ContentCutIcon />}
          sx={{ borderRadius: 2.5, alignItems: "center" }}
          action={
            <Stack direction="row" spacing={1}>
              {activeLanguages
                .filter((l) => l !== selectedTextInfo.fromLang)
                .map((targetLang) => {
                  const meta = LANGUAGE_METADATA[targetLang] || {
                    flag: "🌐",
                    name: targetLang.toUpperCase(),
                  };
                  return (
                    <Button
                      key={targetLang}
                      size="small"
                      variant="contained"
                      onClick={() => handleCutSelectionToLang(targetLang)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                      }}
                    >
                      Envoyer vers {meta.flag} {meta.name}
                    </Button>
                  );
                })}
              <Button
                size="small"
                color="inherit"
                onClick={() => setSelectedTextInfo(null)}
              >
                Annuler
              </Button>
            </Stack>
          }
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {selectedTextInfo.text.length > 50
              ? `${selectedTextInfo.text.slice(0, 50)}...`
              : selectedTextInfo.text}
          </Typography>
        </Alert>
      )}

      {/* Step 2: Active Language Drop Zones */}
      <Grid container spacing={2.5}>
        {activeLanguages.map((lang) => {
          const meta = LANGUAGE_METADATA[lang] || {
            flag: "🌐",
            name: lang.toUpperCase(),
          };
          const isOver = dragOverZone === lang;
          const frontKey = `image_front_${lang}_url` as keyof PolyglotProduct;
          const ingKey =
            `image_ingredients_${lang}_url` as keyof PolyglotProduct;
          const frontImg =
            (product[frontKey] as string) ||
            (product.lang === lang ? product.image_front_url : undefined);
          const ingImg =
            (product[ingKey] as string) ||
            (product.lang === lang ? product.image_ingredients_url : undefined);

          return (
            <Grid
              key={lang}
              item
              xs={12}
              md={12 / Math.min(activeLanguages.length, 3)}
            >
              <Paper
                elevation={0}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverZone(lang);
                }}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverZone(null);
                  if (draggedPhoto) {
                    // Open crop modal pre-targeted to this language
                    setSelectedCropImage({
                      url: draggedPhoto.url.replace(/\.400\.jpg$/, ".jpg"),
                      imgid: draggedPhoto.imgid,
                      targetLang: lang,
                      targetType: "ingredients",
                    });
                    setCropModalOpen(true);
                  }
                }}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: "2px solid",
                  borderColor: isOver ? "primary.main" : "divider",
                  bgcolor: isOver ? "action.hover" : "background.paper",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {/* Zone Header */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {meta.flag} {meta.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={lang.toUpperCase()}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 700, height: 22 }}
                    />
                  </Stack>

                  <Button
                    size="small"
                    startIcon={<CropIcon fontSize="small" />}
                    onClick={() => {
                      const firstPhoto = rawPhotos[0];
                      if (firstPhoto) {
                        setSelectedCropImage({
                          url: firstPhoto.urlFull,
                          imgid: firstPhoto.imgid,
                          targetLang: lang,
                          targetType: "ingredients",
                        });
                        setCropModalOpen(true);
                      }
                    }}
                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
                  >
                    Recadrer une photo
                  </Button>
                </Stack>

                {/* Assigned photos for this language with unselect action */}
                {(frontImg || ingImg) && (
                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: "action.hover",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: "text.secondary",
                        display: "block",
                        mb: 0.75,
                      }}
                    >
                      Photos associées à cette langue :
                    </Typography>
                    <Stack direction="row" spacing={1.5}>
                      {frontImg && (
                        <Box
                          sx={{
                            position: "relative",
                            width: 60,
                            height: 60,
                            borderRadius: 1.5,
                            overflow: "hidden",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Box
                            component="img"
                            src={frontImg}
                            alt="Front"
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <Chip
                            label="Face"
                            size="small"
                            sx={{
                              position: "absolute",
                              bottom: 2,
                              left: 2,
                              fontSize: "0.55rem",
                              height: 14,
                            }}
                          />
                          <Tooltip
                            title={`Retirer cette photo de ${meta.name}`}
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                void onUnselectPhoto(`front_${lang}`)
                              }
                              sx={{
                                position: "absolute",
                                top: 2,
                                right: 2,
                                bgcolor: "rgba(0,0,0,0.65)",
                                color: "white",
                                p: 0.25,
                                "&:hover": { bgcolor: "error.main" },
                              }}
                            >
                              <CloseIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                      {ingImg && (
                        <Box
                          sx={{
                            position: "relative",
                            width: 60,
                            height: 60,
                            borderRadius: 1.5,
                            overflow: "hidden",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Box
                            component="img"
                            src={ingImg}
                            alt="Ingredients"
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <Chip
                            label="Ingr."
                            size="small"
                            sx={{
                              position: "absolute",
                              bottom: 2,
                              left: 2,
                              fontSize: "0.55rem",
                              height: 14,
                            }}
                          />
                          <Tooltip
                            title={`Retirer cette photo de ${meta.name}`}
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                void onUnselectPhoto(`ingredients_${lang}`)
                              }
                              sx={{
                                position: "absolute",
                                top: 2,
                                right: 2,
                                bgcolor: "rgba(0,0,0,0.65)",
                                color: "white",
                                p: 0.25,
                                "&:hover": { bgcolor: "error.main" },
                              }}
                            >
                              <CloseIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                )}

                {/* Drop Target Hint */}
                {isOver && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "2px dashed",
                      borderColor: "primary.main",
                      bgcolor: "primary.light",
                      color: "primary.contrastText",
                      textAlign: "center",
                      fontWeight: 700,
                    }}
                  >
                    Déposer la photo pour {meta.name}
                  </Box>
                )}

                {/* Product Name Input */}
                <TextField
                  label={`Nom du produit (${meta.name})`}
                  value={fieldsByLang[lang]?.name || ""}
                  onChange={(e) =>
                    setFieldsByLang((prev) => ({
                      ...prev,
                      [lang]: {
                        ...prev[lang],
                        name: e.target.value,
                      },
                    }))
                  }
                  size="small"
                  fullWidth
                  dir={lang === "ar" || lang === "he" ? "rtl" : "ltr"}
                />

                {/* Ingredients Text Input with text-selection listener */}
                <Box sx={{ position: "relative" }}>
                  <TextField
                    label={`Ingrédients (${meta.name})`}
                    value={fieldsByLang[lang]?.ingredients || ""}
                    onChange={(e) =>
                      setFieldsByLang((prev) => ({
                        ...prev,
                        [lang]: {
                          ...prev[lang],
                          ingredients: e.target.value,
                        },
                      }))
                    }
                    onSelect={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      const sel = target.value.substring(
                        target.selectionStart,
                        target.selectionEnd,
                      );
                      if (sel && sel.trim().length > 2) {
                        setSelectedTextInfo({
                          fromLang: lang,
                          field: "ingredients",
                          text: sel.trim(),
                        });
                      }
                    }}
                    size="small"
                    fullWidth
                    multiline
                    minRows={4}
                    maxRows={8}
                    dir={lang === "ar" || lang === "he" ? "rtl" : "ltr"}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.5, fontSize: "0.7rem" }}
                  >
                    💡 Surlignez un mot ou une phrase pour la couper vers une
                    autre langue.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Login notice if guest */}
      {!isLoggedIn && (
        <Alert severity="warning" icon={<LoginIcon />} sx={{ borderRadius: 2 }}>
          {t(
            "polyglot.login_hint",
            "Connectez-vous à Open Food Facts pour que vos corrections soient enregistrées.",
          )}
        </Alert>
      )}

      {/* Primary Save Bar */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          p: 2,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
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
            disabled={isSaving}
            onClick={() => void handleSaveAll()}
            startIcon={<SaveIcon />}
            sx={{
              borderRadius: 2.5,
              px: 4,
              py: 1.25,
              textTransform: "none",
              fontWeight: 800,
              fontSize: "1rem",
              boxShadow: 2,
            }}
          >
            {t(
              "polyglot.dispatch.btn_save_all",
              "Enregistrer toutes les zones multilingues",
            )}
          </Button>
        </Stack>
      </Card>

      {/* Interactive Crop Modal */}
      {selectedCropImage && (
        <PolyglotImageCropperModal
          open={cropModalOpen}
          onClose={() => {
            setCropModalOpen(false);
            setSelectedCropImage(null);
          }}
          product={product}
          imageUrl={selectedCropImage.url}
          imgid={selectedCropImage.imgid}
          detectedOcr={detectedOcr}
          availableLanguages={activeLanguages}
          initialTargetLang={selectedCropImage.targetLang}
          initialTargetType={selectedCropImage.targetType}
          onApplyCrop={handleApplyCrop}
        />
      )}
    </Box>
  );
}
