import * as React from "react";

import QuestionFilter from "../../components/QuestionFilter";
import { useFilterSearch } from "../../components/QuestionFilter/useFilterSearch";
import QuestionDisplay from "./QuestionDisplay";
import ProductInformation from "./ProductInformation";
import UserData from "./UserData";
import { useQuestionBuffer } from "./useQuestionBuffer";
import Divider from "@mui/material/Divider";

import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

export default function Questions() {
  const [filterState, setFilterState] = useFilterSearch();

  const { buffer, answerQuestion, remainingQuestionNb, answers } = useQuestionBuffer(filterState);
  const question = buffer[0] ?? null;

  return (
    <Box sx={{ margin: "2% 5%" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1, sm: 2, md: 4 }}
      >
        <Stack direction="column" sx={{minWidth:"33%"}}>
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
        <ProductInformation question={question} />
        <UserData remainingQuestionNb={remainingQuestionNb} answers={answers} />
      </Stack>
    </Box>
  );
}
