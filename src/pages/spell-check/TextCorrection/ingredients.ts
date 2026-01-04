import { useState } from "react";
import off from "../../../off";

export function useIngredientParsing() {
  const [isLoading, setLoading] = useState(false);
  const [parsings, setParsing] = useState<Record<string, string>>({});

  async function fetchIngredients(text: string, lang: string) {
    if (parsings[text] !== undefined) {
      return;
    }

    setLoading(true);
    const parsing = await off.getIngedrientParsing({ text, lang });
    const ingredients = parsing.data?.product?.ingredients;
    setParsing((prev) => ({ ...prev, [text]: ingredients }));
    setLoading(false);
  }

  return { isLoading, fetchIngredients, parsings };
}
