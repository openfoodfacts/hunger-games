import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { CORRECT_INSIGHT, WRONG_INSIGHT } from "../../const";
import robotoff, { QuestionInterface } from "../../robotoff";
import { useProductQuestions } from "../../hooks/useProductQuestions";

const noop = () => {};

export default function ProductOtherQuestions({
  question,
}: {
  question: QuestionInterface;
}) {
  const { t } = useTranslation();

  const [answers, setAnswers] = React.useState<
    Record<
      string,
      {
        value: typeof WRONG_INSIGHT | typeof CORRECT_INSIGHT | null;
        sent: boolean;
      }
    >
  >({});
  const { data, status } = useProductQuestions(question.barcode);

  const filteredData = React.useMemo(
    () =>
      data?.filter(
        (q) =>
          q.insight_id !== question.insight_id && // Not the main question
          !answers[q.insight_id]?.sent, // Not already answered
      ) ?? [],
    [data, question.insight_id, answers],
  );

  if (status === "pending") {
    return <Typography>Loading ...</Typography>;
  }
  if (status === "error") {
    return <Typography>An error occurred</Typography>;
  }

  if (filteredData.length === 0) {
    return <Typography>No other questions</Typography>;
  }

  return (
    <Stack spacing={2}>
      {filteredData.map((otherQuestion) => {
        const insight_id = otherQuestion.insight_id;
        const pendingAnswer = answers[insight_id]?.value ?? null;

        // Set the value,n or move it to `null` if already set.
        const toggleValue = (
          value: typeof WRONG_INSIGHT | typeof CORRECT_INSIGHT,
        ) =>
          setAnswers((prev) => ({
            ...prev,
            [insight_id]: {
              value: prev[insight_id]?.value === value ? null : value,
              sent: false,
            },
          }));

        const valueIsSet =
          pendingAnswer === CORRECT_INSIGHT || pendingAnswer === WRONG_INSIGHT;
        const sendAnswer = valueIsSet
          ? () => {
              robotoff
                .annotate(insight_id, pendingAnswer)
                .then(() => {
                  setAnswers((prev) => ({
                    ...prev,
                    [insight_id]: {
                      ...prev[insight_id],
                      sent: true,
                    },
                  }));
                })
                .catch(() => {});
            }
          : noop;

        return (
          <Stack spacing={0.75} key={otherQuestion.insight_id}>
            <Typography key={otherQuestion.insight_id}>
              {otherQuestion.question} ({otherQuestion.value})
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Button
                onClick={() => toggleValue(CORRECT_INSIGHT)}
                variant={
                  pendingAnswer === CORRECT_INSIGHT ? "contained" : "outlined"
                }
                color="success"
                size="small"
              >
                {t("questions.yes")}
              </Button>
              <Button
                onClick={() => toggleValue(WRONG_INSIGHT)}
                variant={
                  pendingAnswer === WRONG_INSIGHT ? "contained" : "outlined"
                }
                color="error"
                size="small"
              >
                {t("questions.no")}
              </Button>
              <Button
                onClick={sendAnswer}
                disabled={!valueIsSet}
                color="primary"
                variant="contained"
                size="small"
              >
                {t("questions.send")}
              </Button>
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
}
