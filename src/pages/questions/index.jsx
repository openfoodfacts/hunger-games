import * as React from "react";

import QuestionFilter from "../../components/QuestionFilter";
import QuestionDisplay from "./QuestionDisplay";
import { useQuestionBuffer } from "./useQuestionBuffer";

export default function Questions() {
  const [filterState, setFilterState] = React.useState({
    insightType: "brand",
  });

  const { buffer, answerQuestion } = useQuestionBuffer(filterState);
  const question = buffer[0] ?? null;
  console.log({ buffer });
  return (
    <>
      <QuestionFilter filterState={filterState} setFilterState={setFilterState} />
      <QuestionDisplay question={question} answerQuestion={answerQuestion} />
    </>
  );
}
