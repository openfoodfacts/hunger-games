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
import { useTranslation } from "react-i18next";
import { NO_QUESTION_LEFT } from "../../const";
import offService from "../../off";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import {
  localSettings,
  localSettingsKeys,
  getHideImages,
  getPageCustomization,
  getIsDevMode,
} from "../../localeStorageManager";
import DebugQuestion from "./DebugQuestion";
import ProductOtherQuestions from "./ProductOtherQuestions";
import ZoomableImage from "../../components/ZoomableImage";
import {
  ADDITIONAL_INFO_TRANSLATION,
  getImageId,
  getImagesUrls,
  useFlagImage,
} from "./utils";
import useQuestions from "../../hooks/useQuestions";
import { useProductData } from "../../hooks/useProduct";

const ProductInformation = () => {
  const { t } = useTranslation();
  const isDevMode = getIsDevMode();

  const [hideImages, setHideImages] = React.useState(getHideImages);
  const [devCustomization] = React.useState(
    () => getPageCustomization().questionPage,
  );

  const { question } = useQuestions();
  const { data: productData } = useProductData(question?.barcode);

  const [flagged, flagImage, deleteFlagImage] = useFlagImage(question?.barcode);

  const handleHideImages = (event) => {
    setHideImages(event.target.checked);
    localSettings.update(localSettingsKeys.hideImages, event.target.checked);
  };

  if (!question || question.insight_id === NO_QUESTION_LEFT) {
    return null;
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
      <Button
        size="small"
        component={Link}
        target="_blank"
        href={offService.getLogoCropsByBarcodeUrl(question.barcode)}
        variant="contained"
        startIcon={<EditIcon />}
        sx={{ ml: 2, minWidth: 150 }}
      >
        {t("insights.view_crops_for_this_product")}
      </Button>
      {
        /* Other questions */

        true && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h5">
              {t("questions.other_questions")}
            </Typography>
            <ProductOtherQuestions question={question} />
          </>
        )
      }
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
              <ZoomableImage
                src={src}
                imageProps={{
                  loading: "lazy",
                  style: { maxWidth: 300, maxHeight: 300 },
                }}
              />
              {flagged.includes(getImageId(src)) ? (
                <Tooltip title={t("questions.unflag")}>
                  <IconButton
                    onClick={() => deleteFlagImage(src, question.barcode)}
                  >
                    <FlagIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title={t("questions.flag")}>
                  <IconButton onClick={() => flagImage(src, question.barcode)}>
                    <OutlinedFlagIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Grid>
          ))}
        </Grid>
      )}

      {/* Remaining info */}
      <Divider />

      <Table size="small">
        <TableBody
          sx={{
            " td, th": { border: "none" },
            th: { verticalAlign: "top", pr: 0 },
          }}
        >
          {Object.keys(ADDITIONAL_INFO_TRANSLATION).map((infoKey) => {
            const { i18nKey, translatedKey, getLink } =
              ADDITIONAL_INFO_TRANSLATION[infoKey];

            const value =
              (translatedKey && productData?.[translatedKey]) ??
              productData?.[infoKey] ??
              "?";

            return (
              <TableRow key={infoKey}>
                <TableCell component="th" scope="row">
                  {t(`questions.${i18nKey}`)}
                </TableCell>
                {Array.isArray(value) ? (
                  <TableCell>
                    {getLink
                      ? value.map((name, index) => (
                          <React.Fragment key={name}>
                            <a
                              href={getLink(name)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {name}
                            </a>
                            {index < value.length - 1 ? ", " : ""}
                          </React.Fragment>
                        ))
                      : value.join(", ")}
                  </TableCell>
                ) : (
                  <TableCell>{value}</TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {isDevMode && devCustomization.showDebug && (
        <DebugQuestion insightId={question.insight_id} />
      )}
      <Divider />
    </Box>
  );
};
export default ProductInformation;
