import { DEFAULT_FILTER_STATE } from "../../components/QuestionFilter/const";
import { OFF_DOMAIN } from "../../const";

type CardProps = {
  filterState: typeof DEFAULT_FILTER_STATE;
  title: string;
  imageSrc: string;
};

const greenScoreCards: CardProps[] = [
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:organic",
    },
    title: "en:organic",
    imageSrc: `https://images.${OFF_DOMAIN}/images/lang/fr/labels/bio.96x90.png`,
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:eu-organic",
    },
    title: "en:eu-organic",
    imageSrc: `https://images.${OFF_DOMAIN}/images/lang/en/labels/eu-organic.135x90.svg`,
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "fr:ab-agriculture-biologique",
    },
    title: "fr:ab-agriculture-biologique",
    imageSrc: `https://images.${OFF_DOMAIN}/images/lang/fr/labels/ab-agriculture-biologique.74x90.svg`,
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:eg-oko-verordnung",
    },
    title: "en:eg-oko-verordnung",
    imageSrc: `https://images.${OFF_DOMAIN}/images/lang/de/labels/eg-oko-verordnung.110x90.svg`,
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "fr:haute-valeur-environnementale",
    },
    title: "fr:haute-valeur-environnementale",
    imageSrc: `https://images.${OFF_DOMAIN}/images/lang/fr/labels/haute-valeur-environnementale.90x90.svg`,
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "fr:label-rouge",
    },
    title: "fr:label-rouge",
    imageSrc: `https://images.${OFF_DOMAIN}/images/lang/fr/labels/label-rouge.90x90.svg`,
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "fr:bleu-blanc-coeur",
    },
    title: "fr:bleu-blanc-coeur",
    imageSrc: `https://images.${OFF_DOMAIN}/images/lang/fr/labels/bleu-blanc-coeur.98x90.svg`,
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:roundtable-on-sustainable-palm-oil",
    },
    title: "en:roundtable-on-sustainable-palm-oil",
    imageSrc: `https://images.${OFF_DOMAIN}/images/lang/en/labels/roundtable-on-sustainable-palm-oil.90x90.svg`,
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:rainforest-alliance",
    },
    title: "en:rainforest-alliance",
    imageSrc: `https://images.${OFF_DOMAIN}/images/lang/en/labels/rainforest-alliance.90x90.svg`,
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:fairtrade-international",
    },
    title: "en:fairtrade-international",
    imageSrc: `https://images.${OFF_DOMAIN}/images/lang/en/labels/fairtrade-international.77x90.svg`,
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:max-havelaar",
    },
    title: "en:Max-Havelaar",
    imageSrc: `https://images.${OFF_DOMAIN}/images/lang/en/labels/max-havelaar.64x90.svg`,
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:sustainable-seafood-msc",
    },
    title: "en:sustainable-seafood-msc",
    imageSrc: `https://images.${OFF_DOMAIN}/images/lang/en/labels/sustainable-seafood-msc.126x90.svg`,
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:responsible-aquaculture-asc",
    },
    title: "en:responsible-aquaculture-asc",
    imageSrc: `https://images.${OFF_DOMAIN}/images/lang/en/labels/responsible-aquaculture-asc.188x90.svg`,
  },
];

export default greenScoreCards;
