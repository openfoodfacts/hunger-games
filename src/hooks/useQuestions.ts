import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMatomoTrackAnswerQuestion } from "./matomoEvents";
import robotoff, { QuestionInterface, FilterState } from "../robotoff";
import { useFilterState } from "./useFilterState";
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
  forcedParams?: Partial<FilterState>;
  /**
   * The number of questions per page.
   * @default 20
   */
  pageSize?: number;
}

/**
 * Helper ensuring consistency between the keys of the main useQuestions hook and the useQuestionsQuery hook
 */
const getQuestionKeys = (params: FilterState) => [
  "questions",
  params.insightType,
  params.valueTag,
  params.sorted !== "false",
  params.brand,
  params.country,
  params.campaign,
  params.predictor,
];

export function useQuestionsQuery(valueTag: string) {
  const [filterParams] = useFilterState();

  const sortByPopularity = filterParams.sorted !== "false";
  const fetchQuestions = async () => {
    const { data } = await robotoff.questions(
      {
        insightType: filterParams.insightType,
        valueTag,
        sortByPopularity,
        brandFilter: filterParams.brand,
        countryFilter: filterParams.country,
        campaign: filterParams.campaign,
        predictor: filterParams.predictor,
        with_image: true,
      },
      20,
      1,
    );
    return data;
  };

  const { data, status } = useQuery({
    queryKey: getQuestionKeys({ ...filterParams, valueTag }),
    queryFn: fetchQuestions,
  });
  return {
    status,
    count: data?.count,
  };
}
/**
 * Infinitely fetch questions according to some filter params.
 * Params can either be passed as to the hook.
 * If not the params will be derived from the URLSearchParameters
 */
export default function useQuestions(
  inParams?: FilterState,
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
    const { data } = await robotoff.questions(
      {
        insightType: params.insightType,
        valueTag: params.valueTag,
        sortByPopularity,
        brandFilter: params.brand,
        countryFilter: params.country,
        campaign: params.campaign,
        predictor: params.predictor,
        with_image: true,
      },
      pageSize,
      1,
    );
    return data;
  };

  const keys = React.useMemo(() => getQuestionKeys(params), [params]);
  const mutation = useMutation({
    mutationFn: fetchQuestions,

    onSuccess: (data) => {
      queryClient.setQueryData<{
        questions: QuestionInterface[];
        count: number;
      }>(keys, (currentQuestions) => {
        if (!currentQuestions) {
          return {
            questions: data.questions,
            count: data.count,
          };
        }

        const seenIds = new Set(
          currentQuestions.questions.map((q) => q.insight_id),
        );

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
          // Still have other questions on server but less than 5 on client.
          if (!mutation.isPending) {
            // Avoid multiple requests
            mutation.mutate();
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
    [mutation, keys, queryClient, matomoTrackAnswerQuestions],
  );

  const { data: recentAnswers } = useQuery({
    queryKey: ["recent-answers"],
    queryFn: (): AnsweredQuestion[] => [],
  });
  const { data, status } = useQuery({
    queryKey: keys,
    queryFn: fetchQuestions,
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
