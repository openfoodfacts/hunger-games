import { getQuestionSearchParams } from "../../../components/QuestionFilter";
import { NO_QUESTION_LEFT } from "../../../const";
import { QuestionInterface, FilterState } from "../../../robotoff";

export const getValueTagQuestionsURL = (
  filterState: FilterState,
  question: Pick<
    QuestionInterface,
    "insight_id" | "insight_type" | "value_tag"
  > | null,
) => {
  if (
    question &&
    question?.insight_id !== NO_QUESTION_LEFT &&
    question?.value_tag
  ) {
    return `/questions?${getQuestionSearchParams({
      ...filterState,
      insightType: question.insight_type,
      valueTag: question.value_tag,
    })}`;
  }

  return null;
};
