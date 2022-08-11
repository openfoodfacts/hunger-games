import React from "react";
import { NO_QUESTION_LEFT } from "../../const";
import robotoff, { QuestionInterface } from "../../robotoff";
import { reformatValueTag } from "../../utils";

const PAGE_SIZE = 10;
const BUFFER_THRESHOLD = 5;
const DEFAULT_ANSWER_DELAY = 5000;

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

const initialState: ReducerStateInterface = {
  page: 1,
  questions: [],
  answers: [],
  skippedIds: [],
  remainingQuestionNb: -1,
};

export interface AnswerInterface extends Partial<QuestionInterface> {
  validationValue: number;
  isPending: boolean;
  // The time in ms where the request must be sent: see Date().getTime()
  sendingTime: number;
}

export interface ReducerStateInterface {
  page: number;
  questions: Partial<QuestionInterface>[];
  answers: AnswerInterface[];
  skippedIds: string[];
  remainingQuestionNb: number;
}
type Actions =
  | { type: "reset" }
  | {
      type: "addToBuffer";

      payload: {
        questions: QuestionInterface[];
        isLastPage: boolean;
        removedInsightIds: string[];
        availableQuestionsNb: number;
      };
    }
  | {
      type: "annotate";
      payload: {
        insightId: string;
        value: number;
        // delay in ms
        pendingDelay: number;
      };
    }
  | {
      type: "revertAnswer";
      payload: {
        insightId: string;
      };
    }
  | { type: "sendAnswers" };

function reducer(state: ReducerStateInterface, action: Actions) {
  switch (action.type) {
    case "reset":
      return {
        ...state,
        page: 1,
        questions: [],
        skippedIds: [],
      };

    case "addToBuffer":
      const questionsToAdd: Partial<QuestionInterface>[] =
        action.payload.questions.filter(({ insight_id }) =>
          state.questions.every((q) => q.insight_id !== insight_id)
        );
      if (action.payload.isLastPage) {
        questionsToAdd.push({ insight_id: NO_QUESTION_LEFT });
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

    case "annotate":
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
            ...answeredQuestion,
            validationValue: action.payload.value,
            isPending: true,
            sendingTime: new Date().getTime() + action.payload.pendingDelay,
          },
        ],
        remainingQuestionNb: state.remainingQuestionNb - 1,
        // skipped ids is used to correctly compute remainingQuestionNb after each data fetching
        skippedIds: [
          ...state.skippedIds,
          ...(action.payload.value === -1 ? [action.payload.insightId] : []),
        ],
      };

    case "sendAnswers":
      const minDate = new Date().getTime();

      const newAnswers = state.answers.map((answer) => {
        const { sendingTime, isPending, validationValue, insight_id } = answer;
        if (isPending && sendingTime <= minDate) {
          if (validationValue !== -1) {
            robotoff.annotate(insight_id!, validationValue);
            return { ...answer, isPending: false };
          }
        }
        return answer;
      });
      return { ...state, answers: newAnswers };

    case "revertAnswer":
      const answeredQuestionIndex = state.answers.findIndex(
        ({ insight_id }) => insight_id === action.payload.insightId
      );
      const answer = state.answers[answeredQuestionIndex];
      const { validationValue, isPending, sendingTime, ...question } = answer;

      if (!isPending) {
        return state;
      }

      return {
        ...state,
        questions: [question],
        remainingQuestionNb: state.remainingQuestionNb + 1,
        answers: state.answers.filter(
          (answer) => answer.insight_id !== action.payload.insightId
        ),
        skippedIds: state.skippedIds.filter(
          (id) => id !== action.payload.insightId
        ),
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
  const [bufferState, dispatch] = React.useReducer<
    React.Reducer<ReducerStateInterface, Actions>
  >(reducer, initialState);
  const seenInsight = React.useRef<string[]>([]);
  const isLoadingRef = React.useRef(false);
  const filteringRef = React.useRef({
    sortByPopularity,
    insightType,
    valueTag,
    brandFilter,
    countryFilter,
  });

  const answerQuestion = React.useCallback(
    ({ value, insightId, pendingDelay = DEFAULT_ANSWER_DELAY }) => {
      seenInsight.current.push(insightId);
      dispatch({
        type: "annotate",
        payload: { insightId, value, pendingDelay },
      });
    },
    []
  );

  const preventAnnotation = React.useCallback((insightId) => {
    dispatch({ type: "revertAnswer", payload: { insightId } });
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

  React.useEffect(() => {
    let filterIsStillValid = true;
    if (
      bufferState.questions.length < bufferThreshold &&
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
    bufferState.questions.length,
    bufferState.page,
    pageSize,
    bufferThreshold,
  ]);

  React.useEffect(() => {
    const now = new Date().getTime();

    const timesToSending = bufferState.answers
      .filter(({ isPending }) => isPending)
      .map(({ sendingTime }) => sendingTime - now);

    const nextSending = Math.max(0, Math.min(...timesToSending));

    const timer = setTimeout(() => {
      dispatch({ type: "sendAnswers" });
    }, nextSending);
    return () => clearTimeout(timer);
  }, [bufferState.answers]);

  return {
    answerQuestion,
    preventAnnotation,
    buffer: bufferState.questions,
    remainingQuestionNb: bufferState.remainingQuestionNb,
    answers: bufferState.answers,
  };
};
