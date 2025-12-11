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
import {
  CORRECT_INSIGHT,
  WRONG_INSIGHT,
  SKIPPED_INSIGHT,
  OFF_DOMAIN,
} from "../../const";
import {
  getFullSizeImage,
  getValueTagExamplesURL,
  getNbOfQuestionForValue,
} from "./utils";
import { getValueTagQuestionsURL } from "./utils/getValueTagQuestionsURL";
import useQuestions, { AnswerQuestionParams } from "../../hooks/useQuestions";

import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import CroppedLogo from "../../components/CroppedLogo";
import ZoomableImage from "../../components/ZoomableImage";
import { useFilterState, FilterParams } from "../../hooks/useFilterState";
import { QuestionInterface } from "../../robotoff";
import { useProductData } from "../../hooks/useProduct";
import getTaxonomy from "../../offTaxonomy";
import { useQuery } from "@tanstack/react-query";
import { SimilarQuestions } from "./SimilarQuestions";

const usePotentialQuestionNumber = (
  filterState: FilterParams,
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
  const [imageLoaded, setImageLoaded] = React.useState(false);
  React.useEffect(() => {
  setImageLoaded(false); 
}, [question?.source_image_url]);
  const shortcuts = useKeyboardShortcuts(question, answerQuestion);

  if (question === null) {
    if (status === "pending") {
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
    if (status === "error") {
      return (
        <Box sx={{ width: "100%", textAlign: "center", py: 10, m: 0 }}>
          <Typography variant="subtitle1">
            {t("questions.an_error_occurred")}
          </Typography>
        </Box>
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
          <>
          {!imageLoaded && (
    <Box
      sx={{
        height: isDesktop ? "100%" : "calc(100% - 24px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Loader />
    </Box>
  )}
          <ZoomableImage
            src={question.source_image_url}
            srcFull={getFullSizeImage(question.source_image_url)}
            alt=""
            onLoad={() => setImageLoaded(true)}
            style={{
              height: isDesktop ? "100%" : "calc(100% - 24px)",
              display: imageLoaded ?"inline-block": "none",
            }}
            imageProps={{ style: { maxHeight: "100%", maxWidth: "100%" } }}
          />
          </>
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
      <Stack direction="row" justifyContent="center" spacing={2} sx={{ mb: 1 }}>
        <Button
          onClick={() =>
            answerQuestion({
              answer: WRONG_INSIGHT,
              question,
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
              answer: CORRECT_INSIGHT,
              question,
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
            answer: SKIPPED_INSIGHT,
            question,
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
}
