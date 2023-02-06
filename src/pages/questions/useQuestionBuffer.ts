import React from "react";
import { NO_QUESTION_LEFT } from "../../const";
import { useMatomoTrackAnswerQuestion } from "../../hooks/matomoEvents";
import robotoff, { QuestionInterface } from "../../robotoff";

const PAGE_SIZE = 10;
const BUFFER_THRESHOLD = 5;
const DEFAULT_ANSWER_DELAY = 5000;

const loadQuestions = async (filterState, page = 1, pageSize = PAGE_SIZE) => {
  const { data: dataFetched } = await robotoff.questions(
    filterState,
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
  | {
      type: "sendAnswers";
      payload: {
        trackAnswer: (value: number) => void;
      };
    };

function reducer(state: ReducerStateInterface, action: Actions) {
  switch (action.type) {
    case "reset":
      return {
        ...state,
        page: 1,
        questions: [],
      };

    case "addToBuffer":
      const questionsToAdd: Partial<QuestionInterface>[] =
        action.payload.questions.filter(({ insight_id }) =>
          state.questions.every((q) => q.insight_id !== insight_id)
        );
      if (action.payload.isLastPage) {
        questionsToAdd.push({ insight_id: NO_QUESTION_LEFT });
      }

      const remainingQuestionNb = action.payload.availableQuestionsNb;
      return {
        ...state,
        page: questionsToAdd.length === 0 ? state.page + 1 : state.page,
        questions: [...state.questions, ...questionsToAdd],
        remainingQuestionNb,
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
      };

    case "sendAnswers":
      const minDate = new Date().getTime();

      const newAnswers = state.answers.map((answer) => {
        const { sendingTime, isPending, validationValue, insight_id } = answer;
        if (isPending && sendingTime <= minDate) {
          if (insight_id !== "NO_QUESTION_LEFT") {
            action.payload.trackAnswer(validationValue);
            robotoff.annotate(insight_id!, validationValue);
          }
          return { ...answer, isPending: false };
        }
        return answer;
      });
      return { ...state, answers: newAnswers };

    case "revertAnswer":
      const answeredQuestionIndex = state.answers.findIndex(
        ({ insight_id }) => insight_id === action.payload.insightId
      );
      if (answeredQuestionIndex < 0) {
        return state;
      }
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
      };

    default:
      throw new Error();
  }
}

export const useQuestionBuffer = (
  {
    sortByPopularity,
    insightType,
    valueTag,
    brandFilter,
    packagingFilter,
    countryFilter,
    campaign,
    predictor,
  },
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
    packagingFilter,
    campaign,
    predictor,
  });
  const trackAnswer = useMatomoTrackAnswerQuestion();

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
      filteringRef.current.packagingFilter !== packagingFilter ||
      filteringRef.current.countryFilter !== countryFilter ||
      filteringRef.current.valueTag !== valueTag ||
      filteringRef.current.campaign !== campaign ||
      filteringRef.current.predictor !== predictor
    ) {
      filteringRef.current = {
        sortByPopularity,
        insightType,
        valueTag,
        brandFilter,
        countryFilter,
        packagingFilter,
        campaign,
        predictor,
      };
      dispatch({ type: "reset" });
    }
  }, [
    sortByPopularity,
    insightType,
    valueTag,
    brandFilter,
    packagingFilter,
    countryFilter,
    campaign,
    predictor,
  ]);

  const noMoreQuestionsToLoad =
    bufferState.questions.findIndex(
      (question) => question.insight_id === NO_QUESTION_LEFT
    ) >= 0;

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
            console.log("filtering");
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

  React.useEffect(() => {
    const now = new Date().getTime();

    const timesToSending = bufferState.answers
      .filter(({ isPending }) => isPending)
      .map(({ sendingTime }) => sendingTime - now);

    if (timesToSending.length === 0) {
      return;
    }

    const nextSending = Math.max(0, Math.min(...timesToSending));

    const timer = setTimeout(() => {
      dispatch({ type: "sendAnswers", payload: { trackAnswer } });
    }, nextSending);
    return () => clearTimeout(timer);
  }, [bufferState.answers, trackAnswer]);

  return {
    answerQuestion,
    preventAnnotation,
    buffer: bufferState.questions,
    remainingQuestionNb: bufferState.remainingQuestionNb,
    answers: bufferState.answers,
  };
};
