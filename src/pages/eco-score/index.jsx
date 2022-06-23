import * as React from "react";

import Box from "@mui/material/Box";

import QuestionCard from "../../components/QuestionCard";
import { DEFAULT_FILTER_STATE } from "../../components/QuestionFilter/const";

const ecoScoreCards = [
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:organic",
    },
    title: "en:organic",
    imageSrc:
      "https://world-fr.openfoodfacts.org/images/lang/fr/labels/bio.96x90.png",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:eu-organic",
    },
    title: "en:eu-organic",
    imageSrc:
      "https://world.openfoodfacts.org/images/lang/en/labels/eu-organic.135x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:ab-agriculture-biologique",
    },
    title: "en:ab-agriculture-biologique",
    imageSrc:
      "https://world.openfoodfacts.org/images/lang/en/labels/ab-agriculture-biologique.74x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:eg-oko-verordnung",
    },
    title: "en:eg-oko-verordnung",
    imageSrc:
      "https://world-fr.openfoodfacts.org/images/lang/en/labels/eg-oko-verordnung.110x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "fr:haute-valeur-environnementale",
    },
    title: "fr:haute-valeur-environnementale",
    imageSrc:
      "https://world-fr.openfoodfacts.org/images/lang/fr/labels/haute-valeur-environnementale.90x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "fr:label-rouge",
    },
    title: "fr:label-rouge",
    imageSrc:
      "https://world-fr.openfoodfacts.org/images/lang/fr/labels/label-rouge.90x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "fr:bleu-blanc-coeur",
    },
    title: "fr:bleu-blanc-coeur",
    imageSrc:
      "https://world-fr.openfoodfacts.org/images/lang/fr/labels/bleu-blanc-coeur.98x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:roundtable-on-sustainable-palm-oil",
    },
    title: "en:roundtable-on-sustainable-palm-oil",
    imageSrc:
      "https://world-fr.openfoodfacts.org/images/lang/en/labels/roundtable-on-sustainable-palm-oil.90x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:rainforest-alliance",
    },
    title: "en:rainforest-alliance",
    imageSrc:
      "https://world-fr.openfoodfacts.org/images/lang/en/labels/rainforest-alliance.90x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "fr:fairtrade",
    },
    title: "fr:fairtrade",
    imageSrc:
      "https://world-fr.openfoodfacts.org/images/lang/en/labels/fairtrade-international.77x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "fr:max-havelaar",
    },
    title: "fr:Max-Havelaar",
    imageSrc:
      "https://world-fr.openfoodfacts.org/images/lang/en/labels/fairtrade-international.77x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:sustainable-seafood-msc",
    },
    title: "en:sustainable-seafood-msc",
    imageSrc:
      "https://world-fr.openfoodfacts.org/images/lang/en/labels/sustainable-seafood-msc.126x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:responsible-aquaculture-asc",
    },
    title: "en:responsible-aquaculture-asc",
    imageSrc:
      "https://world-fr.openfoodfacts.org/images/lang/en/labels/responsible-aquaculture-asc.188x90.svg",
  },
];

export default function EcoScore() {
  return (
    <Box
      sx={{
        "&": {
          padding: 5,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
        },
      }}
    >
      {ecoScoreCards.map((props) => (
        <Box sx={{ marginBottom: 5 }} key={props.title}>
          <QuestionCard {...props} />
        </Box>
      ))}
    </Box>
  );
}
