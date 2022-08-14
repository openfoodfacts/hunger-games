import React from "react";
import { NO_QUESTION_LEFT } from "../../const";
import robotoff from "../../robotoff";
import { reformatValueTag } from "../../utils";

const PAGE_SIZE = 10;
const BUFFER_THRESHOLD = 5;

const loadQuestions = async (filterState, page = 1, pageSize = PAGE_SIZE) => {
  const {
    insightType,
    brandFilter,
    valueTag,
    countryFilter,
    sortByPopularity,
  } = filterState;

  const { data: dataFetched } = await robotoff.questions(
    sortByPopularity ? "popular" : "random",
    insightType,
    valueTag,
    reformatValueTag(brandFilter),
    countryFilter !== "en:world" ? countryFilter : null,
    pageSize,
    page
  );
  const isLastPage = PAGE_SIZE * page > dataFetched.count;

  return {
    isLastPage,
    questions: dataFetched.questions.filter(
      (question) => question.source_image_url
    ),
    availableQuestionsNb: dataFetched.count,
  };
};

const initialState = { page: 1, questions: [], answers: [], skippedIds: [] };

function reducer(state, action) {
  switch (action.type) {
    case "reset":
      return { ...state, page: 1, questions: [], skippedIds: [] };

    case "addToBuffer":
      const questionsToAdd = action.payload.questions.filter(({ insight_id }) =>
        state.questions.every((q) => q.insight_id !== insight_id)
      );
      if (action.payload.isLastPage) {
        questionsToAdd.push(NO_QUESTION_LEFT);
      }
      const newSkippedIds = state.skippedIds;

      action.payload.removedInsightIds.forEach((id) => {
        if (!newSkippedIds.includes(id)) {
          // To consider insight skipped during a previous game
          newSkippedIds.push(id);
        }
      });

      const remainingQuestionNb =
        action.payload.availableQuestionsNb - newSkippedIds.length;
      return {
        ...state,
        page: questionsToAdd.length === 0 ? state.page + 1 : state.page,
        questions: [...state.questions, ...questionsToAdd],
        remainingQuestionNb,
        skippedIds: [...newSkippedIds],
      };

    case "remove":
      const answeredQuestion = state.questions.find(
        ({ insight_id }) => insight_id === action.payload.insightId
      );

      const newQuestions = state.questions.filter(
        ({ insight_id }) => insight_id !== action.payload.insightId
      );
      if (newQuestions.length === state.questions.length) {
        return state;
      }

      // Save the answered question
      return {
        ...state,
        questions: newQuestions,
        answers: [
          ...state.answers,
          {
            insight_id: answeredQuestion?.insight_id,
            barcode: answeredQuestion?.barcode,
            insight_type: answeredQuestion?.insight_type,
            value: answeredQuestion?.value,
            validationValue: action.payload.value,
          },
        ],
        remainingQuestionNb: state.remainingQuestionNb - 1,
        // skipped ids is used to correctly compute remainingQuestionNb after each data fetching
        skippedIds: [
          ...state.skippedIds,
          ...(action.payload.value === -1 ? [action.payload.insight_id] : []),
        ],
      };

    default:
      throw new Error();
  }
}

export const useQuestionBuffer = (
  { sortByPopularity, insightType, valueTag, brandFilter, countryFilter },
  pageSize,
  bufferThreshold = BUFFER_THRESHOLD
) => {
  const [bufferState, dispatch] = React.useReducer(reducer, initialState);
  const seenInsight = React.useRef([]);
  const isLoadingRef = React.useRef(false);
  const filteringRef = React.useRef({
    sortByPopularity,
    insightType,
    valueTag,
    brandFilter,
    countryFilter,
  });

  const answerQuestion = React.useCallback(({ value, insightId }) => {
    seenInsight.current.push(insightId);
    if (value !== -1) {
      robotoff.annotate(insightId, value);
    }
    dispatch({ type: "remove", payload: { insightId, value } });
  }, []);

  React.useEffect(() => {
    if (
      filteringRef.current.sortByPopularity !== sortByPopularity ||
      filteringRef.current.insightType !== insightType ||
      filteringRef.current.brandFilter !== brandFilter ||
      filteringRef.current.countryFilter !== countryFilter ||
      filteringRef.current.valueTag !== valueTag
    ) {
      filteringRef.current = {
        sortByPopularity,
        insightType,
        valueTag,
        brandFilter,
        countryFilter,
      };
      dispatch({ type: "reset" });
    }
  }, [sortByPopularity, insightType, valueTag, brandFilter, countryFilter]);

  const noMoreQuestionsToLoad =
    bufferState.questions.includes(NO_QUESTION_LEFT);

  React.useEffect(() => {
    let filterIsStillValid = true;
    if (
      bufferState.questions.length < bufferThreshold &&
      !noMoreQuestionsToLoad &&
      !isLoadingRef.current
    ) {
      isLoadingRef.current = true;
      loadQuestions(filteringRef.current, bufferState.page, pageSize)
        .then(({ isLastPage, questions, availableQuestionsNb }) => {
          if (filterIsStillValid) {
            const filteredQuestions = questions.filter(
              (question) => !seenInsight.current.includes(question.insight_id)
            );
            const removedInsightIds = questions
              .filter((question) =>
                seenInsight.current.includes(question.insight_id)
              )
              .map((q) => q.insight_id);

            dispatch({
              type: "addToBuffer",
              payload: {
                questions: filteredQuestions,
                isLastPage,
                availableQuestionsNb,
                removedInsightIds,
              },
            });
            isLoadingRef.current = false;
          }
        })
        .catch(() => {
          if (filterIsStillValid) {
            isLoadingRef.current = false;
          }
        });
    }
    return () => {
      filterIsStillValid = false;
      isLoadingRef.current = false;
    };
  }, [
    noMoreQuestionsToLoad,
    bufferState.questions.length,
    bufferState.page,
    pageSize,
    bufferThreshold,
  ]);

  return {
    answerQuestion,
    buffer: bufferState.questions,
    remainingQuestionNb: bufferState.remainingQuestionNb,
    answers: bufferState.answers,
  };
};
