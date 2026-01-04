import * as React from "react";
import styles from "./IngeredientDisplay.module.css";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import LoadingButton from "@mui/lab/LoadingButton";
import { useTheme } from "@mui/material";

import { useTranslation } from "react-i18next";

import off from "../../off";
import { useIngredientParsing } from "./useIngredientParsing";

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

// --- Helper functions moved to top-level ---
function getColorClass(ingredient: ParsedIngredientsType) {
  if (ingredient.ciqual_proxy_food_code !== undefined)
    return styles["ingredient-green"];
  if (ingredient.vegetarian !== undefined)
    return styles["ingredient-lightgreen"];
  if (ingredient.ingredients !== undefined) return styles["ingredient-blue"];
  return styles["ingredient-orange"];
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
}): React.ReactNode {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Removed unused color arrays

  if (ingredients === undefined) {
    // Without parsing, we just split with coma
    return text.split(",").map((txt, i) => (
      <React.Fragment key={i}>
        <span
          className={
            isDark ? styles[`altDark${i % 2}`] : styles[`altLight${i % 2}`]
          }
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

  // Build the output fragments without mutating lastIndex
  const fragments: React.ReactNode[] = [];
  let lastIndex = 0;
  flattendIngredients.forEach((ingredient, i) => {
    const ingredientText = ingredient.text.replace("‚", ",").toLowerCase();
    const startIndex = text.toLowerCase().indexOf(ingredientText, lastIndex);
    if (startIndex < 0) {
      return;
    }
    const endIndex = startIndex + ingredient.text.length;
    const prefix = text.slice(lastIndex, startIndex);
    const ingredientName = text.slice(startIndex, endIndex);
    fragments.push(
      <React.Fragment key={i}>
        <span>{prefix}</span>
        <Tooltip title={getTitle(ingredient)} enterDelay={500}>
          <span className={getColorClass(ingredient)}>{ingredientName}</span>
        </Tooltip>
      </React.Fragment>,
    );
    lastIndex = endIndex;
  });
  fragments.push(text.slice(lastIndex, text.length));
  return fragments;
}

type IngredientDisplayProps = {
  text: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  parsings: Record<string, ParsedIngredientsType[] | undefined>;
};

export function IngeredientDisplay({
  text,
  onChange,
  parsings,
}: IngredientDisplayProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <div
      id="demoSource-:rd:"
      className={
        isDark ? styles.ingredientDisplayDark : styles.ingredientDisplayLight
      }
    >
      <pre aria-hidden="true" className={styles.ingredientPre}>
        <code>
          <ColorText text={text} ingredients={parsings[text]} />
        </code>
      </pre>
      <textarea
        className={
          isDark
            ? styles.ingredientTextareaDark
            : styles.ingredientTextareaLight
        }
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        data-gramm="false"
        tabIndex={-1}
        onChange={onChange}
        value={text}
        title="Edit ingredient text"
        placeholder="Edit ingredient text"
      />
    </div>
  );
}

type IngredientAnotationProps = {
  lang: string;
  score: number;
  code: string;
  text: string;
  detectedText: string;
  setEditedState: React.Dispatch<
    React.SetStateAction<Record<string, { text: string }>>
  >;
};

export function IngredientAnotation(props: IngredientAnotationProps) {
  const { t } = useTranslation();
  const { lang, score, code, setEditedState, text, detectedText } = props;
  const { isLoading, fetchIngredients, parsings } = useIngredientParsing();

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
        <LoadingButton
          onClick={() => fetchIngredients(text, lang)}
          fullWidth
          loading={isLoading}
          disabled={!text}
          variant="outlined"
        >
          {t("ingredients.parsing")}
        </LoadingButton>
        <Button
          onClick={() => off.setIngedrient({ code, lang, text })}
          variant="contained"
          disabled={!text}
          color="success"
          fullWidth
        >
          {t("ingredients.send")}
        </Button>
      </Stack>
    </Stack>
  );
}
