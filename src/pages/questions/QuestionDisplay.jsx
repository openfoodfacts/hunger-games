import * as React from "react";
import { Link } from "react-router-dom";

import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinkIcon from "@mui/icons-material/Link";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";

import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

import { useTranslation } from "react-i18next";
import { NO_QUESTION_LEFT, OFF_URL } from "../../const";
import { reformatValueTag } from "../../utils";
import { Box } from "@mui/system";

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

  if (question === NO_QUESTION_LEFT) {
    return (
      <Stack alignItems="center" spacing={2}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems="center"
          spacing={{ xs: 0, sm: 2 }}
        >
          <h2>{t("questions.no_questions_remaining")}</h2>
          <Button size="small" variant="contained" onClick={resetFilters}>
            Reset filters
          </Button>
        </Stack>
        <h1>OR</h1>
        <br />
        <h2 style={{ textAlign: "center" }}>
          Install the app and contribute even more
        </h2>
        <Stack direction="row" spacing={1}>
          <a href="https://apps.apple.com/app/open-food-facts/id588797948">
            <img
              src="https://world.openfoodfacts.org/images/misc/appstore/black/appstore_US.svg"
              alt="Appstore"
              width="140px"
              height="60px"
            />
          </a>
          <a href="https://play.google.com/store/apps/details?id=org.openfoodfacts.scanner&hl=en">
            <img
              src="https://static.openfoodfacts.org/images/misc/google-play-badge-svg-master/img/en_get.svg"
              alt="Appstore"
              width="140px"
              height="60px"
            />
          </a>
        </Stack>
        <Stack direction="row" spacing={1}>
          <a href="https://www.microsoft.com/en-us/p/openfoodfacts/9nblggh0dkqr">
            <img
              src="	https://world.openfoodfacts.org/images/misc/microsoft/English.svg"
              alt="Appstore"
              width="140px"
              height="60px"
            />
          </a>
          <a href="https://world.openfoodfacts.org/files/off.apk">
            <img
              src="https://static.openfoodfacts.org/images/misc/android-apk.svg"
              alt="Android"
              width="140px"
              height="60px"
            />
          </a>
        </Stack>
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
        <a href={valueTagExamplesURL} target="_blank" rel="noreferrer">
          <div>{`${t("questions.see_examples")} ${question.insight_type}`}</div>
        </a>
      )}
      <Divider />
      <Box flexGrow={1} flexShrink={1} sx={{ height: 0, marginBottom: 1 }}>
        <Zoom wrapStyle={{ height: "100%" }}>
          <img
            src={getFullSizeImage(question.source_image_url)}
            alt=""
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        </Zoom>
      </Box>
      <Stack
        direction="row"
        justifyContent="space-around"
        flexWrap="wrap"
        onKeyDown={(event) => {
          switch (event.key) {
            case "k":
              answerQuestion({ value: -1, insightId: question.insight_id });
              break;
            case "o":
              answerQuestion({ value: 1, insightId: question.insight_id });
              break;
            case "n":
              answerQuestion({ value: 0, insightId: question.insight_id });
              break;
            default:
              break;
          }
        }}
      >
        <Button
          onClick={() =>
            answerQuestion({ value: 0, insightId: question.insight_id })
          }
          startIcon={<DeleteIcon />}
          color="error"
          variant="contained"
          size="large"
        >
          {t("questions.no")} (n)
        </Button>
        <Button
          onClick={() =>
            answerQuestion({ value: -1, insightId: question.insight_id })
          }
          startIcon={<QuestionMarkIcon />}
          variant="contained"
          size="large"
          autoFocus
        >
          {t("questions.skip")} (k)
        </Button>
        <Button
          onClick={() =>
            answerQuestion({ value: 1, insightId: question.insight_id })
          }
          startIcon={<DoneIcon />}
          color="success"
          variant="contained"
          size="large"
        >
          {t("questions.yes")} (o)
        </Button>
      </Stack>
    </Stack>
  );
};
export default QuestionDisplay;
