import * as React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Stack, Button } from "@mui/material";
import ZoomableImage from "../../../components/ZoomableImage";
import off from "../../../off";
import { PolyglotProduct, DetectedLanguageInfo } from "../types";

interface PolyglotPhotoViewerProps {
  product: PolyglotProduct;
  detectedOcr?: DetectedLanguageInfo | null;
  isOcrLoading?: boolean;
}

interface ImageItem {
  id: string;
  url: string;
  urlFull?: string;
  label: string;
}

const LANGUAGE_LABELS: Record<string, { flag: string; name: string }> = {
  fr: { flag: "🇫🇷", name: "Français" },
  en: { flag: "🇬🇧", name: "Anglais" },
  de: { flag: "🇩🇪", name: "Allemand" },
  es: { flag: "🇪🇸", name: "Espagnol" },
  it: { flag: "🇮🇹", name: "Italien" },
  nl: { flag: "🇳🇱", name: "Néerlandais" },
  he: { flag: "🇮🇱", name: "Hébreu" },
  ar: { flag: "🇸🇦", name: "Arabe" },
};

export default function PolyglotPhotoViewer({
  product,
  detectedOcr,
  isOcrLoading,
}: PolyglotPhotoViewerProps) {
  const { t } = useTranslation();
  const [prevCode, setPrevCode] = React.useState(product.code);
  const [activeIndex, setActiveIndex] = React.useState<number>(0);

  if (product.code !== prevCode) {
    setPrevCode(product.code);
    setActiveIndex(0);
  }

  const images = React.useMemo(() => {
    const list: ImageItem[] = [];

    if (product.image_front_url) {
      list.push({
        id: "front",
        url: product.image_front_url,
        urlFull: product.image_front_url.replace(/\.400\.jpg$/, ".jpg"),
        label: t("polyglot.image_front", "Face avant"),
      });
    }

    if (product.image_ingredients_url) {
      list.push({
        id: "ingredients",
        url: product.image_ingredients_url,
        urlFull: product.image_ingredients_url.replace(/\.400\.jpg$/, ".jpg"),
        label: t("polyglot.image_ingredients", "Ingrédients"),
      });
    }

    if (product.image_packaging_url) {
      list.push({
        id: "packaging",
        url: product.image_packaging_url,
        urlFull: product.image_packaging_url.replace(/\.400\.jpg$/, ".jpg"),
        label: t("polyglot.image_packaging", "Emballage"),
      });
    }

    if (product.images && product.code) {
      const formattedCode = off.getFormatedBarcode(product.code);
      const rootImageUrl = off.getImageUrl(formattedCode);

      Object.keys(product.images)
        .filter((key) => !isNaN(Number(key)))
        .sort((a, b) => Number(a) - Number(b))
        .forEach((key) => {
          const imgUrl = `${rootImageUrl}/${key}.400.jpg`;
          const imgFull = `${rootImageUrl}/${key}.jpg`;
          if (!list.some((item) => item.url === imgUrl)) {
            list.push({
              id: `raw-${key}`,
              url: imgUrl,
              urlFull: imgFull,
              label: `${t("polyglot.photo", "Photo")} #${key}`,
            });
          }
        });
    }

    return list;
  }, [product, t]);

  const currentImage = images[activeIndex] || images[0];

  const detectedInfo = React.useMemo(() => {
    if (!detectedOcr) return null;
    const lang = detectedOcr.languageCode.toLowerCase();
    const meta = LANGUAGE_LABELS[lang] || {
      flag: "🌐",
      name: lang.toUpperCase(),
    };
    const certitude = detectedOcr.confidence > 0.8 ? "Très fiable" : "Probable";
    return `${meta.flag} ${meta.name} (${certitude})`;
  }, [detectedOcr]);

  if (!currentImage) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 3,
          bgcolor: "background.paper",
          border: "1px dashed",
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {t("polyglot.no_photo", "Aucune photo disponible pour ce produit.")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Photo carousel tabs */}
      {images.length > 1 && (
        <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 0.5 }}>
          {images.map((img, idx) => (
            <Button
              key={img.id}
              size="small"
              variant={idx === activeIndex ? "contained" : "outlined"}
              onClick={() => setActiveIndex(idx)}
              sx={{
                fontSize: "0.75rem",
                borderRadius: 2,
                textTransform: "none",
                whiteSpace: "nowrap",
              }}
            >
              {img.label}
            </Button>
          ))}
        </Stack>
      )}

      {/* Main Image container with ZoomableImage */}
      <Box
        sx={{
          position: "relative",
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          minHeight: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ZoomableImage
          key={currentImage.url}
          src={currentImage.url}
          srcFull={currentImage.urlFull}
          zoomIn={true}
          style={{ width: "100%", height: 380, objectFit: "contain" }}
        />

        {/* OCR Language detection badge */}
        {isOcrLoading && !detectedInfo && (
          <Box
            sx={{
              position: "absolute",
              bottom: 12,
              left: 12,
              bgcolor: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(4px)",
              color: "white",
              px: 2,
              py: 0.75,
              borderRadius: 2,
            }}
          >
            <Typography variant="caption">
              {t(
                "polyglot.detecting_language",
                "Détection de la langue de l'emballage...",
              )}
            </Typography>
          </Box>
        )}
        {detectedInfo && (
          <Box
            sx={{
              position: "absolute",
              bottom: 12,
              left: 12,
              right: 12,
              bgcolor: "rgba(0,0,0,0.82)",
              backdropFilter: "blur(6px)",
              color: "white",
              px: 2,
              py: 1,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: 2,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "success.main",
                }}
              />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {t(
                  "polyglot.detected_text_on_photo",
                  "Texte lu sur l'emballage :",
                )}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: "bold", color: "success.light" }}
              >
                {detectedInfo}
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              sx={{ opacity: 0.7, fontSize: "0.65rem" }}
            >
              Reconnaissance automatique
            </Typography>
          </Box>
        )}
      </Box>

      {/* Helper tip */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", px: 0.5 }}
      >
        💡{" "}
        {t(
          "polyglot.photo_tip",
          "Utilisez la molette de la souris ou pincez pour zoomer sur la boîte.",
        )}
      </Typography>
    </Box>
  );
}
