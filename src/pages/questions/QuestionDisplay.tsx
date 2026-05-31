import * as React from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";

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
import useMediaQuery from "@mui/material/useMediaQuery";

import Loader from "../loader";
import CroppedLogo from "../../components/CroppedLogo";
import ZoomableImage from "../../components/ZoomableImage";
import { SimilarQuestions } from "./SimilarQuestions";

import type { QuestionInterface, FilterState } from "../../robotoff";

import useQuestions from "../../hooks/useQuestions";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import { useFilterState } from "../../hooks/useFilterState";
import { useProductData } from "../../hooks/useProduct";
import { CORRECT_INSIGHT, WRONG_INSIGHT, SKIPPED_INSIGHT } from "../../const";
import { getValueTagQuestionsURL } from "./utils/getValueTagQuestionsURL";
import {
  getFullSizeImage,
  getValueTagExamplesURL,
  getNbOfQuestionForValue,
} from "./utils";

const usePotentialQuestionNumber = (
  filterState: FilterState,
  question: QuestionInterface | null,
) => {
  const [nbOfPotentialQuestion, setNbOfPotentialQuestions] = React.useState<
    number | null
  >(null);

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

type AnswerType =
  | typeof WRONG_INSIGHT
  | typeof CORRECT_INSIGHT
  | typeof SKIPPED_INSIGHT;

/**
 * Layout containing the three buttons to answer the question (yes, no, skip)
 * and their associated keyboard shortcuts.
 */
function QuestionAnswerButtons({
  shortcuts,
  onAnswerQuestion,
}: {
  shortcuts: ReturnType<typeof useKeyboardShortcuts>;
  onAnswerQuestion: (answer: AnswerType) => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <Stack direction="row" justifyContent="center" spacing={2} sx={{ mb: 1 }}>
        <Button
          onClick={() => onAnswerQuestion(WRONG_INSIGHT)}
          color="error"
          variant="contained"
          size="large"
          sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
        >
          <DeleteIcon />
          {t("questions.no")} ({shortcuts.no})
        </Button>
        <Button
          onClick={() => onAnswerQuestion(CORRECT_INSIGHT)}
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
        onClick={() => onAnswerQuestion(SKIPPED_INSIGHT)}
        color="secondary"
        variant="contained"
        size="medium"
        autoFocus
        sx={{ py: "1rem" }}
      >
        {t("questions.skip")} ({shortcuts.skip})
      </Button>
    </>
  );
}

/**
 * Component to display an image with a loader while the image is loading.
 */
function QuestionImage({
  src,
  alt = "Question Image",
}: {
  src: string;
  alt?: string;
}) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [loadedSrc, setLoadedSrc] = React.useState<string | null>(null);

  const imageHeight = isDesktop ? "100%" : "calc(100% - 24px)";
  const loaded = loadedSrc === src;

  return (
    <>
      {!loaded && (
        <Box
          sx={{
            height: imageHeight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader />
        </Box>
      )}
      <ZoomableImage
        src={src}
        srcFull={getFullSizeImage(src)}
        onLoad={() => setLoadedSrc(src)}
        style={{
          height: imageHeight,
          display: loaded ? "inline-block" : "none",
          zIndex: 9,
        }}
        imageProps={{
          style: { maxHeight: "100%", maxWidth: "100%" },
          alt: alt,
        }}
      />
    </>
  );
}

export function QuestionStatusMessage({
  message,
  showLoader = false,
}: {
  message: string;
  showLoader?: boolean;
}) {
  return (
    <Box sx={{ width: "100%", textAlign: "center", py: 10 }}>
      <Typography variant="subtitle1">{message}</Typography>
      {showLoader && (
        <>
          <br />
          <Loader />
        </>
      )}
    </Box>
  );
}

export default function QuestionDisplay() {
  const { t } = useTranslation();

  const [filterState, setFilterState] = useFilterState();
  const { question, status, answerQuestion } = useQuestions(filterState);

  const { data: productData } = useProductData(question?.barcode);

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
    if (status === "pending") {
      return (
        <QuestionStatusMessage
          message={t("questions.please_wait_while_we_fetch_the_question")}
          showLoader
        />
      );
    }

    if (status === "error") {
      return (
        <QuestionStatusMessage
          message={t("questions.an_error_occurred")}
          showLoader={false}
        />
      );
    }

    return (
      <SimilarQuestions
        filterState={filterState}
        setFilterState={setFilterState}
      />
    );
  }

  return (
    <Stack
      sx={{ textAlign: "center", flexGrow: 1, flexBasis: 0, flexShrink: 1 }}
    >
      {/* Header */}
      <Stack sx={{ alignItems: "center" }}>
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

      {/* Image display */}
      <Box
        flexGrow={1}
        flexShrink={1}
        sx={{
          height: `calc(100vh - ${isDesktop ? 461 : 445}px)`,
          marginBottom: 1,
          position: "relative",
        }}
      >
        {question.source_image_url ? (
          <QuestionImage
            key={question.source_image_url}
            src={question.source_image_url}
          />
        ) : (
          <Typography sx={{ marginTop: 20 }}>Image not found</Typography>
        )}
        {isDesktop ? (
          <CroppedLogo
            key={question.insight_id}
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
          <Typography sx={{ position: "absolute", bottom: 0 }}>
            {productData?.product_name}
          </Typography>
        )}
      </Box>

      {/* Footer */}
      <QuestionAnswerButtons
        shortcuts={shortcuts}
        onAnswerQuestion={(answer) => answerQuestion({ question, answer })}
      />
    </Stack>
  );
}
