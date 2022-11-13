import * as React from "react";
import { Link } from "react-router-dom";

import Button from "@mui/material/Button";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinkIcon from "@mui/icons-material/Link";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import MuiLink from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import { useTranslation } from "react-i18next";
import {
  NO_QUESTION_LEFT,
  OFF_URL,
  CORRECT_INSIGHT,
  WRONG_INSIGHT,
  SKIPPED_INSIGHT,
} from "../../const";
import { reformatValueTag } from "../../utils";
import robotoff from "../../robotoff";
import { getQuestionSearchParams } from "../../components/QuestionFilter/useFilterSearch";
import CroppedLogo from "../../components/CroppedLogo";
import ZoomableImage from "../../components/ZoomableImage";

const getFullSizeImage = (src) => {
  if (!src) {
    return "https://static.openfoodfacts.org/images/image-placeholder.png";
  }
  const needsFull = /\/[a-z_]+.[0-9]*.400.jpg$/gm.test(src);

  if (needsFull) {
    return src.replace("400.jpg", "full.jpg");
  }
  return src.replace("400.jpg", "jpg");
};

const getValueTagQuestionsURL = (filterState, question) => {
  if (
    question !== null &&
    question &&
    question?.insight_id !== NO_QUESTION_LEFT &&
    question.value_tag
  ) {
    const urlParams = new URLSearchParams();
    urlParams.append("type", question.insight_type);
    urlParams.append("value_tag", reformatValueTag(question.value_tag));
    return `/questions?${getQuestionSearchParams({
      ...filterState,
      insightType: question.insight_type,
      valueTag: question.value_tag,
    })}`;
  }
  return null;
};

const getValueTagExamplesURL = (question) => {
  if (
    question !== null &&
    question?.insight_id !== NO_QUESTION_LEFT &&
    question.value_tag &&
    question.insight_type
  ) {
    return `${OFF_URL}/${question.insight_type}/${reformatValueTag(
      question.value_tag
    )}`;
  }
  return "";
};

const getNbOfQuestionForValue = async (filterState) => {
  const { data: dataFetched } = await robotoff.questions(filterState, 1);
  return dataFetched.count;
};

const QuestionDisplay = ({
  question,
  answerQuestion,
  resetFilters,
  filterState,
  productData,
}) => {
  const { t } = useTranslation();
  const valueTagQuestionsURL = getValueTagQuestionsURL(filterState, question);
  const valueTagExamplesURL = getValueTagExamplesURL(question);
  const [nbOfPotentialQuestion, setNbOfPotentialQuestions] =
    React.useState(null);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  React.useEffect(() => {
    if (
      filterState.valueTag ||
      !question?.insight_type ||
      !question?.value_tag
    ) {
      // value is already in the filter so it's a useless information
      setNbOfPotentialQuestions(null);
      return;
    }
    let validRequest = true;

    getNbOfQuestionForValue({
      ...filterState,
      insightType: question?.insight_type,
      valueTag: question?.value_tag,
    })
      .then((nbQuestions) => {
        if (validRequest) {
          setNbOfPotentialQuestions(nbQuestions);
        }
      })
      .catch(() => {});

    return () => {
      validRequest = false;
    };
  }, [filterState, question?.insight_type, question?.value_tag]);

  React.useEffect(() => {
    function handleShortCut(event) {
      const preventShortCut = event.target.tagName.toUpperCase() === "INPUT";
      if (question?.insight_id && !preventShortCut) {
        switch (event.keyCode) {
          case 75: // K
            answerQuestion({
              value: SKIPPED_INSIGHT,
              insightId: question.insight_id,
            });
            break;
          case 79: // O
            answerQuestion({
              value: CORRECT_INSIGHT,
              insightId: question.insight_id,
            });
            break;
          case 78: // N
            answerQuestion({
              value: WRONG_INSIGHT,
              insightId: question.insight_id,
            });
            break;
          default:
            break;
        }
      }
    }

    window.addEventListener("keydown", handleShortCut);
    return () => window.removeEventListener("keydown", handleShortCut);
  }, [question?.insight_id, answerQuestion]);

  if (question?.insight_id === NO_QUESTION_LEFT) {
    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <p>{t("questions.no_questions_remaining")}</p>
        <Button size="small" variant="contained" onClick={resetFilters}>
          {t("questions.reset_filters")}
        </Button>
      </Stack>
    );
  }
  if (question === null) {
    return <p>loading</p>;
  }
  return (
    <Stack
      sx={{
        textAlign: "center",
        flexGrow: 1,
        flexBasis: 0,
        flexShrink: 1,
      }}
    >
      <Stack
        sx={{
          alignItems: "center",
        }}
      >
        <Typography>{question?.question}</Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {valueTagQuestionsURL ? (
            <Badge
              sx={{ marginY: 1 }}
              badgeContent={nbOfPotentialQuestion}
              color="primary"
            >
              <Button
                sx={{ paddingX: 4 }}
                component={Link}
                to={valueTagQuestionsURL}
                endIcon={<LinkIcon />}
                variant="outlined"
              >
                {question.value}
              </Button>
            </Badge>
          ) : (
            <Button sx={{ paddingX: 4, marginY: 1 }} variant="outlined">
              {question.value}
            </Button>
          )}
          {question.ref_image_url && (
            <img
              alt="logo example"
              src={question.ref_image_url}
              style={{ height: "36px", marginLeft: 8 }}
            />
          )}
        </Box>
        {valueTagExamplesURL && (
          <MuiLink
            variant="body2"
            href={valueTagExamplesURL}
            target="_blank"
            rel="noreferrer"
            sx={{ mb: 2, display: { xs: "none", md: "inherit" } }}
          >
            <div>{`${t("questions.see_examples")} ${
              question.insight_type
            }`}</div>
          </MuiLink>
        )}
      </Stack>
      <Divider />
      <Box
        flexGrow={1}
        flexShrink={1}
        sx={{
          height: `calc(100vh - ${isDesktop ? 461 : 445}px)`,
          marginBottom: 1,
          position: "relative",
        }}
      >
        <ZoomableImage
          src={
            question.source_image_url ||
            "https://static.openfoodfacts.org/images/image-placeholder.png"
          }
          srcFull={getFullSizeImage(question.source_image_url)}
          alt=""
          style={{
            height: isDesktop ? "100%" : "calc(100% - 24px)",
            display: "inline-block",
          }}
          imageProps={{
            style: {
              maxHeight: "100%",
              maxWidth: "100%",
            },
          }}
        />
        {isDesktop ? (
          <CroppedLogo
            insightId={question.insight_id}
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              maxHeight: "75px",
              maxWidth: "150px",
            }}
          />
        ) : (
          <Typography
            sx={{
              position: "absolute",
              bottom: 0,
            }}
          >
            {productData?.productName}
          </Typography>
        )}
      </Box>
      <Stack direction="row" justifyContent="center" spacing={2} sx={{ mb: 1 }}>
        <Button
          onClick={() =>
            answerQuestion({
              value: WRONG_INSIGHT,
              insightId: question?.insight_id,
            })
          }
          color="error"
          variant="contained"
          size="large"
          sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
        >
          <DeleteIcon />
          {t("questions.no")} (n)
        </Button>
        <Button
          onClick={() =>
            answerQuestion({
              value: CORRECT_INSIGHT,
              insightId: question?.insight_id,
            })
          }
          startIcon={<DoneIcon />}
          color="success"
          variant="contained"
          size="large"
          sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
        >
          {t("questions.yes")} (o)
        </Button>
      </Stack>
      <Button
        onClick={() =>
          answerQuestion({
            value: SKIPPED_INSIGHT,
            insightId: question?.insight_id,
          })
        }
        color="secondary"
        variant="contained"
        size="medium"
        autoFocus
        sx={{ py: "1rem" }}
      >
        {t("questions.skip")} (k)
      </Button>
    </Stack>
  );
};
export default QuestionDisplay;
