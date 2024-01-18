import * as React from "react";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";

import off from "../../off";

type BooleanEstimation = "no" | "yes" | "maybe";
type ParsedIngredientsType = {
  ciqual_proxy_food_code?: string;
  id: string;
  ingredients?: ParsedIngredientsType[];
  origins?: string;
  percent_estimate: number;
  percent_max: number;
  percent_min: number;
  text: string;
  vegan: BooleanEstimation;
  vegetarian: BooleanEstimation;
};

function getColor(ingredient: ParsedIngredientsType) {
  if (ingredient.ciqual_proxy_food_code !== undefined) return "green";
  if (ingredient.vegetarian !== undefined) return "lightgreen";
  if (ingredient.ingredients !== undefined) return "blue";
  return "orange";
}
function ColorText({
  text,
  ingredients,
}: {
  text: string;
  ingredients?: ParsedIngredientsType[];
}) {
  if (ingredients === undefined) {
    // Without parsing, we just split with coma
    return text.split(",").map((txt, i) => (
      <React.Fragment key={i}>
        <span style={{ color: i % 2 === 0 ? "blue" : "red" }}>{txt}</span>
        {i === text.split(",").length - 1 ? "" : ","}
      </React.Fragment>
    ));
  }

  const flattendIngredients = ingredients.flatMap(
    ({ ingredients, ...ingredient }) => [ingredient, ...(ingredients || [])],
  );

  let lastIndex = 0;
  return [
    ...flattendIngredients.map((ingredient, i) => {
      const startIndex = text.indexOf(ingredient.text, lastIndex);
      const endIndex = startIndex + ingredient.text.length;

      const prefix = text.slice(lastIndex, startIndex);
      const ingredientName = text.slice(startIndex, endIndex);
      lastIndex = endIndex;
      return (
        <React.Fragment key={i}>
          <span>{prefix}</span>
          <span style={{ color: getColor(ingredient) }}>{ingredientName}</span>
        </React.Fragment>
      );
    }),
    text.slice(lastIndex, text.length),
  ];
}

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

export function IngeredientDisplay(props) {
  const { text, onChange, parsings } = props;
  console.log({ text });
  console.log({ parsings });
  return (
    <div
      id="demoSource-:rd:"
      className="css-8u7p7s"
      style={{
        position: "relative",
        textAlign: "left",
        boxSizing: "border-box",
        padding: "0px",
        overflow: "hidden",
        fontSize: "0.8125rem",
        lineHeight: 1.5,
        letterSpacing: 0,
        fontFamily: 'Menlo,Consolas,"Droid Sans Mono",monospace',
        fontWeight: 400,
        fontSmooth: "subpixel-antialiased",
        float: "left",
        minWidth: "100%",
      }}
    >
      <pre
        aria-hidden="true"
        style={{
          margin: "0px",
          border: "0px",
          background: "none",
          boxSizing: "inherit",
          display: "inherit",
          fontFamily: "inherit",
          fontSize: "inherit",
          fontStyle: "inherit",
          fontVariantLigatures: "inherit",
          fontWeight: "inherit",
          letterSpacing: "inherit",
          lineHeight: "inherit",
          tabSize: "inherit",
          textIndent: "inherit",
          textRendering: "inherit",
          textTransform: "inherit",
          wordBreak: "keep-all",
          overflowWrap: "break-word",
          position: "relative",
          pointerEvents: "none",
          padding: "16px",
          whiteSpace: "pre-wrap",
        }}
      >
        <code>
          <ColorText text={text} ingredients={parsings[text]} />
        </code>
      </pre>
      <textarea
        className="npm__react-simple-code-editor__textarea"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        data-gramm="false"
        tabIndex={-1}
        onChange={onChange}
        style={{
          margin: "0px",
          border: "0px",
          background: "none",
          boxSizing: "inherit",
          display: "inherit",
          fontFamily: "inherit",
          fontSize: "inherit",
          fontStyle: "inherit",
          fontVariantLigatures: "inherit",
          fontWeight: "inherit",
          letterSpacing: "inherit",
          lineHeight: "inherit",
          tabSize: "inherit",
          textIndent: "inherit",
          textRendering: "inherit",
          textTransform: "inherit",
          whiteSpace: "pre-wrap",
          wordBreak: "keep-all",
          overflowWrap: "break-word",
          position: "absolute",
          top: "0px",
          left: "0px",
          height: "100%",
          width: "100%",
          resize: "none",
          overflow: "hidden",
          padding: "16px",
          WebkitTextFillColor: "transparent",
        }}
        value={text}
      ></textarea>
    </div>
  );
}

export function IngredientAnotation(props) {
  const { lang, score, code, setEditedState, text, detectedText } = props;
  const { isLoading, fetchIngredients, parsings } = useIngredientParsing();

  return (
    <Stack direction="column">
      <Typography>{`${lang} (${(score * 100).toFixed(1)}%)`}</Typography>
      <Stack direction="row">
        <IngeredientDisplay
          parsings={parsings}
          text={text}
          onChange={(event) => {
            setEditedState((prev) => ({
              ...prev,
              [lang]: {
                ...prev[lang],
                text: event.target.value,
              },
            }));
          }}
        />
      </Stack>
      <Stack direction="row">
        <Button
          onClick={() => {
            setEditedState((prev) => ({
              ...prev,
              [lang]: {
                ...prev[lang],
                text: detectedText,
              },
            }));
          }}
          disabled={text === detectedText}
          variant="contained"
          fullWidth
        >
          Revert
        </Button>
        <LoadingButton
          onClick={() => fetchIngredients(text, lang)}
          fullWidth
          loading={isLoading}
        >
          get parsing
        </LoadingButton>
        <Button
          onClick={() => {
            off.setIngedrient({ code, lang, text });
          }}
          variant="contained"
          color="success"
          fullWidth
        >
          Send
        </Button>
      </Stack>
    </Stack>
  );
}
