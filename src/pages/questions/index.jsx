import * as React from "react";

import QuestionFilter from "../../components/QuestionFilter";
import { useFilterSearch } from "../../components/QuestionFilter/useFilterSearch";
import { DEFAULT_FILTER_STATE } from "../../components/QuestionFilter/const";

import QuestionDisplay from "./QuestionDisplay";
import ProductInformation from "./ProductInformation";
import UserData from "./UserData";
import { useQuestionBuffer } from "./useQuestionBuffer";
import { useProductData } from "./utils";

import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";

export default function Questions() {
  const [filterState, setFilterState, isFavorite, toggleFavorite] =
    useFilterSearch();

  const {
    buffer,
    answerQuestion,
    remainingQuestionNb,
    answers,
    preventAnnotation,
  } = useQuestionBuffer(filterState);
  const question = buffer[0] ?? null;

  const productData = useProductData(question?.barcode);

  const resetFilters = React.useCallback(
    () =>
      setFilterState((prevState) => ({
        ...DEFAULT_FILTER_STATE,
        insightType: prevState.insightType,
        sortByPopularity: prevState.sortByPopularity,
      })),
    [setFilterState]
  );
  console.log({ filterState });
  return (
    <Grid container spacing={2} p={2}>
      <Grid item xs={12} md={5}>
        <Stack
          direction="column"
          sx={{
            height: { xs: "calc(100vh - 76px)", md: "calc(100vh - 110px)" },
          }}
        >
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
            productData={productData}
          />
        </Stack>
      </Grid>
      <Grid item xs={12} md={5}>
        <ProductInformation question={question} productData={productData} />
      </Grid>
      <Grid item xs={12} md={2}>
        <UserData
          remainingQuestionNb={remainingQuestionNb}
          answers={answers}
          preventAnnotation={preventAnnotation}
        />
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
