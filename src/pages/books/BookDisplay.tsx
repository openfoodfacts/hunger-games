import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Link from "@mui/material/Link";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import LocalLibraryRoundedIcon from "@mui/icons-material/LocalLibraryRounded";
import { useTranslation } from "react-i18next";

import ZoomableImage from "../../components/ZoomableImage";
import { formatIsbn, getBookExternalUrls } from "./booksService";
import type { BookProduct } from "./types";
import { getImagesUrls } from "../questions/utils";

interface BookDisplayProps {
  product: BookProduct;
  isSubmitting: boolean;
  onMoveToOpf: () => void;
  onNotABook: () => void;
  onSkip: () => void;
}

export default function BookDisplay({
  product,
  isSubmitting,
  onMoveToOpf,
  onNotABook,
  onSkip,
}: BookDisplayProps) {
  const { t } = useTranslation();

  // Extract all available images
  const images = React.useMemo(() => {
    const list: Array<{ url: string; urlFull: string; label: string }> = [];

    if (product.image_front_url) {
      list.push({
        url: product.image_front_url,
        urlFull: product.image_front_url,
        label: t("books.front_cover", "Cover"),
      });
    }

    if (product.images) {
      const urls = getImagesUrls(product.images, product.code);
      urls.forEach((u, i) => {
        if (!list.some((item) => item.url === u.imageUrl || item.urlFull === u.imageUrlFull)) {
          list.push({
            url: u.imageUrl,
            urlFull: u.imageUrlFull,
            label: `${t("image", "Image")} ${i + 1}`,
          });
        }
      });
    }

    if (list.length === 0 && product.image_url) {
      list.push({
        url: product.image_url,
        urlFull: product.image_url,
        label: t("books.front_cover", "Cover"),
      });
    }

    return list;
  }, [product, t]);

  const [activeImageTab, setActiveImageTab] = React.useState(0);

  const currentImage = images[activeImageTab] ?? null;

  // External reference links
  const links = React.useMemo(() => getBookExternalUrls(product.code), [product.code]);
  const formattedIsbn = React.useMemo(() => formatIsbn(product.code), [product.code]);

  const is978 = product.code.startsWith("978");
  const is979 = product.code.startsWith("979");

  // Global keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is focusing an input or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "y" || e.key === "Y" || e.key === "Enter" || e.key === "1") {
        e.preventDefault();
        onMoveToOpf();
      } else if (e.key === "n" || e.key === "N" || e.key === "0") {
        e.preventDefault();
        onNotABook();
      } else if (e.key === "s" || e.key === "S" || e.key === " ") {
        e.preventDefault();
        onSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onMoveToOpf, onNotABook, onSkip]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Grid container spacing={3}>
        {/* Left: Image / Cover Panel */}
        <Grid size={{ xs: 12, md: 6, lg: 5 }}>
          <Stack spacing={1.5}>
            {/* Multiple images tabs */}
            {images.length > 1 && (
              <Tabs
                value={activeImageTab}
                onChange={(_, val: number) => setActiveImageTab(val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ minHeight: 36, "& .MuiTab-root": { minHeight: 36, py: 0.5, fontSize: "0.8rem" } }}
              >
                {images.map((img, idx) => (
                  <Tab key={img.url} label={img.label} value={idx} />
                ))}
              </Tabs>
            )}

            {/* Image viewer */}
            <Box
              sx={{
                width: "100%",
                minHeight: { xs: 320, md: 460 },
                maxHeight: { xs: 450, md: 540 },
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "action.hover",
                display: "grid",
                placeItems: "center",
                position: "relative",
              }}
            >
              {currentImage ? (
                <ZoomableImage
                  src={currentImage.url}
                  srcFull={currentImage.urlFull}
                  zoomIn
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  imageProps={{
                    style: {
                      maxHeight: "440px",
                      maxWidth: "100%",
                      objectFit: "contain",
                    },
                    alt: product.product_name || `Book cover ${product.code}`,
                  }}
                />
              ) : (
                <Stack alignItems="center" spacing={1} sx={{ p: 4, color: "text.secondary" }}>
                  <MenuBookRoundedIcon sx={{ fontSize: 64, opacity: 0.4 }} />
                  <Typography variant="body2">
                    {t("books.no_image", "No photo uploaded yet for this product")}
                  </Typography>
                </Stack>
              )}
            </Box>
          </Stack>
        </Grid>

        {/* Right: Book Metadata & Decision Controls */}
        <Grid size={{ xs: 12, md: 6, lg: 7 }}>
          <Stack spacing={2.5} sx={{ height: "100%", justifyContent: "space-between" }}>
            {/* Top metadata */}
            <Stack spacing={1.5}>
              {/* ISBN prefix badge & barcode */}
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip
                  icon={<AutoStoriesRoundedIcon />}
                  label={
                    is978
                      ? "ISBN-13 Bookland (978)"
                      : is979
                        ? "ISBN-13 / ISMN (979)"
                        : "Barcode"
                  }
                  color={is978 ? "primary" : is979 ? "secondary" : "default"}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
                <Typography variant="body2" fontFamily="monospace" fontWeight={700}>
                  {formattedIsbn}
                </Typography>
              </Stack>

              {/* Book Title */}
              <Typography variant="h5" fontWeight={800} component="h2" sx={{ lineHeight: 1.25 }}>
                {product.product_name || (
                  <Typography
                    component="span"
                    variant="h5"
                    fontStyle="italic"
                    color="text.secondary"
                  >
                    {t("books.unknown_title", "Unknown title / Sans titre")}
                  </Typography>
                )}
              </Typography>

              {/* Publisher / Brands */}
              {product.brands && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {t("books.publisher_brand", "Publisher / Brand")}:
                  </Typography>
                  <Chip
                    label={product.brands}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>
              )}

              {/* Quantity / Pages */}
              {product.quantity && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {t("quantity", "Quantity / Pages")}:
                  </Typography>
                  <Typography variant="body2">{product.quantity}</Typography>
                </Stack>
              )}

              {/* Current Categories in OFF */}
              {product.categories && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    {t("categories", "Current Categories in OFF")}:
                  </Typography>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    {product.categories
                      .split(",")
                      .map((cat) => cat.trim())
                      .filter(Boolean)
                      .map((cat) => (
                        <Chip
                          key={cat}
                          label={cat}
                          size="small"
                          sx={{ mb: 0.5, bgcolor: "action.hover" }}
                        />
                      ))}
                  </Stack>
                </Box>
              )}

              {/* External Lookup Links */}
              <Box sx={{ pt: 1 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ display: "block", mb: 0.5 }}
                >
                  {t("books.verify_online", "Verify details online")}:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button
                    size="small"
                    variant="outlined"
                    component={Link}
                    href={links.offProductUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<OpenInNewRoundedIcon fontSize="small" />}
                    sx={{ textTransform: "none", fontSize: "0.8rem", py: 0.25 }}
                  >
                    Open Food Facts
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    component={Link}
                    href={links.openLibraryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<LocalLibraryRoundedIcon fontSize="small" />}
                    endIcon={<OpenInNewRoundedIcon fontSize="small" />}
                    sx={{ textTransform: "none", fontSize: "0.8rem", py: 0.25 }}
                  >
                    Open Library
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    component={Link}
                    href={links.googleBooksUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<OpenInNewRoundedIcon fontSize="small" />}
                    sx={{ textTransform: "none", fontSize: "0.8rem", py: 0.25 }}
                  >
                    Google Books
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    component={Link}
                    href={links.offEditUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<EditRoundedIcon fontSize="small" />}
                    endIcon={<OpenInNewRoundedIcon fontSize="small" />}
                    sx={{ textTransform: "none", fontSize: "0.8rem", py: 0.25 }}
                  >
                    {t("edit", "Edit")}
                  </Button>
                </Stack>
              </Box>
            </Stack>

            {/* Decision Action Area */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={800}
                textAlign="center"
                sx={{ mb: 1.5 }}
              >
                {t(
                  "books.is_it_a_book_question",
                  "Is this a book to move to Open Products Facts?",
                )}
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems="stretch"
              >
                {/* YES: Move to Open Products Facts */}
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={onMoveToOpf}
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <DoneIcon />
                    )
                  }
                  sx={{
                    flex: { sm: 2 },
                    py: 1.5,
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    boxShadow: "none",
                    "&:hover": { boxShadow: "none" },
                  }}
                >
                  {t(
                    "books.yes_move_button",
                    "Yes, move to Open Products Facts",
                  )}{" "}
                  (Y)
                </Button>

                {/* NO: Not a book */}
                <Button
                  variant="outlined"
                  color="error"
                  size="large"
                  onClick={onNotABook}
                  disabled={isSubmitting}
                  startIcon={<CloseIcon />}
                  sx={{
                    flex: { sm: 1 },
                    py: 1.5,
                    fontWeight: 700,
                  }}
                >
                  {t("books.not_a_book_button", "Not a book")} (N)
                </Button>

                {/* SKIP */}
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  onClick={onSkip}
                  disabled={isSubmitting}
                  startIcon={<SkipNextIcon />}
                  sx={{
                    flex: { sm: 1 },
                    py: 1.5,
                    fontWeight: 700,
                  }}
                >
                  {t("skip", "Skip")} (S)
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
