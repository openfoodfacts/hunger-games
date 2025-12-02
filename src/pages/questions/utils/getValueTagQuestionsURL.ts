import { getQuestionSearchParams } from "../../../components/QuestionFilter";
import { NO_QUESTION_LEFT } from "../../../const";
import { QuestionInterface } from "../../../robotoff";
import { reformatValueTag } from "../../../utils";
import { FilterParams } from "../../../hooks/useFilterState/getFilterParams";

export const getValueTagQuestionsURL = (
  filterState: FilterParams,
  question: QuestionInterface | null,
) => {
  if (
    question !== null &&
    question &&
    question?.insight_id !== NO_QUESTION_LEFT &&
    question?.value_tag
  ) {
    const urlParams = new URLSearchParams();
    urlParams.append("type", question.insight_type);
    urlParams.append("value_tag", reformatValueTag(question?.value_tag));
    return `/questions?${getQuestionSearchParams({
      ...filterState,
      insightType: question.insight_type,
      valueTag: question?.value_tag,
    })}`;
  }
  return null;
};
