import * as React from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { useTheme } from "@mui/material";

import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";

import off from "../../off";

type BooleanEstimation = "no" | "yes" | "maybe";
export type ParsedIngredientsType = {
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

function getTitle(ingredient: ParsedIngredientsType) {
  if (ingredient.ciqual_proxy_food_code !== undefined)
    return "This ingredient has CIQUAL id";
  if (ingredient.vegetarian !== undefined) return "recognised as a vegetarian";
  if (ingredient.ingredients !== undefined) return "contains sub ingredients";
  return `unknown ingredient: ${ingredient.text}"`;
}
function ColorText({
  text,
  ingredients,
}: {
  text: string;
  ingredients?: ParsedIngredientsType[];
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const lightColors = ["gray", "black"];
  const darkColors = ["lightgray", "white"];

  if (ingredients === undefined) {
    // Without parsing, we just split with coma
    return text.split(",").map((txt, i) => (
      <React.Fragment key={i}>
        <span
          style={{ color: isDark ? darkColors[i % 2] : lightColors[i % 2] }}
        >
          {txt}
        </span>
        {i === text.split(",").length - 1 ? "" : ","}
      </React.Fragment>
    ));
  }

  const flattendIngredients = ingredients.flatMap(
    ({ ingredients, ...ingredient }) => [ingredient, ...(ingredients || [])],
  );

  const { parts, lastIndex } = flattendIngredients.reduce<{
    parts: React.ReactNode[];
    lastIndex: number;
  }>(
    (accumulator, ingredient, i) => {
      // Don't ask me why OFF use this specific character
      const ingredientText = ingredient.text.replace("‚", ",").toLowerCase();

      const startIndex = text
        .toLowerCase()
        .indexOf(ingredientText, accumulator.lastIndex);
      if (startIndex < 0) {
        return accumulator;
      }
      const endIndex = startIndex + ingredient.text.length;

      const prefix = text.slice(accumulator.lastIndex, startIndex);
      const ingredientName = text.slice(startIndex, endIndex);

      return {
        lastIndex: endIndex,
        parts: [
          ...accumulator.parts,
          <React.Fragment key={i}>
            <span>{prefix}</span>

            <Tooltip title={getTitle(ingredient)} enterDelay={500}>
              <span style={{ color: getColor(ingredient) }}>
                {ingredientName}
              </span>
            </Tooltip>
          </React.Fragment>,
        ],
      };
    },
    { parts: [], lastIndex: 0 },
  );

  return [...parts, text.slice(lastIndex, text.length)];
}

function useIngredientParsing() {
  const [isLoading, setLoading] = React.useState(false);
  const [parsings, setParsing] = React.useState<
    Record<string, ParsedIngredientsType[] | undefined>
  >({});

  async function fetchIngredients(text: string, lang: string) {
    setLoading(true);
    try {
      const parsing = await off.getIngredientParsing<ParsedIngredientsType[]>({
        text,
        lang,
      });
      const ingredients = parsing.data?.product?.ingredients;
      setParsing((prev) => ({ ...prev, [text]: ingredients }));
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return { isLoading, fetchIngredients, parsings };
}

type IngeredientDisplayProps = {
  text: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  parsings: Record<string, ParsedIngredientsType[] | undefined>;
};

export function IngeredientDisplay({
  text,
  onChange,
  parsings,
}: IngeredientDisplayProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

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
        minHeight: "3rem",
        border: `solid ${isDark ? "white" : "black"} 1px`,
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
          // pointerEvents: "none",
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
          color: isDark ? "white" : "black",
          WebkitTextFillColor: "transparent",
        }}
        value={text}
      />
    </div>
  );
}

type Detection = { start: number; end: number; score: number; text: string };
type IngredientAnotationProps = {
  lang: string;
  score: number | null;
  code: string;
  setEditedState: React.Dispatch<
    React.SetStateAction<Record<string, Detection>>
  >;
  text: string;
  detectedText: string;
};

export function IngredientAnotation({
  lang,
  score,
  code,
  setEditedState,
  text,
  detectedText,
}: IngredientAnotationProps) {
  const { t } = useTranslation();
  const { isLoading, fetchIngredients, parsings } = useIngredientParsing();
  const saveIngredient = useMutation({
    mutationFn: () => off.setIngedrient({ code, lang, text }),
  });

  return (
    <Stack direction="column" sx={{ mt: 2 }}>
      <Typography>
        {lang}
        {score === null ? (
          <span> ({t("ingredients.current_text")})</span>
        ) : (
          <span>
            {" "}
            ({t("ingredients.confidence_score")}: {(score * 100).toFixed(1)}%)
          </span>
        )}
      </Typography>
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
          {t("ingredients.revert")}
        </Button>
        <Button
          onClick={() => void fetchIngredients(text, lang)}
          fullWidth
          loading={isLoading}
          disabled={!text}
          variant="outlined"
        >
          {t("ingredients.parsing")}
        </Button>
        <Button
          onClick={() => saveIngredient.mutate()}
          variant="contained"
          disabled={!text}
          loading={saveIngredient.isPending}
          color="success"
          fullWidth
        >
          {t("ingredients.send")}
        </Button>
      </Stack>
      {saveIngredient.error && (
        <Typography color="error">
          Unable to save ingredients: {saveIngredient.error.message}
        </Typography>
      )}
    </Stack>
  );
}
