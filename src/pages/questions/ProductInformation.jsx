import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import FlagIcon from "@mui/icons-material/Flag";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useTranslation } from "react-i18next";
import { NO_QUESTION_LEFT } from "../../const";
import offService from "../../off";
import { updateFlagImage, removeFlagImage } from "../../utils";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import {
  localSettings,
  localSettingsKeys,
  getHideImages,
} from "../../localeStorageManager";

const getImagesUrls = (images, barcode) => {
  if (!images || !barcode) {
    return [];
  }
  const formattedCode = offService.getFormatedBarcode(barcode);
  const rootImageUrl = offService.getImageUrl(formattedCode);
  return Object.keys(images)
    .filter((key) => !isNaN(key))
    .map((key) => `${rootImageUrl}/${key}.jpg`);
};

const ProductInformation = ({ question }) => {
  const { t } = useTranslation();
  const [productData, setProductData] = React.useState({});
  const [hideImages, setHideImages] = React.useState(getHideImages);
  const [flagged, setFlagged] = React.useState([]);

  const flagImage = (src, barcode, index) => {
    const response = updateFlagImage(barcode, src);
    const updatedImageArray = [...flagged];
    updatedImageArray[index] = true;
    setFlagged(updatedImageArray);
  };

  const deleteFlagImage = (src, barcode, index) => {
    const response = removeFlagImage(barcode, src);
    const updatedImageArray = [...flagged];
    updatedImageArray[index] = false;
    setFlagged(updatedImageArray);
  };

  React.useEffect(() => {
    if (!question?.barcode) {
      return;
    }
    let isStillValid = true;
    setProductData({
      code: question.barcode,
      isLoading: true,
    });
    offService.getProduct(question.barcode).then((result) => {
      if (!isStillValid) {
        return;
      }
      const product = result.data.product;
      setProductData({
        code: question.barcode,
        productName: product.product_name || "",
        brands: product.brands || "",
        ingredientsText: product.ingredients_text || "",
        countriesTags: product.countries_tags || [],
        images: product.images || {},
        isLoading: false,
      });
    });
    return () => {
      isStillValid = false;
    };
  }, [question?.barcode]);

  const handleHideImages = (event) => {
    setHideImages(event.target.checked);
    localSettings.update(localSettingsKeys.hideImages, event.target.checked);
  };

  if (!question || question === NO_QUESTION_LEFT) {
    return null;
  }
  if (productData.isLoading) {
    return <p>loading...</p>;
  }

  return (
    <Box>
      {/* Main information about the product */}
      <Typography>{productData?.productName}</Typography>
      <Button
        size="small"
        component={Link}
        target="_blank"
        href={offService.getProductUrl(question.barcode)}
        variant="outlined"
        startIcon={<VisibilityIcon />}
        sx={{ minWidth: 150 }}
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
        sx={{ ml: 2, minWidth: 150 }}
      >
        {t("questions.edit")}
      </Button>
      <Divider sx={{ my: 1 }} />

      {/* Image display section */}
      <FormControlLabel
        control={<Checkbox checked={hideImages} onChange={handleHideImages} />}
        label={t("questions.hide_images")}
        labelPlacement="end"
      />
      {!hideImages && productData?.images && (
        <Grid container rowSpacing={1.5} spacing={1}>
          {getImagesUrls(productData.images, question.barcode).map((src) => (
            <Grid
              item
              key={src}
              style={{ display: "inline-flex", alignItems: "flex-start" }}
            >
              <Zoom>
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  style={{ maxWidth: 300, maxHeight: 300 }}
                />
              </Zoom>
              {flagged[src[src.length - 5]] ? (
                <Tooltip title="Unflag Image">
                  <IconButton>
                    <FlagIcon
                      onClick={() =>
                        deleteFlagImage(
                          src,
                          question.barcode,
                          src[src.length - 5]
                        )
                      }
                    />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Flag Image">
                  <IconButton>
                    <OutlinedFlagIcon
                      onClick={() =>
                        flagImage(src, question.barcode, src[src.length - 5])
                      }
                    />
                  </IconButton>
                </Tooltip>
              )}
            </Grid>
          ))}
        </Grid>
      )}

      {/* Remaining info */}
      <Divider />

      <Table size="small" aria-label="a dense table">
        <TableBody
          sx={{
            " td, th": { border: "none" },
            th: { verticalAlign: "top", pr: 0 },
          }}
        >
          <TableRow>
            <TableCell component="th" scope="row">
              {t("questions.brands")}
            </TableCell>
            <TableCell>{productData?.brands}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell component="th" scope="row">
              {t("questions.ingredients")}
            </TableCell>
            <TableCell>{productData?.ingredientsText}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell component="th" scope="row">
              {t("questions.countries")}
            </TableCell>
            <TableCell>
              {!productData?.countriesTags
                ? null
                : `${productData.countriesTags.join(", ")}.`}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Divider />
    </Box>
  );
};
export default ProductInformation;
