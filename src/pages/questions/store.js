import {
  createSlice,
  createAsyncThunk,
  configureStore,
  createSelector,
} from "@reduxjs/toolkit";

import robotoff from "../../robotoff";

import { sleep } from "../../utils";

const PAGE_SIZE = 25;

export const fetchQuestions = createAsyncThunk(
  "fetchQuestions",
  async (_, thunkApi) => {
    const state = thunkApi.getState();
    const { data } = await robotoff.questions(
      state.questions.filterState,
      PAGE_SIZE,
      state.questions.page
    );
    return data;
  }
);

export const answerQuestion = createAsyncThunk(
  "answerQuestion",
  async ({ insight_id, value }) => {
    return await sleep(500); //robotoff.annotate(insight_id, value);
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
    filterState: {
      insightType: "brand",
      brandFilter: "",
      countryFilter: "",
      sortByPopularity: false,
      valueTag: "",
      predictor: "universal-logo-detector",
    },
  },
  reducers: {
    updateFilter: (state, action) => {
      console.log({ state, action });
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
        const { questions, count } = payload;

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
        };
      })
      .addCase(answerQuestion.pending, (state, action) => {
        const { insight_id, value } = action.meta.arg;
        console.log({ insight_id });
        return {
          ...state,
          remainingQuestions: state.remainingQuestions.filter(
            (question_id) => question_id !== insight_id
          ),
          answeredQuestions: [...state.answeredQuestions, insight_id],
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
    questions: questionBuffer.reducer,
  },
});

const getSubState = (state) => state.questions;

export const nbOfQuestionsInBufferSelector = createSelector(
  getSubState,
  (bufferState) => bufferState.remainingQuestions.length
);

export const currentQuestionSelector = createSelector(
  getSubState,
  (bufferState) =>
    bufferState.questions[bufferState.remainingQuestions[0]] ?? null
);

export const filterStateSelector = createSelector(
  getSubState,
  (bufferState) => bufferState.filterState
);

export const answeredQuestionsSelector = createSelector(
  getSubState,
  (bufferState) =>
    bufferState.answeredQuestions.map(
      (question) => bufferState.questions[question.insight_id]
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
