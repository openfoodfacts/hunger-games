import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import off from "../../off";

// https://world-fr.openfoodfacts.org/produit/4056489216155/creme-dessert-saveur-vanille-lidl-envia
const correctTxt =
  "lait écrémé (Origine: Allemagne), protéines de lait crème (lait (Origine: Allemagne)), amidon modifié de tapioca, épaississants: carraghénanes, carboxyméthyl-cellulose sodique 7% extrait de carthame, arôme naturel de vanille, arôme naturel, édulcorants: acésulfame-K, sucralose, lactase.";
const correctData = [
  {
    ciqual_proxy_food_code: "19051",
    id: "en:skimmed-milk",
    origins: "en:germany",
    percent_estimate: 55,
    percent_max: 100,
    percent_min: 10,
    text: "lait écrémé",
    vegan: "no",
    vegetarian: "yes",
  },
  {
    id: "fr:proteines-de-lait-creme",
    ingredients: [
      {
        ciqual_proxy_food_code: "19051",
        id: "en:milk",
        origins: "en:germany",
        percent_estimate: 22.5,
        percent_max: 50,
        percent_min: 0,
        text: "lait",
        vegan: "no",
        vegetarian: "yes",
      },
    ],
    percent_estimate: 22.5,
    percent_max: 50,
    percent_min: 0,
    text: "protéines de lait crème",
  },
  {
    id: "en:modified-tapioca-starch",
    percent_estimate: 11.25,
    percent_max: 33.3333333333333,
    percent_min: 0,
    text: "amidon modifié de tapioca",
    vegan: "yes",
    vegetarian: "yes",
  },
  {
    id: "en:thickener",
    ingredients: [
      {
        id: "en:e407",
        percent_estimate: 5.625,
        percent_max: 25,
        percent_min: 0,
        text: "carraghénanes",
        vegan: "yes",
        vegetarian: "yes",
      },
    ],
    percent_estimate: 5.625,
    percent_max: 25,
    percent_min: 0,
    text: "épaississants",
  },
  {
    id: "fr:carboxymethyl-cellulose-sodique-7-extrait-de-carthame",
    percent_estimate: 2.8125,
    percent_max: 20,
    percent_min: 0,
    text: "carboxyméthyl-cellulose sodique 7% extrait de carthame",
  },
  {
    id: "en:natural-vanilla-flavouring",
    percent_estimate: 1.40625,
    percent_max: "5",
    percent_min: 0,
    text: "arôme naturel de vanille",
    vegan: "yes",
    vegetarian: "yes",
  },
  {
    id: "en:natural-flavouring",
    percent_estimate: 0.703125,
    percent_max: "5",
    percent_min: 0,
    text: "arôme naturel",
    vegan: "maybe",
    vegetarian: "maybe",
  },
  {
    id: "en:sweetener",
    ingredients: [
      {
        id: "en:e950",
        percent_estimate: 0.3515625,
        percent_max: "5",
        percent_min: 0,
        text: "acésulfame-K",
        vegan: "yes",
        vegetarian: "yes",
      },
    ],
    percent_estimate: 0.3515625,
    percent_max: "5",
    percent_min: 0,
    text: "édulcorants",
  },
  {
    id: "en:e955",
    percent_estimate: 0.17578125,
    percent_max: "5",
    percent_min: 0,
    text: "sucralose",
    vegan: "yes",
    vegetarian: "yes",
  },
  {
    id: "en:lactase",
    percent_estimate: 0.17578125,
    percent_max: "5",
    percent_min: 0,
    text: "lactase",
    vegan: "maybe",
    vegetarian: "maybe",
  },
];
const badTxt =
  "lait écr (Origine: Allemagne), protéines de lait crème (lait (Origine: Almagne)), amidon modifié de tapioca, épaississants: carraghénanes, carboxyméthyl-cellulose sodique 7% extrait de carthame, arôme naturel de vanille, arôme naturel, édulcorants: acésulfame-K, sucralose lactase.";
const badData = [
  {
    id: "fr:lait-ecr",
    origins: "en:germany",
    percent_estimate: 55.5555555555556,
    percent_max: 100,
    percent_min: 11.1111111111111,
    text: "lait écr",
  },
  {
    id: "fr:proteines-de-lait-creme",
    ingredients: [
      {
        ciqual_proxy_food_code: "19051",
        id: "en:milk",
        origins: "fr:Almagne",
        percent_estimate: 22.2222222222222,
        percent_max: 50,
        percent_min: 0,
        text: "lait",
        vegan: "no",
        vegetarian: "yes",
      },
    ],
    percent_estimate: 22.2222222222222,
    percent_max: 50,
    percent_min: 0,
    text: "protéines de lait crème",
  },
  {
    id: "en:modified-tapioca-starch",
    percent_estimate: 11.1111111111111,
    percent_max: 33.3333333333333,
    percent_min: 0,
    text: "amidon modifié de tapioca",
    vegan: "yes",
    vegetarian: "yes",
  },
  {
    id: "en:thickener",
    ingredients: [
      {
        id: "en:e407",
        percent_estimate: 5.55555555555556,
        percent_max: 25,
        percent_min: 0,
        text: "carraghénanes",
        vegan: "yes",
        vegetarian: "yes",
      },
    ],
    percent_estimate: 5.55555555555556,
    percent_max: 25,
    percent_min: 0,
    text: "épaississants",
  },
  {
    id: "fr:carboxymethyl-cellulose-sodique-7-extrait-de-carthame",
    percent_estimate: 2.77777777777778,
    percent_max: 20,
    percent_min: 0,
    text: "carboxyméthyl-cellulose sodique 7% extrait de carthame",
  },
  {
    id: "en:natural-vanilla-flavouring",
    percent_estimate: 1.38888888888889,
    percent_max: "5",
    percent_min: 0,
    text: "arôme naturel de vanille",
    vegan: "yes",
    vegetarian: "yes",
  },
  {
    id: "en:natural-flavouring",
    percent_estimate: 0.694444444444443,
    percent_max: "5",
    percent_min: 0,
    text: "arôme naturel",
    vegan: "maybe",
    vegetarian: "maybe",
  },
  {
    id: "en:sweetener",
    ingredients: [
      {
        id: "en:e950",
        percent_estimate: 0.347222222222221,
        percent_max: "5",
        percent_min: 0,
        text: "acésulfame-K",
        vegan: "yes",
        vegetarian: "yes",
      },
    ],
    percent_estimate: 0.347222222222221,
    percent_max: "5",
    percent_min: 0,
    text: "édulcorants",
  },
  {
    id: "fr:sucralose-lactase",
    percent_estimate: 0.347222222222229,
    percent_max: "5",
    percent_min: 0,
    text: "sucralose lactase",
  },
];

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
  return text.split(",").map((txt, i) => {
    if (ingredients === undefined) {
      // Without parsing, we just split with comas
      return (
        <React.Fragment key={i}>
          <span style={{ color: i % 2 === 0 ? "blue" : "red" }}>{txt}</span>
          {i === text.split(",").length - 1 ? "" : ","}
        </React.Fragment>
      );
    }

    // With ingredients, we can try something more complex
    const ingredient = ingredients[i];
    const startIndex = txt.indexOf(ingredient.text);
    const endIndex = startIndex + ingredient.text.length;

    const prefix = txt.slice(0, startIndex);
    const ingredientName = txt.slice(startIndex, endIndex);
    const sufix = txt.slice(endIndex);

    return (
      <React.Fragment key={i}>
        <span>{prefix}</span>
        <span style={{ color: getColor(ingredient) }}>{ingredientName}</span>
        {ingredient.ingredients ? (
          <ColorText text={sufix} ingredients={ingredient.ingredients} />
        ) : (
          <span>{sufix}</span>
        )}
        {i === text.split(",").length - 1 ? "" : ","}
      </React.Fragment>
    );
  });
}
export default function ExperimentTextField() {
  const [text, setText] = React.useState(correctTxt);
  const [isLoading, setLoading] = React.useState(false);
  const [parsings, setParsing] = React.useState({});
  // const [parsings, setParsing] = React.useState({ [correctTxt]: correctData });
  return (
    <div>
      <ol>
        <li style={{ color: "orange" }}>No additional data</li>
        <li style={{ color: "green" }}>With vegeterian info</li>
        <li style={{ color: "lightgreen" }}>With CIQUAL code</li>
        <li style={{ color: "blue" }}>With sub ingredients</li>
      </ol>
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
          onChange={(event) => setText(event.target.value)}
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
            // color: "inherit",
            overflow: "hidden",
            padding: "16px",
            WebkitTextFillColor: "transparent",
          }}
          value={text}
        ></textarea>
      </div>
      <button
        onClick={async () => {
          setLoading(true);
          const parsing = await off.getIngedrientParsing({
            text: text,
            lang: "fr",
          });
          const ingredients = parsing.data?.product?.ingredients;
          setParsing((prev) => ({ ...prev, [text]: ingredients }));
          setLoading(false);
        }}
      >
        parse
      </button>
      {isLoading && "loading"}
      <div>
        {parsings[text]?.map((ingredient) => (
          <Accordion key={ingredient.id}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={ingredient.id}
              id={`header-${ingredient.id}`}
            >
              <span style={{ color: getColor(ingredient) }}>
                {ingredient.text}
              </span>
            </AccordionSummary>
            <AccordionDetails>
              <pre>{JSON.stringify(ingredient, null, 2)}</pre>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    </div>
  );
}
