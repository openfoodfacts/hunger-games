import {
  createSlice,
  createAsyncThunk,
  configureStore,
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
  reducers: {},
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
          questions: { ...state.seenInsightIds, ...newQuestionsObject },
          fetchCompletted: count < state.page * PAGE_SIZE,
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

export default configureStore({
  reducer: {
    questions: questionBuffer.reducer,
  },
});
