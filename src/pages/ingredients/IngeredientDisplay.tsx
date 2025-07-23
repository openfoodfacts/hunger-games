import * as React from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import LoadingButton from "@mui/lab/LoadingButton";
import { useTheme } from "@mui/material";

import { useTranslation } from "react-i18next";

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
  is_in_taxonomy: 1 | 0
};

function getColor(ingredient: ParsedIngredientsType) {
  if (ingredient.is_in_taxonomy) { return 'green' }
  return 'red'

}

function getTitle(ingredient: ParsedIngredientsType) {
  if (ingredient.is_in_taxonomy) { return 'Ingredient dans la taxonomie' }
  return 'Ingrédient inconnu'

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

  let lastIndex = 0;

  return [
    ...flattendIngredients.map((ingredient, i) => {
      // Don't ask me why OFF use this specific character
      const ingredientText = ingredient.text.replace("‚", ",").toLowerCase();

      const startIndex = text.toLowerCase().indexOf(ingredientText, lastIndex);
      if (startIndex < 0) {
        return null;
      }
      const endIndex = startIndex + ingredient.text.length;

      const prefix = text.slice(lastIndex, startIndex);
      const ingredientName = text.slice(startIndex, endIndex);
      lastIndex = endIndex;

      return (
        <React.Fragment key={i}>
          <span>{prefix}</span>

          <Tooltip title={getTitle(ingredient)} enterDelay={500}>
            <span style={{ color: getColor(ingredient) }}>
              {ingredientName}
            </span>
          </Tooltip>
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

export function IngredientAnotation(props) {
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
