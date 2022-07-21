import * as React from "react";
import { Link } from "react-router-dom";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinkIcon from "@mui/icons-material/Link";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import MuiLink from "@mui/material/Link";

import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

import { useTranslation } from "react-i18next";
import { NO_QUESTION_LEFT, OFF_URL } from "../../const";
import { reformatValueTag } from "../../utils";

// const getFullSizeImage = (src) => {
//   if (!src) {
//     return "https://static.openfoodfacts.org/images/image-placeholder.png";
//   }
//   const needsFull = /\/[a-z_]+.[0-9]*.400.jpg$/gm.test(src);

//   if (needsFull) {
//     return src.replace("400.jpg", "full.jpg");
//   }
//   return src.replace("400.jpg", "jpg");
// };

const getValueTagQuestionsURL = (question) => {
  if (
    question !== null &&
    question !== NO_QUESTION_LEFT &&
    question.value_tag
  ) {
    const urlParams = new URLSearchParams();
    urlParams.append("type", question.insight_type);
    urlParams.append("value_tag", reformatValueTag(question.value_tag));
    return `/questions?${urlParams.toString()}`;
  }
  return null;
};
const getValueTagExamplesURL = (question) => {
  if (
    question !== null &&
    question !== NO_QUESTION_LEFT &&
    question.value_tag &&
    question.insight_type
  ) {
    return `${OFF_URL}/${question.insight_type}/${reformatValueTag(
      question.value_tag
    )}`;
  }
  return "";
};

const QuestionDisplay = ({ question, answerQuestion, resetFilters }) => {
  const { t } = useTranslation();
  const valueTagQuestionsURL = getValueTagQuestionsURL(question);
  const valueTagExamplesURL = getValueTagExamplesURL(question);

  React.useEffect(() => {

    function handleShortCut(event) {
      const targetId = event.target.id

      if (question && targetId !== ':r5:' && targetId !== 'free-solo-demo') {
        switch (event.keyCode) {
          case 75:
            answerQuestion({ value: -1, insightId: question.insight_id });
            break;
          case 79:
            answerQuestion({ value: 1, insightId: question.insight_id });
            break;
          case 78:
            answerQuestion({ value: 0, insightId: question.insight_id });
            break;
          default:
            break;
        }
      }}

    window.addEventListener( 'keydown', handleShortCut)
    return () =>  window.removeEventListener('keydown', handleShortCut)
  }, [question, answerQuestion])

  if (question === NO_QUESTION_LEFT) {
    return (
      <Stack direction="row" alignItems="center" spacing={1}>
        <p>{t("questions.no_questions_remaining")}</p>
        <Button size="small" variant="contained" onClick={resetFilters}>
          Reset filters
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
      <Typography>{question?.question}</Typography>
      {valueTagQuestionsURL && (
        <Button
          component={Link}
          to={valueTagQuestionsURL}
          endIcon={<LinkIcon />}
        >
          {question.value}
        </Button>
      )}
      {valueTagExamplesURL && (
        <MuiLink
          variant="body2"
          href={valueTagExamplesURL}
          target="_blank"
          rel="noreferrer"
          sx={{ mb: 2 }}
        >
          <div>{`${t("questions.see_examples")} ${question.insight_type}`}</div>
        </MuiLink>
      )}
      <Divider />
      <Box flexGrow={1} flexShrink={1} sx={{ height: 0, marginBottom: 1 }}>
        <Zoom wrapStyle={{ height: "100%" }}>
          <img
            // TODO: use getFullSizeImage when the zoom is activated
            // src={getFullSizeImage(question.source_image_url)}
            src={
              question.source_image_url ||
              "https://static.openfoodfacts.org/images/image-placeholder.png"
            }
            alt=""
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        </Zoom>
      </Box>
      <Stack
        direction="row"
        justifyContent="center"
        flexWrap="wrap"
        gap={'.9em'}

      >
        <Button
          onClick={() =>
            answerQuestion({ value: 0, insightId: question.insight_id })
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
            answerQuestion({ value: 1, insightId: question.insight_id })
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
          answerQuestion({ value: -1, insightId: question.insight_id })
        }
        color="secondary"
        variant="contained"
        size="medium"
        autoFocus
      >
        {t("questions.skip")} (k)
      </Button>
    </Stack>
  );
};
export default QuestionDisplay;
