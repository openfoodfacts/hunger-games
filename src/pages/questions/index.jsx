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

import store, { fetchQuestions, answerQuestion } from "./store";
import { Provider, useDispatch, useSelector } from "react-redux";

function QuestionsConsumer() {
  // const [filterState, setFilterState, isFavorite, toggleFavorite] =
  //   useFilterSearch();

  // const {
  //   buffer,
  //   answerQuestion,
  //   remainingQuestionNb,
  //   answers,
  //   preventAnnotation,
  // } = useQuestionBuffer(filterState);
  // const question = buffer[0] ?? null;

  // const resetFilters = React.useCallback(
  //   () =>
  //     setFilterState((prevState) => ({
  //       ...DEFAULT_FILTER_STATE,
  //       insightType: prevState.insightType,
  //       sortByPopularity: prevState.sortByPopularity,
  //     })),
  //   [setFilterState]
  // );
  const dispatch = useDispatch();

  const state = useSelector((state) => state.questions);

  const remainingQuestionNb = state.remainingQuestions.length;

  React.useEffect(() => {
    if (remainingQuestionNb < 5) {
      dispatch(fetchQuestions());
    }
  }, [dispatch, remainingQuestionNb]);

  const answer = React.useCallback(
    ({ value, insight_id }) => {
      dispatch(answerQuestion({ insight_id, value }));
    },
    [dispatch]
  );
  const question = state.questions[state.remainingQuestions[0]] ?? null;

  const productData = useProductData(question?.barcode);
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
            filterState={state.filterState}
            setFilterState={(x) => x}
            isFavorite={false}
            toggleFavorite={() => null}
          />
          <Divider sx={{ margin: "1rem" }} />
          <QuestionDisplay
            question={question}
            answerQuestion={answer}
            resetFilters={() => null}
            filterState={state.filterState}
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
          answers={state.answeredQuestions.map(
            (question) => state.questions[question.insight_id]
          )}
          preventAnnotation={() => null}
        />
      </Grid>
      {/* pre-fetch images of the next question */}
      {state.remainingQuestions.slice(1, 5).map((insight_id) => {
        const q = state.questions[insight_id] ?? null;
        return q?.source_image_url ? (
          <link rel="prefetch" key={q.insight_id} href={q.source_image_url} />
        ) : null;
      })}
    </Grid>
    // <pre>{JSON.stringify(state, null, 2)}</pre>
  );
}

export default function Questions() {
  return (
    <Provider store={store}>
      <QuestionsConsumer />
    </Provider>
  );
}
