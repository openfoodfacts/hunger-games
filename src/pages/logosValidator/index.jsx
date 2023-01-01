import LogoQuestionValidator from "./LogoQuestionValidator";

const NUTRISCORE_OPTIONS = [
  { tag: "en:nutriscore-grade-a", label: "Nutriscore A" },
  { tag: "en:nutriscore-grade-b", label: "Nutriscore B" },
  { tag: "en:nutriscore-grade-c", label: "Nutriscore C" },
  { tag: "en:nutriscore-grade-d", label: "Nutriscore D" },
  { tag: "en:nutriscore-grade-e", label: "Nutriscore E" },
];

const INAO_OTIONS = [
  {
    tag: "fr:ab-agriculture-biologique",
    label: "AB (Agriculture Bio)",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/ab-agriculture-biologique.74x90.svg",
  },
  {
    tag: "en:eu-organic",
    label: "Bio Européen",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/bio-europeen.135x90.png",
  },
  {
    tag: "en:pdo",
    label: "AOP (Appelation d'Origine Contrôlée)",
    link: "https://www.inao.gouv.fr/Les-signes-officiels-de-la-qualite-et-de-l-origine-SIQO/Appellation-d-origine-protegee-controlee-AOP-AOC",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/aop.90x90.svg",
  },
  {
    tag: "en:pgi",
    label: "IGP (Indication Géographique Protégée)",
    link: "https://www.inao.gouv.fr/Les-signes-officiels-de-la-qualite-et-de-l-origine-SIQO/Indication-geographique-protegee",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/igp.90x90.svg",
  },
  {
    tag: "en:tsg",
    label: "Spécialité traditionnelle garantie (STG)",
    link: "https://www.inao.gouv.fr/Les-signes-officiels-de-la-qualite-et-de-l-origine-SIQO/Specialite-traditionnelle-garantie-STG",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/stg.90x90.svg",
  },
  {
    tag: "fr:label-rouge",
    label: "Label Rouge",
    link: "https://www.inao.gouv.fr/Les-signes-officiels-de-la-qualite-et-de-l-origine-SIQO/Label-Rouge",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/label-rouge.90x90.svg",
  },
];

export const NutriscorePageValidator = () => {
  return <LogoQuestionValidator options={NUTRISCORE_OPTIONS} />;
};

export const INAOPageValidator = () => {
  return (
    <LogoQuestionValidator
      options={INAO_OTIONS}
      predictor="universal-logo-detector"
    />
  );
};
