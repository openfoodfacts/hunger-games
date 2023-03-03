import {
  createSlice,
  createAsyncThunk,
  configureStore,
  createSelector,
} from "@reduxjs/toolkit";

import { IS_DEVELOPMENT_MODE } from "../../const";
import robotoff from "../../robotoff";

import { sleep } from "../../utils";

const PAGE_SIZE = 25;

export const fetchQuestions = createAsyncThunk(
  "fetchQuestions",
  async (_, thunkApi) => {
    const state = thunkApi.getState();
    const { data } = await robotoff.questions(
      state.questionBuffer.filterState,
      PAGE_SIZE,
      state.questionBuffer.page
    );
    return { page: state.questionBuffer.page, pages_size: PAGE_SIZE, ...data };
  }
);

export const answerQuestion = createAsyncThunk(
  "answerQuestion",
  async ({ insight_id, value }) => {
    if (IS_DEVELOPMENT_MODE) {
      return await sleep(500);
    }
    return await robotoff.annotate(insight_id, value);
  }
);

export const questionBuffer = createSlice({
  name: "questions",
  initialState: {
    page: 1,
    questions: {},
    remainingQuestions: [],
    answeredQuestions: [],
    fetchCompletted: false,
    numberOfQuestionsAvailable: 0,
    filterState: {
      insightType: "brand",
      brandFilter: "",
      countryFilter: "",
      sortByPopularity: false,
      valueTag: "",
      predictor: "",
    },
  },
  reducers: {
    updateFilter: (state, action) => {
      if (
        Object.keys(action.payload).every(
          (key) => state.filterState[key] === action.payload[key]
        )
      ) {
        // Early return if new state is similar to the current one
        return;
      }
      // Update filter and reset fetched data
      state.filterState = { ...state.filterState, ...action.payload };
      state.page = 1;
      state.remainingQuestions = [];
      state.fetchCompletted = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.fulfilled, (state, { payload }) => {
        const { questions, count, page, pages_size } = payload;

        const newQuestions = questions.filter(
          (question) => state.questions[question.insight_id] === undefined
        );

        const questionsToAdd = newQuestions.filter(
          (question) => question.source_image_url
        );

        const newQuestionsObject = {};
        questionsToAdd.forEach((q) => {
          newQuestionsObject[q.insight_id] = q;
        });

        const questionsFromNextPage = Math.max(0, count - page * pages_size); // The number of questions starting from page+1

        const numberOfQuestionsAvailable =
          questionsFromNextPage + //Questions from unseen pages
          state.remainingQuestions.length + //Questions from previouse pages
          questionsToAdd.length; // QUestions added with this fetch

        const newPage = newQuestions.length === 0 ? state.page + 1 : state.page;
        return {
          ...state,
          page: newPage,
          remainingQuestions: [
            ...state.remainingQuestions,
            ...questionsToAdd.map((question) => question.insight_id),
          ],
          questions: { ...state.questions, ...newQuestionsObject },
          fetchCompletted: count < state.page * PAGE_SIZE,
          numberOfQuestionsAvailable,
        };
      })
      .addCase(answerQuestion.pending, (state, action) => {
        const { insight_id, value } = action.meta.arg;

        return {
          ...state,
          remainingQuestions: state.remainingQuestions.filter(
            (question_id) => question_id !== insight_id
          ),
          answeredQuestions: [...state.answeredQuestions, insight_id],
          numberOfQuestionsAvailable: state.numberOfQuestionsAvailable - 1,
          questions: {
            ...state.questions,
            [insight_id]: {
              ...state.questions[insight_id],
              validationValue: value,
              status: "pending",
            },
          },
        };
      })
      .addCase(answerQuestion.fulfilled, (state, action) => {
        const { insight_id } = action.meta.arg;
        return {
          ...state,
          questions: {
            ...state.questions,
            [insight_id]: {
              ...state.questions[insight_id],
              status: "validated",
            },
          },
        };
      })
      .addCase(answerQuestion.rejected, (state, action) => {
        const { insight_id } = action.meta.arg;
        return {
          ...state,
          questions: {
            ...state.questions,
            [insight_id]: {
              ...state.questions[insight_id],
              status: "failled",
            },
          },
        };
      });
  },
});

export const { updateFilter } = questionBuffer.actions;
export default configureStore({
  reducer: {
    questionBuffer: questionBuffer.reducer,
  },
});

const getSubState = (state) => state.questionBuffer;

export const nbOfQuestionsInBufferSelector = createSelector(
  getSubState,
  (bufferState) => bufferState.remainingQuestions.length
);

export const currentQuestionSelector = createSelector(
  getSubState,
  (bufferState) =>
    bufferState.questions[bufferState.remainingQuestions[0]] ?? null
);

export const questionsToAnswerSelector = createSelector(
  getSubState,
  (bufferState) =>
    bufferState.remainingQuestions.map(
      (insight_id) => bufferState.questions[insight_id]
    )
);

export const filterStateSelector = createSelector(
  getSubState,
  (bufferState) => bufferState.filterState
);

export const answeredQuestionsSelector = createSelector(
  getSubState,
  (bufferState) =>
    bufferState.answeredQuestions.map(
      (insight_id) => bufferState.questions[insight_id]
    )
);

export const nextImagesSelector = createSelector(getSubState, (bufferState) =>
  bufferState.remainingQuestions
    .slice(1, 5)
    .map((insight_id) => bufferState.questions[insight_id]?.source_image_url)
    .filter((image_url) => !!image_url)
);

export const isLoadingSelector = createSelector(
  getSubState,
  (bufferState) => !bufferState.fetchCompletted
);

export const numberOfQuestionsAvailableSelector = createSelector(
  getSubState,
  (bufferState) => bufferState.numberOfQuestionsAvailable
);
