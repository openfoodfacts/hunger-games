import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { CORRECT_INSIGHT, WRONG_INSIGHT } from "../../const";
import robotoff, { QuestionInterface } from "../../robotoff";
import { useProductQuestions } from "../../hooks/useProductQuestions";

const noop = () => { };

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
    [question.insight_id, data],
  );

  // Reset the pending answer for new data
  React.useEffect(() => {
    if (!data) {
      return;
    }
    setAnswers(
      Object.fromEntries(
        data.map((question) => [
          question.insight_id,
          { value: null, sent: false },
        ]),
      ),
    );
  }, [data]);

  if (status === "pending") {
    return <Typography>Loading ...</Typography>;
  }
  if (status === "error") {
    return <Typography>An error occurred</Typography>;
  }

  if (filteredData.length === 0) {
    return <Typography>No other questions</Typography>;
  }

  return filteredData.map((otherQuestion) => {
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
        robotoff.annotate(insight_id, pendingAnswer);
        setAnswers((prev) => ({
          ...prev,
          [insight_id]: {
            ...prev[insight_id],
            sent: true,
          },
        }));
      }
      : noop;

    return (
      <Stack
        direction="row"
        key={otherQuestion.insight_id}
        sx={{ mt: 1, alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}
      >
        <Typography key={otherQuestion.insight_id}>
          {otherQuestion.question} ({otherQuestion.value})
        </Typography>
        <Button
          onClick={() => toggleValue(CORRECT_INSIGHT)}
          variant={pendingAnswer === CORRECT_INSIGHT ? "contained" : "outlined"}
          color="success"
          size="small"
        >
          {t("questions.yes")}
        </Button>
        <Button
          onClick={() => toggleValue(WRONG_INSIGHT)}
          variant={pendingAnswer === WRONG_INSIGHT ? "contained" : "outlined"}
          color="error"
          size="small"
        >
          {t("questions.no")}
        </Button>
        <Button
          onClick={sendAnswer}
          disabled={!valueIsSet}
          color="secondary"
          variant="contained"
          size="small"
        >
          {t("questions.send")}
        </Button>
      </Stack>
    );
  });
}
