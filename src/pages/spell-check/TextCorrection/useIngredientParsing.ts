import * as React from "react";
import off from "../../../off";
import { ParsedIngredientsType } from "./ingredients.types";

export function useIngredientParsing() {
  const [isLoading, setLoading] = React.useState(false);
  const [parsings, setParsing] = React.useState<{
    [key: string]: ParsedIngredientsType[];
  }>({});

  async function fetchIngredients(text: string, lang: string) {
    if (parsings[text] !== undefined) {
      return;
    }

    setLoading(true);
    const parsing = await off.getIngedrientParsing({
      text,
      lang,
    });
    const ingredients = parsing.data?.product?.ingredients;
    setParsing((prev) => ({ ...prev, [text]: ingredients }));
    setLoading(false);
  }

  return { isLoading, fetchIngredients, parsings };
}
