import * as React from "react";

import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

import DebugQuestion from "./DebugQuestion";
import ProductOtherQuestions from "./ProductOtherQuestions";
import ZoomableImage from "../../components/ZoomableImage";

import { NO_QUESTION_LEFT } from "../../const";
import offService from "../../off";
import {
  localSettings,
  localSettingsKeys,
  getHideImages,
  getPageCustomization,
  getIsDevMode,
} from "../../localeStorageManager";

import { ADDITIONAL_INFO_TRANSLATION, getImagesUrls } from "./utils";
import useQuestions from "../../hooks/useQuestions";
import { useProductData } from "../../hooks/useProduct";
import { Skeleton } from "@mui/material";

const ProductImagesGrid = ({
  images,
  barcode,
}: {
  images: Record<string, { uploaded_t: number }>;
  barcode: string;
}) => {
  const theme = useTheme();
  const imageUrls = getImagesUrls(images, barcode).reverse();

  return (
    <Box
      sx={{
        display: "grid",
        width: "100%",
        gridGap: "30px",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",

        backgroundColor: theme.palette.mode === "dark" ? "#201f1ff5" : "white",
        maxHeight: "32rem",
        overflowY: "scroll",
        ml: "1px",
        mt: "2px",
        pl: "10px",
        py: "10px",
        borderRadius: "10px",
        scrollbarWidth: "thin",
        scrollbarColor:
          theme.palette.mode === "dark" ? "#4e4d4dff #201f1f" : "",
      }}
    >
      {imageUrls.map((src) => (
        <Box key={src.imageUrl}>
          <Box
            sx={{
              width: "100%",
              aspectRatio: "1 / 1",
              overflow: "hidden",
              backgroundColor:
                theme.palette.mode === "dark" ? "#2e2d2d" : "#f5f5f5",
              borderRadius: "4px",
            }}
          >
            <ZoomableImage
              src={src.imageUrl}
              srcFull={src.imageUrlFull}
              style={{ width: "100%", height: "100%" }}
              imageProps={{
                loading: "lazy",
                style: {
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: "2px",
                },
              }}
            />
            {/* {flagged.includes(getImageId(src.imageUrl)) ? (
            <Tooltip title={t("questions.unflag")}>
              <IconButton
                onClick={() =>
                  deleteFlagImage(src.imageUrl, question.barcode)
                }
              >
                <FlagIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title={t("questions.flag")}>
              <IconButton
                onClick={() =>
                  externalApi.addImageFlag({
                    barcode: question.barcode,
                    imgid: getImageId(src.imageUrl),
                  })
                }
              >
                <OutlinedFlagIcon />
              </IconButton>
            </Tooltip>
          )} */}
          </Box>
          <Typography variant="caption">{src.uploaded_t}</Typography>
        </Box>
      ))}
    </Box>
  );
};

const ProductInfoTable = ({
  product,
}: {
  product: Record<string, unknown>;
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  function ProductInfoRow({
    product,
    infoKey,
  }: {
    product: Record<string, unknown>;
    infoKey: string;
  }) {
    const { i18nKey, translatedKey, getLink } =
      ADDITIONAL_INFO_TRANSLATION[infoKey];

    // Try translated key first, then fallback to original key, then "?" if not found
    const value =
      (translatedKey ? product?.[translatedKey] : product?.[infoKey]) ??
      ("?" as unknown);

    return (
      <TableRow>
        <TableCell component="th" scope="row">
          {t(`questions.${i18nKey}`)}
        </TableCell>
        {Array.isArray(value) ? (
          <TableCell
            sx={{
              "& a": {
                color: theme.palette.mode === "dark" ? "white" : "black",
                textDecoration: "none",
                fontWeight: 500,
                "&:hover": { textDecoration: "underline" },
              },
            }}
          >
            {getLink
              ? value.map((name, index) => (
                  <React.Fragment key={name}>
                    <a href={getLink(name)} target="_blank" rel="noreferrer">
                      {name}
                    </a>
                    {index < value.length - 1 ? ", " : ""}
                  </React.Fragment>
                ))
              : value.join(", ")}
          </TableCell>
        ) : typeof value === "string" ? (
          <TableCell>{value}</TableCell>
        ) : (
          <TableCell>JSON: {JSON.stringify(value)}</TableCell>
        )}
      </TableRow>
    );
  }

  return (
    <Table size="small">
      <TableBody
        sx={{
          " td, th": { border: "none" },
          th: { verticalAlign: "top", pr: 0 },
        }}
      >
        {Object.keys(ADDITIONAL_INFO_TRANSLATION).map((infoKey) => {
          return (
            <ProductInfoRow key={infoKey} product={product} infoKey={infoKey} />
          );
        })}
      </TableBody>
    </Table>
  );
};

const ProductInformation = () => {
  const { t } = useTranslation();
  const isDevMode = getIsDevMode();

  // Hide images
  const [hideImages, setHideImages] = React.useState<boolean>(getHideImages);
  const handleHideImages = (
    _: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    setHideImages(checked);
    localSettings.update(localSettingsKeys.hideImages, checked);
  };

  const [devCustomization] = React.useState(
    () => getPageCustomization().questionPage,
  );

  const { question } = useQuestions();
  const { data: productData, isLoading: productLoading } = useProductData(
    question?.barcode,
  );

  if (!question || question.insight_id === NO_QUESTION_LEFT) {
    return null;
  }

  return (
    <Box>
      {/* Main information about the product */}
      <>
        {/* Product name or code */}
        <Typography
          variant="h4"
          gutterBottom
          fontFamily={productData?.product_name ? "inherit" : "monospace"}
        >
          {productLoading ? (
            <Skeleton />
          ) : productData?.product_name ? (
            productData?.product_name
          ) : (
            productData?.code
          )}
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          <Button
            size="small"
            component={Link}
            target="_blank"
            href={offService.getProductUrl(question.barcode)}
            variant="outlined"
            startIcon={<VisibilityIcon />}
          >
            {t("questions.view")}
          </Button>
          <Button
            size="small"
            component={Link}
            target="_blank"
            href={offService.getProductEditUrl(question.barcode)}
            variant="contained"
            startIcon={<EditIcon />}
          >
            {t("questions.edit")}
          </Button>
          <Button
            size="small"
            component={Link}
            target="_blank"
            href={offService.getLogoCropsByBarcodeUrl(question.barcode)}
            variant="contained"
            startIcon={<EditIcon />}
          >
            {t("insights.view_crops_for_this_product")}
          </Button>
        </Box>
      </>

      <Divider sx={{ my: 1 }} />

      {/* Other questions */}
      <>
        <Typography variant="h5" gutterBottom>
          {t("questions.other_questions")}
        </Typography>
        <ProductOtherQuestions question={question} />
      </>

      <Divider sx={{ my: 1 }} />

      {/* Image display section */}
      <>
        <FormControlLabel
          control={
            <Checkbox checked={hideImages} onChange={handleHideImages} />
          }
          label={t("questions.hide_images")}
          labelPlacement="end"
        />
        {!hideImages &&
          (productLoading ? (
            <Skeleton variant="rectangular" width="100%" height={200} />
          ) : !productData?.images ? (
            <Typography variant="body2" color="text.secondary">
              {t("questions.no_images")}
            </Typography>
          ) : (
            <ProductImagesGrid
              images={productData.images}
              barcode={question.barcode}
            />
          ))}
      </>

      <Divider sx={{ my: 1 }} />

      {/* Remaining info */}
      {productLoading ? (
        <Skeleton variant="rectangular" width="100%" height={150} />
      ) : !productData ? (
        <Typography variant="h5" gutterBottom>
          {t("questions.no_additional_info")}
        </Typography>
      ) : (
        <ProductInfoTable product={productData} />
      )}

      {isDevMode && devCustomization.showDebug && (
        <DebugQuestion insightId={question.insight_id} />
      )}

      <Divider sx={{ my: 1 }} />
    </Box>
  );
};

export default ProductInformation;
