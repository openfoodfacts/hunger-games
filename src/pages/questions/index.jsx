import * as React from "react";

import QuestionFilter from "../../components/QuestionFilter";
import { useFilterSearch } from "../../components/QuestionFilter/useFilterSearch";
import QuestionDisplay from "./QuestionDisplay";
import ProductInformation from "./ProductInformation";
import UserData from "./UserData";
import { useQuestionBuffer } from "./useQuestionBuffer";
import Divider from "@mui/material/Divider";

import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";

export default function Questions() {
  const [filterState, setFilterState] = useFilterSearch();

  const { buffer, answerQuestion, remainingQuestionNb, answers } =
    useQuestionBuffer(filterState);
  const question = buffer[0] ?? null;

  return (
    <Grid container spacing={2} p={2}>
      <Grid item sm={12} md={5}>
        <Stack direction="column" sx={{ height: "calc(100vh - 100px)" }}>
          <QuestionFilter
            filterState={filterState}
            setFilterState={setFilterState}
          />
          <Divider sx={{ margin: "1rem" }} />
          <QuestionDisplay
            question={question}
            answerQuestion={answerQuestion}
          />
        </Stack>
      </Grid>
      <Grid item sm={12} md={5}>
        <ProductInformation question={question} />
      </Grid>
      <Grid item sm={12} md={2}>
        <UserData remainingQuestionNb={remainingQuestionNb} answers={answers} />
      </Grid>
    </Grid>
  );
}
