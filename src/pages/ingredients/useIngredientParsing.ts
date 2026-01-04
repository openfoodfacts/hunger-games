import React from "react";
import off from "../../off";

export function useIngredientParsing() {
  const [isLoading, setLoading] = React.useState(false);
  const [parsings, setParsing] = React.useState({});

  async function fetchIngredients(text: string, lang: string) {
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
