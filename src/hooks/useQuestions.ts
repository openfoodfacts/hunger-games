import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import robotoff, { QuestionInterface } from "../robotoff";
import { useMatomoTrackAnswerQuestion } from "./matomoEvents";
import { useFilterState, FilterParams } from "./useFilterState";
import { SKIPPED_INSIGHT, CORRECT_INSIGHT, WRONG_INSIGHT } from "../const";

const ANSWERS_MEMORY_SIZE = 25;

export interface AnswerQuestionParams {
  answer:
    | typeof SKIPPED_INSIGHT
    | typeof CORRECT_INSIGHT
    | typeof WRONG_INSIGHT;
  question: QuestionInterface;
}

interface AnsweredQuestion extends QuestionInterface {
  answer: typeof CORRECT_INSIGHT | typeof WRONG_INSIGHT;
}

/**
 * Additional options to modify the hook behavior
 */
interface UseQuestionsOptions {
  /**
   * Filter params tha override either the one passed as argument, or the one from the URLSearchParams.
   * @default {}
   */
  forcedParams?: Partial<FilterParams>;
  /**
   * The number opf question per page.
   * @default 20
   */
  pageSize?: number;
}

/**
 * Infinitely fetch questions according to some filter params.
 * Params can either be passed as to the hook.
 * If not the params will be derived from the URLSearchParameters
 */
export default function useQuestions(
  inParams?: FilterParams,
  options?: UseQuestionsOptions,
) {
  const { forcedParams = {}, pageSize = 20 } = options ?? {};
  const { answerQuestions: matomoTrackAnswerQuestions } =
    useMatomoTrackAnswerQuestion();

  const [filterParams] = useFilterState();

  // Fallback on searchParams if not provided to the hook.
  const params = { ...(inParams ?? filterParams), ...forcedParams };

  const queryClient = useQueryClient();

  const sortByPopularity = params.sorted !== "false";
  const fetchQuestions = async () => {
    console.log(`
      
      fetch question
      
      `);
    const { data } = await robotoff.questions(
      {
        insightType: params.insightType,
        valueTag: params.valueTag,
        sortByPopularity,
        brandFilter: params.brand,
        countryFilter: params.country,
        campaign: params.campaign,
        predictor: params.predictor,
      },
      pageSize,
      1,
    );
    return data;
  };

  const keys = React.useMemo(
    () => [
      "questions",
      params.insightType,
      params.valueTag,
      sortByPopularity,
      params.brand,
      params.country,
      params.campaign,
      params.predictor,
    ],
    [params],
  );

  const answerQuestion = React.useCallback(
    ({ question, answer }: AnswerQuestionParams) => {
      robotoff.annotate(question.insight_id, answer);

      queryClient.setQueryData<{
        questions: QuestionInterface[];
        count: number;
      }>(keys, (data) => {
        if (!data) {
          return data;
        }

        if (data.count > data.questions.length && data.questions.length <= 5) {
          // Still have other questions on server but lest than 5 on client.
          if (!mutation.isPending) {
            // Avoid multiple requests
            mutation.mutate(keys);
          }
        }
        return {
          questions: data.questions.filter(
            (q) => q.insight_id !== question.insight_id,
          ),
          count: data.count !== 100 ? data.count - 1 : 100,
        };
      });

      if (answer === CORRECT_INSIGHT || answer === WRONG_INSIGHT) {
        //Ignore the skip action
        queryClient.setQueryData<AnsweredQuestion[]>(
          ["recent-answers"],
          (data) => {
            if (!data) {
              return data;
            }
            if (data.length < ANSWERS_MEMORY_SIZE) {
              return [{ ...question, answer }, ...data];
            }
            return [{ ...question, answer }, ...data.slice(0, data.length - 1)];
          },
        );
      }

      matomoTrackAnswerQuestions(answer);
    },
    [],
  );

  const { data: recentAnswers } = useQuery({
    queryKey: ["recent-answers"],
    queryFn: (): AnsweredQuestion[] => [],
  });
  const { data, status, isFetching } = useQuery({
    queryKey: keys,
    queryFn: fetchQuestions,
  });
  const mutation = useMutation({
    mutationFn: async (keys: (string | boolean)[]) => {
      return await fetchQuestions();
    },
    onSuccess: (data, variables) => {
      console.log("onSuccess", data);

      queryClient.setQueryData<{
        questions: QuestionInterface[];
        count: number;
      }>(variables, (currentQuestions) => {
        console.log("set values", currentQuestions);
        if (!currentQuestions) {
          return {
            questions: data.questions,
            count: data.count,
          };
        }

        const seenIds = new Set([
          ...currentQuestions.questions.map((q) => q.insight_id),
        ]);
        console.log({
          prev: currentQuestions.questions.map((q) => q.insight_id),
          next: data.questions.map((q) => q.insight_id),
        });
        return {
          questions: [
            ...currentQuestions.questions,
            ...data.questions.filter((q) => !seenIds.has(q.insight_id)),
          ],
          count: data.count,
        };
      });
    },
  });

  const questions = data?.questions ?? [];
  const question = questions[0] ?? null;
  const questionsCount = data?.count ?? null;
  return {
    question,
    questions,
    questionsCount,
    status,
    answerQuestion,
    recentAnswers: recentAnswers ?? [],
  };
}
