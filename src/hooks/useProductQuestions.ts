import { useQuery } from "@tanstack/react-query";
import robotoff, { QuestionInterface } from "../robotoff";

/**
 * Fetch robotoff questions about a given product.
 */
export const useProductQuestions = (barcode: string | null) => {
  return useQuery({
    queryKey: ["product-question", barcode],
    queryFn: async (): Promise<QuestionInterface[]> => {
      if (!barcode) {
        return [];
      }
      return robotoff.questionsByProductCode(barcode).then((result) => {
        return result?.data?.questions ?? [];
      });
    },
  });
};
