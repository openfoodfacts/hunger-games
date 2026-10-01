import * as React from "react";
import { useTranslation } from "react-i18next";
import { useTheme, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import CollectionsIcon from "@mui/icons-material/Collections";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ZoomableImage from "../../components/ZoomableImage";
import offService from "../../off";
import type { Product } from "../../off";

interface GalleryImageItem {
  id: string;
  label: string;
  imageUrl: string;
  imageUrlFull: string;
}

interface PhotoGalleryProps {
  images?: Product["images"];
  barcode: string;
  productName?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  images,
  barcode,
  productName,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Extract all available image items
  const galleryItems = React.useMemo<GalleryImageItem[]>(() => {
    if (!images || !barcode) return [];

    const formattedCode = offService.getFormatedBarcode(barcode);
    const rootImageUrl = offService.getImageUrl(formattedCode);
    const items: GalleryImageItem[] = [];

    // Specific known selected images (front, ingredients, nutrition, packaging)
    const specialKeys: { key: string; label: string }[] = [
      { key: "front", label: "Front" },
      { key: "ingredients", label: "Ingredients" },
      { key: "nutrition", label: "Nutrition" },
      { key: "packaging", label: "Packaging" },
    ];

    specialKeys.forEach(({ key, label }) => {
      // Find if any image key starts with this prefix (e.g. front_en, front_fr, front)
      const matchedKey = Object.keys(images).find(
        (k) => k === key || k.startsWith(`${key}_`),
      );
      if (matchedKey) {
        const val: unknown = images[matchedKey];
        if (
          typeof val === "object" &&
          val !== null &&
          "imgid" in val &&
          typeof (val as { imgid?: unknown }).imgid === "string"
        ) {
          const imgid = (val as { imgid: string }).imgid;
          items.push({
            id: matchedKey,
            label,
            imageUrl: `${rootImageUrl}/${imgid}.400.jpg`,
            imageUrlFull: `${rootImageUrl}/${imgid}.jpg`,
          });
        }
      }
    });

    // Also include all raw numbered images (1.jpg, 2.jpg, etc.)
    const numberedKeys = Object.keys(images)
      .filter((k) => !isNaN(parseInt(k, 10)))
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    numberedKeys.forEach((key) => {
      // Avoid exact duplicates if already added from specialKeys
      const alreadyHas = items.some((it) =>
        it.imageUrl.includes(`/${key}.400.jpg`),
      );
      if (!alreadyHas) {
        items.push({
          id: key,
          label: `#${key}`,
          imageUrl: `${rootImageUrl}/${key}.400.jpg`,
          imageUrlFull: `${rootImageUrl}/${key}.jpg`,
        });
      }
    });

    return items;
  }, [images, barcode]);

  const currentImage = galleryItems[selectedIndex] || null;

  const handlePrev = () => {
    if (galleryItems.length === 0) return;
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : galleryItems.length - 1));
  };

  const handleNext = () => {
    if (galleryItems.length === 0) return;
    setSelectedIndex((prev) => (prev < galleryItems.length - 1 ? prev + 1 : 0));
  };

  if (!galleryItems.length) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 2,
          border: `1px dashed ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.background.paper, 0.5)
              : alpha(theme.palette.grey[100], 0.8),
        }}
      >
        <CollectionsIcon
          sx={{ fontSize: 48, color: "text.secondary", opacity: 0.5, mb: 1 }}
        />
        <Typography variant="body1" color="text.secondary">
          {t(
            "logic_bomb.no_photos",
            "No packaging photos available for this product",
          )}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        width: "100%",
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        p: 2,
        backgroundColor:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.background.paper, 0.7)
            : "#ffffff",
      }}
    >
      {/* Header bar */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <CollectionsIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight={700}>
            {t("logic_bomb.photo_gallery", "Photo Gallery")}
          </Typography>
          <Chip
            size="small"
            label={`${selectedIndex + 1} / ${galleryItems.length}`}
            sx={{ fontWeight: 600, height: 20, fontSize: "0.75rem" }}
          />
          {currentImage?.label && (
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={currentImage.label}
              sx={{ height: 20, fontSize: "0.75rem" }}
            />
          )}
        </Stack>

        {currentImage?.imageUrlFull && (
          <Tooltip
            title={t(
              "logic_bomb.view_full_image",
              "Open original photo in new tab",
            )}
          >
            <Button
              size="small"
              variant="text"
              component="a"
              href={currentImage.imageUrlFull}
              target="_blank"
              rel="noreferrer"
              endIcon={<OpenInNewIcon fontSize="small" />}
              sx={{ textTransform: "none", py: 0.25 }}
            >
              {t("logic_bomb.full_resolution", "Original Photo")}
            </Button>
          </Tooltip>
        )}
      </Stack>

      {/* Main Image Stage */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: 300, sm: 400, md: 460 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor:
            theme.palette.mode === "dark" ? "#1a1a1a" : "#f8fafc",
          border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        }}
      >
        {currentImage ? (
          <ZoomableImage
            key={currentImage.imageUrl}
            src={currentImage.imageUrl}
            srcFull={currentImage.imageUrlFull}
            zoomIn
            style={{ width: "100%", height: "100%" }}
            imageProps={{
              alt: `${productName || "Product"} - ${currentImage.label}`,
              loading: "eager",
              style: {
                width: "100%",
                height: "100%",
                objectFit: "contain",
              },
            }}
          />
        ) : null}

        {/* Previous Button Overlay */}
        {galleryItems.length > 1 && (
          <IconButton
            onClick={handlePrev}
            aria-label="Previous photo"
            size="small"
            sx={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              boxShadow: theme.shadows[2],
              "&:hover": {
                backgroundColor: theme.palette.background.paper,
              },
            }}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
        )}

        {/* Next Button Overlay */}
        {galleryItems.length > 1 && (
          <IconButton
            onClick={handleNext}
            aria-label="Next photo"
            size="small"
            sx={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              boxShadow: theme.shadows[2],
              "&:hover": {
                backgroundColor: theme.palette.background.paper,
              },
            }}
          >
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Thumbnail Strip */}
      {galleryItems.length > 1 && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "auto",
            py: 0.5,
            px: 0.5,
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": { height: 6 },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: alpha(theme.palette.divider, 0.8),
              borderRadius: 3,
            },
          }}
        >
          {galleryItems.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <Box
                key={item.id}
                onClick={() => setSelectedIndex(idx)}
                sx={{
                  flex: "0 0 74px",
                  height: 74,
                  borderRadius: 2,
                  overflow: "hidden",
                  cursor: "pointer",
                  position: "relative",
                  border: isSelected
                    ? `2.5px solid ${theme.palette.primary.main}`
                    : `1px solid ${theme.palette.divider}`,
                  opacity: isSelected ? 1 : 0.7,
                  transition: "all 0.15s ease-in-out",
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#222" : "#f1f5f9",
                  "&:hover": {
                    opacity: 1,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.label}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "rgba(0,0,0,0.65)",
                    color: "#ffffff",
                    fontSize: "0.65rem",
                    textAlign: "center",
                    fontWeight: 700,
                    px: 0.5,
                    py: 0.2,
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
export default PhotoGallery;
