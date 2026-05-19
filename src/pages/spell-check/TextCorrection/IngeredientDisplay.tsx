import * as React from "react";
import Tooltip from "@mui/material/Tooltip";

import { useTheme } from "@mui/material";
import { ParsedIngredientsType } from "./ingredients.types";

function getColor(ingredient: ParsedIngredientsType) {
  if (ingredient.is_in_taxonomy === 1) return "green";
  if (ingredient.is_in_taxonomy === 0) return "orange";
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

      // eslint-disable-next-line react-hooks/immutability
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

export function IngeredientDisplay(props: {
  text: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  parsings: { [key: string]: ParsedIngredientsType[] };
}) {
  const { text, onChange, parsings } = props;

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <div>
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
      <ul>
        <li>
          <span style={{ color: "green" }}>green</span>: ingrédient dans la
          taxonomy
        </li>
        <li>
          <span style={{ color: "orange" }}>orange</span>: ingrédient inconnu
        </li>
      </ul>
    </div>
  );
}
