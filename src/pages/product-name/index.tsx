import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useTranslation } from "react-i18next";

import ZoomableImage from "../../components/ZoomableImage";
import offService from "../../off";
import { useCountry } from "../../contexts/CountryProvider";
import { getImagesUrls } from "../questions/utils";
import type { ProductNameProduct } from "./useProductNameGame";
import { useProductNameGame } from "./useProductNameGame";
import { validateProductName } from "./validateName";
import type { ProductNameErrorKey } from "./validateName";

type ProductNameEditorProps = {
  product: ProductNameProduct;
  isSaving: boolean;
  onSubmit: (name: string) => void;
  onSkip: () => void;
};

const ProductNameEditor = ({
  product,
  isSaving,
  onSubmit,
  onSkip,
}: ProductNameEditorProps) => {
  const { t } = useTranslation();
  const [name, setName] = React.useState("");
  const [errorKey, setErrorKey] = React.useState<ProductNameErrorKey | null>(
    null,
  );

  const images = getImagesUrls(product.images ?? {}, product.code);
  const frontImage = {
    imageUrl: product.image_front_url ?? images[0]?.imageUrl ?? "",
    imageUrlFull: images[0]?.imageUrlFull,
  };

  const validate = () => {
    const error = validateProductName(name, product);
    setErrorKey(error);
    if (error !== null) {
      return;
    }
    onSubmit(name.trim());
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          sx={{ alignItems: "flex-start" }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <ZoomableImage
              src={frontImage.imageUrl}
              srcFull={frontImage.imageUrlFull}
              imageProps={{
                style: {
                  maxWidth: 280,
                  maxHeight: 280,
                  borderRadius: 8,
                },
              }}
            />
          </Box>
          <Stack spacing={2} sx={{ width: "100%", minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t("product_name.game_title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("product_name.description")}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: "wrap", gap: 1 }}
            >
              {product.brands && (
                <Chip
                  size="small"
                  label={`${t("product_name.brand")}: ${product.brands}`}
                />
              )}
              {product.categories && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${t("product_name.category")}: ${product.categories}`}
                />
              )}
            </Stack>
            <TextField
              autoFocus
              fullWidth
              label={t("product_name.name_label")}
              placeholder={t("product_name.name_placeholder")}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setErrorKey(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  validate();
                }
              }}
              error={errorKey !== null}
              helperText={
                errorKey === null
                  ? t("product_name.helper")
                  : t(`product_name.errors.${errorKey}`)
              }
              slotProps={{ htmlInput: { maxLength: 200 } }}
            />
          </Stack>
        </Stack>

        {images.length > 1 && (
          <Stack direction="row" spacing={1} sx={{ overflow: "auto" }}>
            {images.slice(1).map(({ imageUrl, imageUrlFull }) => (
              <ZoomableImage
                key={imageUrl}
                src={imageUrl}
                srcFull={imageUrlFull}
                imageProps={{
                  loading: "lazy",
                  style: { maxWidth: 140, maxHeight: 140, borderRadius: 8 },
                }}
              />
            ))}
          </Stack>
        )}

        <Stack
          direction="row"
          spacing={2}
          sx={{ justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}
        >
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              component={Link}
              target="_blank"
              href={offService.getProductUrl(product.code)}
              variant="outlined"
              startIcon={<VisibilityIcon />}
            >
              {t("questions.view")}
            </Button>
            <Button
              size="small"
              component={Link}
              target="_blank"
              href={offService.getProductEditUrl(product.code)}
              variant="outlined"
              startIcon={<EditIcon />}
            >
              {t("questions.edit")}
            </Button>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button
              onClick={onSkip}
              variant="outlined"
              startIcon={<SkipNextIcon />}
              disabled={isSaving}
            >
              {t("product_name.skip")}
            </Button>
            <Button
              onClick={validate}
              variant="contained"
              color="success"
              disabled={isSaving}
            >
              {t("product_name.validate")}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default function ProductNamePage() {
  const { t } = useTranslation();
  const [country] = useCountry();
  const { product, next, isLoading, error, retry, saveName } =
    useProductNameGame(country);
  const [isSaving, setIsSaving] = React.useState(false);
  const [toast, setToast] = React.useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const handleSubmit = (name: string) => {
    setIsSaving(true);
    void saveName(name)
      .then(() => {
        setToast({
          message: t("product_name.success"),
          severity: "success",
        });
        next();
      })
      .catch(() => {
        setToast({
          message: t("product_name.save_error"),
          severity: "error",
        });
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <Box
      sx={{ bgcolor: "action.hover", minHeight: "calc(100vh - 64px)", py: 3 }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {t("product_name.title")}
          </Typography>

          {error !== null && (
            <Alert
              severity="warning"
              action={
                <Button color="inherit" size="small" onClick={retry}>
                  {t("product_name.retry")}
                </Button>
              }
              sx={{ borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}

          {isLoading ? (
            <Stack spacing={2} sx={{ alignItems: "center", py: 6 }}>
              <CircularProgress />
              <Typography color="text.secondary">
                {t("product_name.loading")}
              </Typography>
            </Stack>
          ) : product === null ? (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                borderRadius: 3,
                textAlign: "center",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {t("product_name.no_products")}
              </Typography>
              <Button onClick={retry} variant="contained" sx={{ mt: 2 }}>
                {t("product_name.retry")}
              </Button>
            </Paper>
          ) : (
            <ProductNameEditor
              key={product.code}
              product={product}
              isSaving={isSaving}
              onSubmit={handleSubmit}
              onSkip={next}
            />
          )}
        </Stack>
      </Container>

      <Snackbar
        open={toast !== null}
        autoHideDuration={2500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast(null)}
          severity={toast?.severity ?? "success"}
          variant="filled"
          sx={{ width: "100%", fontWeight: 700 }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
