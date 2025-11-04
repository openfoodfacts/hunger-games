import * as React from "react";
import { Link } from "react-router";

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

import Loader from "../loader";

import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  CORRECT_INSIGHT,
  WRONG_INSIGHT,
  SKIPPED_INSIGHT,
  OFF_DOMAIN,
} from "../../const";
import { DEFAULT_FILTER_STATE } from "../../components/QuestionFilter/const";
import {
  filterStateSelector,
  isLoadingSelector,
  updateFilter,
  answerQuestion as answerQuestionAction,
} from "./store";
import { useMatomoTrackAnswerQuestion } from "../../hooks/matomoEvents";
import {
  getFullSizeImage,
  getValueTagExamplesURL,
  getValueTagQuestionsURL,
  getNbOfQuestionForValue,
} from "./utils";

import { getShortcuts } from "../../l10n-shortcuts";
import { useFilterSearch } from "../../components/QuestionFilter/useFilterSearch";
import CroppedLogo from "../../components/CroppedLogo";
import ZoomableImage from "../../components/ZoomableImage";

const usePotentialQuestionNumber = (filterState, question) => {
  const [nbOfPotentialQuestion, setNbOfPotentialQuestions] =
    React.useState(null);

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

  return nbOfPotentialQuestion;
};

const useKeyboardShortcuts = (question, answerQuestion) => {
  const shortcuts = getShortcuts();

  React.useEffect(() => {
    function handleShortCut(event) {
      const preventShortCut = event.target.tagName.toUpperCase() === "INPUT";
      if (question?.insight_id && !preventShortCut) {
        switch (event.key) {
          case shortcuts.skip:
            answerQuestion({
              value: SKIPPED_INSIGHT,
              insight_id: question.insight_id,
            });
            break;
          case shortcuts.yes:
            answerQuestion({
              value: CORRECT_INSIGHT,
              insight_id: question.insight_id,
            });
            break;
          case shortcuts.no:
            answerQuestion({
              value: WRONG_INSIGHT,
              insight_id: question.insight_id,
            });
            break;
          default:
            break;
        }
      }
    }

    window.addEventListener("keydown", handleShortCut);
    return () => window.removeEventListener("keydown", handleShortCut);
  }, [
    question?.insight_id,
    answerQuestion,
    shortcuts.skip,
    shortcuts.yes,
    shortcuts.no,
  ]);

  return shortcuts;
};
const QuestionDisplay = ({ question, productData }) => {
  const { t } = useTranslation();

  const { answerQuestions: matomoTrackAnswerQuestions } =
    useMatomoTrackAnswerQuestion();
  const filterState = useSelector(filterStateSelector);
  const isLoading = useSelector(isLoadingSelector);
  const dispatch = useDispatch();

  const [, setSearchParams] = useFilterSearch();

  const updateSearchParams = (newParams) => {
    setSearchParams(newParams);
    dispatch(updateFilter(newParams));
  };

  const resetFilters = () => {
    updateSearchParams(DEFAULT_FILTER_STATE);
  };

  const answerQuestion = React.useCallback(
    ({ insight_id, value }) => {
      dispatch(answerQuestionAction({ insight_id, value }));
      matomoTrackAnswerQuestions(value);
    },
    [dispatch, matomoTrackAnswerQuestions],
  );

  const valueTagQuestionsURL = getValueTagQuestionsURL(filterState, question);
  const valueTagExamplesURL = getValueTagExamplesURL(question);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const nbOfPotentialQuestion = usePotentialQuestionNumber(
    filterState,
    question,
  );
  const shortcuts = useKeyboardShortcuts(question, answerQuestion);

  if (question === null) {
    if (isLoading) {
      return (
        <Box sx={{ width: "100%", textAlign: "center", py: 10, m: 0 }}>
          <Typography variant="subtitle1">
            {t("questions.please_wait_while_we_fetch_the_question")}
          </Typography>
          <br />
          <Loader />
        </Box>
      );
    }
    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <p>{t("questions.no_questions_remaining")}</p>
        <Button size="small" variant="contained" onClick={resetFilters}>
          {t("questions.reset_filters")}
        </Button>
      </Stack>
    );
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
            `https://static.${OFF_DOMAIN}/images/image-placeholder.png`
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
              insight_id: question?.insight_id,
            })
          }
          color="error"
          variant="contained"
          size="large"
          sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
        >
          <DeleteIcon />
          {t("questions.no")} ({shortcuts.no})
        </Button>
        <Button
          onClick={() =>
            answerQuestion({
              value: CORRECT_INSIGHT,
              insight_id: question?.insight_id,
            })
          }
          startIcon={<DoneIcon />}
          color="success"
          variant="contained"
          size="large"
          sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
        >
          {t("questions.yes")} ({shortcuts.yes})
        </Button>
      </Stack>
      <Button
        onClick={() =>
          answerQuestion({
            value: SKIPPED_INSIGHT,
            insight_id: question?.insight_id,
          })
        }
        color="secondary"
        variant="contained"
        size="medium"
        autoFocus
        sx={{ py: "1rem" }}
      >
        {t("questions.skip")} ({shortcuts.skip})
      </Button>
    </Stack>
  );
};
export default QuestionDisplay;
