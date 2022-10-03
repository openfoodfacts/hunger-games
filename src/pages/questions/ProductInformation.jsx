import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
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
import { NO_QUESTION_LEFT, SKIPPED_INSIGHT } from "../../const";
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
import { CORRECT_INSIGHT, WRONG_INSIGHT } from "../../const";
import externalApi from "../../externalApi";
import DebugQuestion from "./DebugQuestion";
import robotoff from "../../robotoff";

// src looks like: "https://static.openfoodfacts.org/images/products/004/900/053/2258/1.jpg"
const getImageId = (src) => {
  const file = src.split("/").at(-1);
  const imageId = file.replace(/\..+$/, "");
  return Number(imageId);
};

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

// Other questions fetching
const useOtherQuestions = (code, insight_id) => {
  const [otherQuestionsState, setOtherQuestionsState] = React.useState({
    questions: [],
    isLoading: true,
  });
  React.useEffect(() => {
    if (!code) {
      return;
    }
    let isStillValid = true;
    setOtherQuestionsState({
      questions: [],
      isLoading: true,
    });
    robotoff.questionsByProductCode(code).then((result) => {
      if (!isStillValid) {
        return;
      }
      const newQuestions = result?.data?.questions ?? [];
      setOtherQuestionsState({
        questions: newQuestions.filter((q) => q?.insight_id !== insight_id),
        isLoading: false,
      });
    });
    return () => {
      isStillValid = false;
    };
  }, [code, insight_id]);

  const [pendingAnswers, setPendingAnswers] = React.useState({});
  return [
    otherQuestionsState,
    setOtherQuestionsState,
    pendingAnswers,
    setPendingAnswers,
  ];
};

const ProductInformation = ({ question }) => {
  const { t } = useTranslation();
  const isDevMode = getIsDevMode();

  const [productData, setProductData] = React.useState({});
  const [hideImages, setHideImages] = React.useState(getHideImages);
  const [devCustomization] = React.useState(
    () => getPageCustomization().questionPage
  );
  const [flagged, setFlagged] = React.useState([]);

  const flagImage = (src, barcode) => {
    const imgid = getImageId(src);
    externalApi.addImageFlag({ barcode, imgid, url: src });

    const newFlagged = [...flagged];
    newFlagged.push(imgid);
    setFlagged(newFlagged);
  };

  const deleteFlagImage = (src, barcode) => {
    const imgid = getImageId(src);
    externalApi.removeImageFlag({ barcode, imgid });
    const newFlagged = flagged.filter(
      (flaggedImageId) => flaggedImageId !== imgid
    );
    setFlagged(newFlagged);
  };

  // product data fetching
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
        productName: product?.product_name || "",
        brands: product?.brands || "",
        ingredientsText: product?.ingredients_text || "",
        countriesTags: product?.countries_tags || [],
        images: product?.images || {},
        categories: product?.categories || {},
        isLoading: false,
      });
    });
    return () => {
      isStillValid = false;
    };
  }, [question?.barcode]);

  // Reset flags
  React.useEffect(() => {
    setFlagged([]);
  }, [question?.barcode]);

  const [
    otherQuestionsState,
    setOtherQuestionsState,
    pendingAnswers,
    setPendingAnswers,
  ] = useOtherQuestions(question?.barcode, question?.insight_id);

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
      {
        /* Other questions */

        isDevMode && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h5">Other questions</Typography>

            {otherQuestionsState.isLoading
              ? null
              : otherQuestionsState.questions.map((otherQuestion) => (
                  <Stack
                    direction="row"
                    key={otherQuestion.insight_id}
                    sx={{ mt: 1, alignItems: "flex-start" }}
                  >
                    <Typography key={otherQuestion.insight_id}>
                      {otherQuestion?.question} ({otherQuestion?.value})
                    </Typography>
                    <Button
                      onClick={() => {
                        setPendingAnswers((prev) => ({
                          ...prev,
                          [otherQuestion?.insight_id]:
                            prev[otherQuestion?.insight_id] === CORRECT_INSIGHT
                              ? SKIPPED_INSIGHT
                              : CORRECT_INSIGHT,
                        }));
                      }}
                      color="success"
                      variant={
                        pendingAnswers[otherQuestion?.insight_id] ===
                        CORRECT_INSIGHT
                          ? "contained"
                          : "outlined"
                      }
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      {t("questions.yes")}
                    </Button>
                    <Button
                      onClick={() => {
                        setPendingAnswers((prev) => ({
                          ...prev,
                          [otherQuestion?.insight_id]:
                            prev[otherQuestion?.insight_id] === WRONG_INSIGHT
                              ? SKIPPED_INSIGHT
                              : WRONG_INSIGHT,
                        }));
                      }}
                      color="error"
                      variant={
                        pendingAnswers[otherQuestion?.insight_id] ===
                        WRONG_INSIGHT
                          ? "contained"
                          : "outlined"
                      }
                      size="small"
                    >
                      {t("questions.no")}
                    </Button>
                    <Button
                      onClick={() => {
                        const answer =
                          pendingAnswers[otherQuestion?.insight_id];
                        if (
                          answer === CORRECT_INSIGHT ||
                          answer === WRONG_INSIGHT
                        ) {
                          robotoff.annotate(otherQuestion?.insight_id, answer);
                          setOtherQuestionsState((prev) => ({
                            ...prev,
                            questions: prev.questions.filter(
                              (q) => q?.insight_id !== otherQuestion?.insight_id
                            ),
                          }));
                        }
                        setPendingAnswers((prev) => ({
                          ...prev,
                          [otherQuestion?.insight_id]: WRONG_INSIGHT,
                        }));
                      }}
                      color="secondary"
                      disabled={
                        ![CORRECT_INSIGHT, WRONG_INSIGHT].includes(
                          pendingAnswers[otherQuestion?.insight_id]
                        )
                      }
                      variant="contained"
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      send
                    </Button>
                  </Stack>
                ))}
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
              <Zoom>
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  style={{ maxWidth: 300, maxHeight: 300 }}
                />
              </Zoom>
              {flagged.includes(getImageId(src)) ? (
                <Tooltip title="Unflag the image">
                  <IconButton
                    onClick={() => deleteFlagImage(src, question.barcode)}
                  >
                    <FlagIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Something wrong? Report/flag the image!">
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

          <TableRow>
            <TableCell component="th" scope="row">
              {t("questions.categories")}
            </TableCell>
            <TableCell>
              {!productData?.categories ||
              typeof productData?.categories === "object"
                ? null
                : productData?.categories}
            </TableCell>
          </TableRow>
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
