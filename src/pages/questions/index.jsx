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
  const [filterState, setFilterState, isFavorite, toggleFavorite] =
    useFilterSearch();

  const { buffer, answerQuestion, remainingQuestionNb, answers } =
    useQuestionBuffer(filterState);
  const question = buffer[0] ?? null;

  const resetFilters = React.useCallback(
    () =>
      setFilterState((prevState) => ({
        insightType: prevState.insightType,
        sortByPopularity: prevState.sortByPopularity,
      })),
    [setFilterState]
  );

  return (
    <Grid container spacing={2} p={2}>
      <Grid item sm={12} md={5}>
        <Stack direction="column" sx={{ height: "calc(100vh - 100px)" }}>
          <QuestionFilter
            filterState={filterState}
            setFilterState={setFilterState}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
          />
          <Divider sx={{ margin: "1rem" }} />
          <QuestionDisplay
            question={question}
            answerQuestion={answerQuestion}
            resetFilters={resetFilters}
            filterState={filterState}
          />
        </Stack>
      </Grid>
      <Grid item sm={12} md={5}>
        <ProductInformation question={question} />
      </Grid>
      <Grid item sm={12} md={2}>
        <UserData remainingQuestionNb={remainingQuestionNb} answers={answers} />
      </Grid>
      {/* pre-fetch images of the next question */}
      {buffer
        .slice(1, 5)
        .map((q) =>
          q.source_image_url ? (
            <link
              rel="prefetch"
              key={q.source_image_url}
              href={q.source_image_url}
            />
          ) : null
        )}
    </Grid>
  );
}
