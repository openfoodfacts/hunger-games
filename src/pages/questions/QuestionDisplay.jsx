import * as React from "react";
import { Link } from "react-router-dom";

import { Button, Divider, Stack, Typography } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";

import { useTranslation } from "react-i18next";
import { NO_QUESTION_LEFT, OFF_URL } from "../../const";
import { reformatValueTag } from "../../utils";

const getValueTagQuestionsURL = (question) => {
  if (question !== null && question !== NO_QUESTION_LEFT && question.value_tag) {
    const urlParams = new URLSearchParams();
    urlParams.append("type", question.insight_type);
    urlParams.append("value_tag", reformatValueTag(question.value_tag));
    return `/questions?${urlParams.toString()}`;
  }
  return null;
};
const getValueTagExamplesURL = (question) => {
  if (question !== null && question !== NO_QUESTION_LEFT && question.value_tag && question.insight_type) {
    return `${OFF_URL}/${question.insight_type}/${reformatValueTag(question.value_tag)}`;
  }
  return "";
};

const QuestionDisplay = ({ question, answerQuestion }) => {
  const { t } = useTranslation();
  const valueTagQuestionsURL = getValueTagQuestionsURL(question);
  const valueTagExamplesURL = getValueTagExamplesURL(question);

  if (question === NO_QUESTION_LEFT) {
    return <p>NO Questions</p>;
  }
  if (question === null) {
    return <p>loading</p>;
  }
  return (
    <div>
      <Typography>{question?.question}</Typography>
      {valueTagQuestionsURL && (
        <Button component={Link} to={valueTagQuestionsURL} endIcon={<LinkIcon />}>
          {question.value}
        </Button>
      )}
      {valueTagExamplesURL && (
        <a href={valueTagExamplesURL} target="_blank">
          <div>{`${t("questions.see_examples")} ${question.insight_type}`}</div>
        </a>
      )}
      <Divider />
      <img src={question.source_image_url || "https://static.openfoodfacts.org/images/image-placeholder.png"} alt="" />
      <Stack direction="row">
        <Button onClick={() => answerQuestion({ value: 0, insightId: question.insight_id })}>{t("questions.no")}</Button>
        <Button onClick={() => answerQuestion({ value: -1, insightId: question.insight_id })}>{t("questions.skip")}</Button>
        <Button onClick={() => answerQuestion({ value: 1, insightId: question.insight_id })}>{t("questions.yes")}</Button>
      </Stack>
    </div>
  );
};
export default QuestionDisplay;
{
  /*
          <div class="ui divider hidden"></div>
          <cropper
            style="height: 300px; margin:auto"
            :src="currentQuestionImageUrl"
            :transitions="false"
            :canvas="false"
            :checkOrientation="false"
            :crossOrigine="false"
            :default-position="{
              left: 0,
              top: 0,
            }"
            :stencilSize="
              ({ boundaries }) => {
                return {
                  width: boundaries.width,
                  height: boundaries.height,
                };
              }
            "
            default-boundaries="fit"
            :stencil-props="{
              handlers: {},
              movable: false,
              resizable: false,
            }"
          />
          <div class="ui divider hidden"></div>
          <div>
            <button
              data-inverted
              data-tooltip="Shortcut: N"
              class="ui big negative button annotate"
              @click="annotate(0)"
            >
              <i class="trash icon"></i>
              {{ $t("questions.no") }}
            </button>
            <button
              data-inverted
              data-tooltip="Shortcut: K"
              class="ui big button annotate"
              @click="annotate(-1)"
            >
              <i class="question icon"></i>
              {{ $t("questions.skip") }}
            </button>
            <button
              data-inverted
              data-tooltip="Shortcut: O"
              class="ui big positive button annotate"
              @click="annotate(1)"
            >
              <i class="check icon"></i>
              {{ $t("questions.yes") }}
            </button>
          </div>
        </div>
        <div class="flex-center" v-else style="margin-top: 100px">
          <LoadingSpinner :show="loading" />
          <div v-if="noRemainingQuestion">
            <h2>{{ $t("questions.no_questions_remaining") }}</h2>
          </div>
        </div>
      </div>
    </div> */
}
