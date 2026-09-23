import * as React from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Link as MuiLink,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import BlockIcon from "@mui/icons-material/Block";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { useTranslation } from "react-i18next";

import countries from "../../assets/countries.json";
import { useCountry } from "../../contexts/CountryProvider";
import GameOpportunityBadge from "../../components/GameOpportunityBadge";
import { useIngredientImageCandidates } from "./useIngredientImageCandidates";
import { getImagesUrls } from "../questions/utils";
import offService from "../../off";
import externalApi from "../../externalApi";

interface CountryOption {
  id: string;
  label: string;
  languageCode: string;
  countryCode: string;
}

export default function SelectIngredientImagePage() {
  const { t } = useTranslation();
  const [country, setCountry] = useCountry();
  const { currentProduct, removeHead, isLoading, error, retry } =
    useIngredientImageCandidates(country);

  const selectedCountry = React.useMemo(() => {
    if (!country || country === "world") {
      return null;
    }
    return countries.find((c) => c.countryCode === country) || null;
  }, [country]);

  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = React.useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const candidateImages = React.useMemo(() => {
    if (!currentProduct?.images || !currentProduct.code) return [];
    return getImagesUrls(currentProduct.images, currentProduct.code);
  }, [currentProduct]);

  const handleSelectImage = (imgid: string) => {
    if (!currentProduct || isSubmitting) return;

    const code = currentProduct.code;
    const lang = currentProduct.lang || "fr";
    const imageField = `ingredients_${lang}`;

    setIsSubmitting(true);
    setSnackbarMessage(
      t(
        "select_ingredient_image.selected_success",
        `Selected image #${imgid} as ingredients list!`,
      ),
    );

    // Fire and forget / background save
    offService
      .selectProductImage({ code, imgid, id: imageField })
      .catch((err) => {
        console.error("Failed to select ingredient image:", err);
      });

    // Advance immediately (optimistic UI)
    removeHead();
    setIsSubmitting(false);
  };

  const handleNoneMatch = () => {
    setSnackbarMessage(
      t(
        "select_ingredient_image.none_matched",
        "Marked as no ingredient image in current photos.",
      ),
    );
    removeHead();
  };

  const handleSkip = () => {
    removeHead();
  };

  const handleFlagImage = (
    e: React.MouseEvent,
    barcode: string,
    imgid: string,
  ) => {
    e.stopPropagation();
    try {
      externalApi.addImageFlag({
        barcode,
        imgid: Number(imgid),
      });
    } catch (err) {
      console.error("Failed to flag image:", err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header and Country Selector */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            {t(
              "select_ingredient_image.title",
              "Select Ingredient Image Quickly",
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t(
              "select_ingredient_image.subtitle",
              "Click on the photo that shows the product ingredients list. No OCR needed!",
            )}
          </Typography>
        </Box>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <GameOpportunityBadge
            game="select-ingredient-image"
            country={country}
          />
          <Autocomplete<CountryOption>
            value={selectedCountry}
            onChange={(_event, newValue) => {
              setCountry(newValue?.countryCode || "", "page");
            }}
            options={countries}
            isOptionEqualToValue={(option, value) =>
              option.countryCode === value.countryCode
            }
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("questions.filters.long_label.country", "Country")}
                placeholder={t(
                  "questions.filters.placeholders.country",
                  "Country",
                )}
                size="small"
              />
            )}
            sx={{ minWidth: 200, maxWidth: 300 }}
          />
        </Stack>
      </Stack>

      {/* Main Content Area */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button variant="outlined" onClick={retry}>
            {t("retry", "Retry")}
          </Button>
        </Paper>
      ) : !currentProduct ? (
        <Paper sx={{ p: 5, textAlign: "center" }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {t(
              "select_ingredient_image.no_products",
              "No products waiting for ingredient image selection in this country!",
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t(
              "select_ingredient_image.try_another_country",
              "Try selecting another country or 'World' above.",
            )}
          </Typography>
        </Paper>
      ) : (
        <Box>
          {/* Active Product Information Card */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              {currentProduct.image_front_url && (
                <Box
                  component="img"
                  src={currentProduct.image_front_url}
                  alt={currentProduct.product_name ?? "Product"}
                  sx={{
                    width: 56,
                    height: 56,
                    objectFit: "contain",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                />
              )}
              <Box>
                <Typography variant="h6" fontWeight="600">
                  {currentProduct.product_name ||
                    t("unnamed_product", "Unnamed product")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentProduct.brands && (
                    <span>{currentProduct.brands} • </span>
                  )}
                  <MuiLink
                    href={`https://world.openfoodfacts.org/product/${currentProduct.code}`}
                    target="_blank"
                    rel="noreferrer"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    {currentProduct.code}
                    <OpenInNewRoundedIcon fontSize="inherit" />
                  </MuiLink>
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<BlockIcon />}
                onClick={handleNoneMatch}
                size="small"
              >
                {t(
                  "select_ingredient_image.none_of_these",
                  "No ingredient image",
                )}
              </Button>
              <Button
                variant="outlined"
                startIcon={<SkipNextIcon />}
                onClick={handleSkip}
                size="small"
              >
                {t("skip", "Skip")}
              </Button>
            </Stack>
          </Paper>

          {/* Candidate Images Grid */}
          <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
            {t(
              "select_ingredient_image.choose_prompt",
              "Which photo contains the ingredients list?",
            )}
          </Typography>

          <Grid container spacing={2}>
            {candidateImages.map((img) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={`${currentProduct.code}-${img.imgid}`}
              >
                <Card
                  variant="outlined"
                  sx={(theme) => ({
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    position: "relative",
                    transition: theme.transitions.create([
                      "box-shadow",
                      "transform",
                      "border-color",
                    ]),
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: theme.shadows[4],
                      borderColor: theme.palette.primary.main,
                    },
                  })}
                >
                  <CardActionArea
                    onClick={() => handleSelectImage(img.imgid)}
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        height: 240,
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        p: 1,
                        position: "relative",
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={img.imageUrl}
                        alt={`Photo #${img.imgid}`}
                        sx={{
                          maxHeight: "100%",
                          maxWidth: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                    <CardContent sx={{ width: "100%", p: 1.5, flexGrow: 1 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2" fontWeight="500">
                          #{img.imgid}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {img.uploaded_t}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </CardActionArea>

                  {/* Actions bar on each image */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      px: 1.5,
                      pb: 1.5,
                      pt: 0,
                      borderTop: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title={t("zoom", "Zoom")}>
                        <IconButton
                          size="small"
                          onClick={() => setPreviewImage(img.imageUrlFull)}
                        >
                          <ZoomInIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={t("questions.flag", "Flag image on NutriPatrol")}
                      >
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) =>
                            handleFlagImage(e, currentProduct.code, img.imgid)
                          }
                        >
                          <OutlinedFlagIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<CheckCircleRoundedIcon />}
                      onClick={() => handleSelectImage(img.imgid)}
                    >
                      {t("select", "Select")}
                    </Button>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Full Size Preview Dialog */}
      <Dialog
        open={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent
          sx={{
            p: 1,
            backgroundColor: "background.paper",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {previewImage && (
            <Box
              component="img"
              src={previewImage}
              alt="Enlarged preview"
              sx={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: 1,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Transient Notification Snackbar */}
      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={2500}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Container>
  );
}
