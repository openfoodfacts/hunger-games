export type LogoDefinition = {
  /**
   * The OpenFoodFacts tag used or interactions with robotoff and off
   */
  tag: string;
  /**
   * The name of the logo
   */
  label: string;
  /**
   * The url of the logo
   */
  logo: string;
  /**
   * A message to provide informations about the logo
   */
  message?: string;
  /**
   * A URL of the deifinition of the logo
   */
  link?: string;
  /**
   * To specify if the game needs to be restricted to a specific robotoff predictor
   * @default "universal-logo-detector"
   */
  predictor?: string;
};

export const LOGOS = {
  // Nutriscore
  "en:nutriscore-grade-a": {
    tag: "en:nutriscore-grade-a",
    label: "Nutriscore A",
    logo: "https://static.openfoodfacts.org/images/attributes/nutriscore-a.svg",
    predictor: null,
  },
  "en:nutriscore-grade-b": {
    tag: "en:nutriscore-grade-b",
    label: "Nutriscore B",
    logo: "https://static.openfoodfacts.org/images/attributes/nutriscore-b.svg",
    predictor: null,
  },
  "en:nutriscore-grade-c": {
    tag: "en:nutriscore-grade-c",
    label: "Nutriscore C",
    logo: "https://static.openfoodfacts.org/images/attributes/nutriscore-c.svg",
    predictor: null,
  },
  "en:nutriscore-grade-d": {
    tag: "en:nutriscore-grade-d",
    label: "Nutriscore D",
    logo: "https://static.openfoodfacts.org/images/attributes/nutriscore-d.svg",
    predictor: null,
  },
  "en:nutriscore-grade-e": {
    tag: "en:nutriscore-grade-e",
    label: "Nutriscore E",
    logo: "https://static.openfoodfacts.org/images/attributes/nutriscore-e.svg",
    predictor: null,
  },
  // INAO
  "fr:ab-agriculture-biologique": {
    tag: "fr:ab-agriculture-biologique",
    label: "AB (Agriculture Bio)",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/ab-agriculture-biologique.74x90.svg",
  },
  "en:eu-organic": {
    tag: "en:eu-organic",
    label: "Bio Européen",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/bio-europeen.135x90.png",
  },
  "en:pdo": {
    tag: "en:pdo",
    label: "AOP (Appelation d'Origine Protégée)",
    link: "https://www.inao.gouv.fr/Les-signes-officiels-de-la-qualite-et-de-l-origine-SIQO/Appellation-d-origine-protegee-controlee-AOP-AOC",
    message: "Ne pas confondre avec IGP ou STG",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/aop.90x90.svg",
  },
  "en:pgi": {
    tag: "en:pgi",
    label: "IGP (Indication Géographique Protégée)",
    link: "https://www.inao.gouv.fr/Les-signes-officiels-de-la-qualite-et-de-l-origine-SIQO/Indication-geographique-protegee",
    message: "Ne pas confondre avec  AOP ou STG",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/igp.90x90.svg",
  },
  "en:tsg": {
    tag: "en:tsg",
    label: "Spécialité traditionnelle garantie (STG)",
    link: "https://www.inao.gouv.fr/Les-signes-officiels-de-la-qualite-et-de-l-origine-SIQO/Specialite-traditionnelle-garantie-STG",
    message: "Ne pas confondre avec IGP ou AOP",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/stg.90x90.svg",
  },
  "fr:label-rouge": {
    tag: "fr:label-rouge",
    label: "Label Rouge",
    link: "https://www.inao.gouv.fr/Les-signes-officiels-de-la-qualite-et-de-l-origine-SIQO/Label-Rouge",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/label-rouge.90x90.svg",
  },

  // Eco-score
  "en:organic": {
    tag: "en:organic",
    label: "Bio",
    logo: "https://world-fr.openfoodfacts.org/images/lang/fr/labels/bio.96x90.png",
  },
  "en:eg-oko-verordnung": {
    tag: "en:eg-oko-verordnung",
    label: "eg oko verordnung",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/labels/eg-oko-verordnung.110x90.svg",
  },
  "fr:haute-valeur-environnementale": {
    tag: "fr:haute-valeur-environnementale",
    label: "Haute Valeur Environnementale",
    logo: "https://world-fr.openfoodfacts.org/images/lang/fr/labels/haute-valeur-environnementale.90x90.svg",
  },
  "fr:bleu-blanc-coeur": {
    tag: "fr:bleu-blanc-coeur",
    label: "Bleu Blanc Coeur",
    logo: "https://world-fr.openfoodfacts.org/images/lang/fr/labels/bleu-blanc-coeur.98x90.svg",
  },
  "en:roundtable-on-sustainable-palm-oil": {
    tag: "en:roundtable-on-sustainable-palm-oil",
    label: "Roundtable on sustainable palm oil",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/labels/roundtable-on-sustainable-palm-oil.90x90.svg",
  },
  "en:rainforest-alliance": {
    tag: "en:rainforest-alliance",
    label: "Rainforest Alliance",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/labels/rainforest-alliance.90x90.svg",
  },
  "en:fairtrade-international": {
    tag: "en:fairtrade-international",
    label: "Fairtrade International",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/labels/fairtrade-international.77x90.svg",
  },
  "en:max-havelaar": {
    tag: "en:max-havelaar",
    label: "Max Havelaar",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/labels/max-havelaar.64x90.svg",
  },
  "en:sustainable-seafood-msc": {
    tag: "en:sustainable-seafood-msc",
    label: "Sustainable seafood msc",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/labels/sustainable-seafood-msc.126x90.svg",
  },
  "en:responsible-aquaculture-asc": {
    tag: "en:responsible-aquaculture-asc",
    label: "responsible aquaculture asc",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/labels/responsible-aquaculture-asc.188x90.svg",
  },
};

type DashBoardTheme = {
  /**
   * The tag used in the URL to identify the section
   */
  tag: string;
  /**
   * The name used for the section
   */
  title: string;
  /**
   * The logos associated to this theme
   */
  logos: (keyof typeof LOGOS)[];
};

export const DASHBOARD: DashBoardTheme[] = [
  {
    tag: "nutriscore",
    title: "NutriScore",
    logos: [
      "en:nutriscore-grade-a",
      "en:nutriscore-grade-b",
      "en:nutriscore-grade-c",
      "en:nutriscore-grade-d",
      "en:nutriscore-grade-e",
    ],
  },
  {
    tag: "eco-score",
    title: "EcoScore",
    logos: [
      "en:organic",
      "en:eu-organic",
      "fr:ab-agriculture-biologique",
      "en:eg-oko-verordnung",
      "fr:haute-valeur-environnementale",
      "fr:label-rouge",
      "fr:bleu-blanc-coeur",
      "en:roundtable-on-sustainable-palm-oil",
      "en:rainforest-alliance",
      "en:fairtrade-international",
      "en:max-havelaar",
      "en:sustainable-seafood-msc",
      "en:responsible-aquaculture-asc",
    ],
  },
  {
    tag: "inao",
    title: "INAO",
    logos: [
      "fr:ab-agriculture-biologique",
      "en:eu-organic",
      "en:pdo",
      "en:pgi",
      "en:tsg",
      "fr:label-rouge",
    ],
  },
];
