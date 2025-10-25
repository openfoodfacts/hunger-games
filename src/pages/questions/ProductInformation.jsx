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
import { useTranslation } from "react-i18next";
import {
  NO_QUESTION_LEFT,
  SKIPPED_INSIGHT,
  CORRECT_INSIGHT,
  WRONG_INSIGHT,
} from "../../const";
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
import ZoomableImage from "../../components/ZoomableImage";
import robotoff from "../../robotoff";
import {
  ADDITIONAL_INFO_TRANSLATION,
  getImageId,
  getImagesUrls,
  useOtherQuestions,
  useFlagImage,
} from "./utils";
import { useTheme } from "@mui/material/styles";


const ProductInformation = (props) => {
  const { question, productData } = props;
  const { t } = useTranslation();
  const isDevMode = getIsDevMode();

  const [hideImages, setHideImages] = React.useState(getHideImages);
  const [devCustomization] = React.useState(
    () => getPageCustomization().questionPage,
  );
  const [flagged, flagImage, deleteFlagImage] = useFlagImage(question?.barcode);
  const theme = useTheme();

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

        isDevMode && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h5">
              {t("questions.other_questions")}
            </Typography>

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
                          answer === WRONG_INSIGHT ||
                          answer === SKIPPED_INSIGHT
                        ) {
                          robotoff.annotate(otherQuestion?.insight_id, answer);
                          setOtherQuestionsState((prev) => ({
                            ...prev,
                            questions: prev.questions.filter(
                              (q) =>
                                q?.insight_id !== otherQuestion?.insight_id,
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
                          pendingAnswers[otherQuestion?.insight_id],
                        )
                      }
                      variant="contained"
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      {t("questions.send")}
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
            console.log(ADDITIONAL_INFO_TRANSLATION[infoKey]);
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
