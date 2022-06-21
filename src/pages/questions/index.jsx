import * as React from "react";

import QuestionFilter from "../../components/QuestionFilter";
import { useFilterSearch } from "../../components/QuestionFilter/useFilterSearch";
import QuestionDisplay from "./QuestionDisplay";
import ProductInformation from "./ProductInformation";
import UserData from "./UserData";
import { useQuestionBuffer } from "./useQuestionBuffer";

export default function Questions() {
  const [filterState, setFilterState] = useFilterSearch();

  const { buffer, answerQuestion, remainingQuestionNb, answers } = useQuestionBuffer(filterState);
  const question = buffer[0] ?? null;

  return (
    <>
      <QuestionFilter filterState={filterState} setFilterState={setFilterState} />
      <QuestionDisplay question={question} answerQuestion={answerQuestion} />
      <ProductInformation question={question} />
      <UserData remainingQuestionNb={remainingQuestionNb} answers={answers} />
    </>
  );
}
