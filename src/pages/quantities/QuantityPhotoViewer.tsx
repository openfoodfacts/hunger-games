import * as React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, IconButton, Tooltip, Stack } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomableImage from "../../components/ZoomableImage";
import off from "../../off";
import { QuantityProduct } from "./types";

interface QuantityPhotoViewerProps {
  product: QuantityProduct;
}

interface ImageItem {
  id: string;
  url: string;
  urlFull?: string;
  label: string;
}

export default function QuantityPhotoViewer({
  product,
}: QuantityPhotoViewerProps) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = React.useState<number>(0);

  // Extract all available product images
  const images = React.useMemo(() => {
    const list: ImageItem[] = [];

    if (product.image_front_url) {
      list.push({
        id: "front",
        url: product.image_front_url,
        urlFull: product.image_front_url.replace(/\.400\.jpg$/, ".jpg"),
        label: t("quantities.image_front", "Face avant"),
      });
    }

    if (product.image_nutrition_url) {
      list.push({
        id: "nutrition",
        url: product.image_nutrition_url,
        urlFull: product.image_nutrition_url.replace(/\.400\.jpg$/, ".jpg"),
        label: t("quantities.image_nutrition", "Tableau nutritionnel"),
      });
    }

    if (product.image_ingredients_url) {
      list.push({
        id: "ingredients",
        url: product.image_ingredients_url,
        urlFull: product.image_ingredients_url.replace(/\.400\.jpg$/, ".jpg"),
        label: t("quantities.image_ingredients", "Ingrédients"),
      });
    }

    if (product.image_packaging_url) {
      list.push({
        id: "packaging",
        url: product.image_packaging_url,
        urlFull: product.image_packaging_url.replace(/\.400\.jpg$/, ".jpg"),
        label: t("quantities.image_packaging", "Emballage"),
      });
    }

    // Numbered images from product.images
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
              label: `${t("quantities.photo", "Photo")} #${key}`,
            });
          }
        });
    }

    return list;
  }, [product, t]);

  // Reset active index when product changes
  React.useEffect(() => {
    setActiveIndex(0);
  }, [product.code]);

  const currentImage = images[activeIndex] || images[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "background.paper",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      {/* Header bar */}
      <Box
        sx={{
          p: 1.5,
          px: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "action.hover",
        }}
      >
        <Typography variant="subtitle2" fontWeight={700}>
          {currentImage?.label ||
            t("quantities.packaging_photo", "Photos du produit")}
          {images.length > 0 && ` (${activeIndex + 1}/${images.length})`}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip
            title={t(
              "quantities.zoom_hint",
              "Zoomez et déplacez l'image pour repérer le poids / volume",
            )}
          >
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{ opacity: 0.7 }}
            >
              <ZoomInIcon fontSize="small" />
              <Typography
                variant="caption"
                sx={{ display: { xs: "none", sm: "inline" } }}
              >
                {t("quantities.zoom_hint_short", "Zoom molette / clic")}
              </Typography>
            </Stack>
          </Tooltip>
        </Stack>
      </Box>

      {/* Main Image Viewport */}
      <Box
        sx={{
          position: "relative",
          flexGrow: 1,
          minHeight: { xs: 350, sm: 480, md: 540 },
          bgcolor: "#1a1614",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {images.length > 0 && currentImage ? (
          <>
            <ZoomableImage
              key={currentImage.url}
              src={currentImage.url}
              srcFull={currentImage.urlFull}
              zoomIn
              style={{
                width: "100%",
                height: "100%",
                minHeight: 480,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              imageProps={{
                style: {
                  maxWidth: "100%",
                  maxHeight: "540px",
                  objectFit: "contain",
                },
              }}
            />

            {images.length > 1 && (
              <>
                <IconButton
                  onClick={handlePrev}
                  sx={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "rgba(0,0,0,0.55)",
                    color: "white",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                  }}
                  size="small"
                >
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton
                  onClick={handleNext}
                  sx={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "rgba(0,0,0,0.55)",
                    color: "white",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                  }}
                  size="small"
                >
                  <ChevronRightIcon />
                </IconButton>
              </>
            )}
          </>
        ) : (
          <Stack alignItems="center" spacing={1} color="white">
            <ErrorOutlineIcon sx={{ fontSize: 48, opacity: 0.5 }} />
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {t(
                "quantities.no_photos",
                "Aucune photo disponible pour ce produit.",
              )}
            </Typography>
          </Stack>
        )}
      </Box>

      {/* Thumbnail Selector */}
      {images.length > 1 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            p: 1.5,
            bgcolor: "background.paper",
            overflowX: "auto",
            borderTop: "1px solid",
            borderColor: "divider",
            scrollbarWidth: "thin",
          }}
        >
          {images.map((img, idx) => (
            <Box
              key={img.id}
              onClick={() => setActiveIndex(idx)}
              sx={{
                cursor: "pointer",
                width: 64,
                height: 64,
                borderRadius: 1.5,
                overflow: "hidden",
                border: "2px solid",
                borderColor:
                  activeIndex === idx ? "primary.main" : "transparent",
                opacity: activeIndex === idx ? 1 : 0.6,
                transform: activeIndex === idx ? "scale(1.04)" : "none",
                transition: "all 0.2s",
                flexShrink: 0,
                bgcolor: "action.hover",
              }}
            >
              <img
                src={img.url}
                alt={img.label}
                loading="lazy"
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
    </Box>
  );
}
