type InsightType = 'label' | 'product_weight' | 'category' | 'expiration_date' | 'packager_code' | 'brand' | 'packaging' | 'qr_code'
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
   * A URL of the definition of the logo
   */
  link?: string;
  type: InsightType;
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
    type: "label"

  },
  "en:nutriscore-grade-b": {
    tag: "en:nutriscore-grade-b",
    label: "Nutriscore B",
    logo: "https://static.openfoodfacts.org/images/attributes/nutriscore-b.svg",
    predictor: null,
    type: "label"
  },
  "en:nutriscore-grade-c": {
    tag: "en:nutriscore-grade-c",
    label: "Nutriscore C",
    logo: "https://static.openfoodfacts.org/images/attributes/nutriscore-c.svg",
    predictor: null,
    type: "label"
  },
  "en:nutriscore-grade-d": {
    tag: "en:nutriscore-grade-d",
    label: "Nutriscore D",
    logo: "https://static.openfoodfacts.org/images/attributes/nutriscore-d.svg",
    predictor: null,
    type: "label"
  },
  "en:nutriscore-grade-e": {
    tag: "en:nutriscore-grade-e",
    label: "Nutriscore E",
    logo: "https://static.openfoodfacts.org/images/attributes/nutriscore-e.svg",
    predictor: null,
    type: "label"
  },
  // INAO
  "fr:ab-agriculture-biologique": {
    tag: "fr:ab-agriculture-biologique",
    label: "AB (Agriculture Bio)",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/ab-agriculture-biologique.74x90.svg",
    type: "label"
  },
  "en:eu-organic": {
    tag: "en:eu-organic",
    label: "Bio Européen",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/bio-europeen.135x90.png",
    type: "label"
  },
  "en:pdo": {
    tag: "en:pdo",
    label: "AOP (Appelation d'Origine Protégée)",
    link: "https://www.inao.gouv.fr/Les-signes-officiels-de-la-qualite-et-de-l-origine-SIQO/Appellation-d-origine-protegee-controlee-AOP-AOC",
    message: "Ne pas confondre avec IGP ou STG",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/aop.90x90.svg",
    type: "label"
  },
  "en:pgi": {
    tag: "en:pgi",
    label: "IGP (Indication Géographique Protégée)",
    link: "https://www.inao.gouv.fr/Les-signes-officiels-de-la-qualite-et-de-l-origine-SIQO/Indication-geographique-protegee",
    message: "Ne pas confondre avec  AOP ou STG",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/igp.90x90.svg",
    type: "label"
  },
  "en:tsg": {
    tag: "en:tsg",
    label: "Spécialité traditionnelle garantie (STG)",
    link: "https://www.inao.gouv.fr/Les-signes-officiels-de-la-qualite-et-de-l-origine-SIQO/Specialite-traditionnelle-garantie-STG",
    message: "Ne pas confondre avec IGP ou AOP",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/stg.90x90.svg",
    type: "label"
  },
  "fr:label-rouge": {
    tag: "fr:label-rouge",
    label: "Label Rouge",
    link: "https://www.inao.gouv.fr/Les-signes-officiels-de-la-qualite-et-de-l-origine-SIQO/Label-Rouge",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/label-rouge.90x90.svg",
    type: "label"
  },
  // Various origins.
  "en:dolphin-safe": {
    tag: "en:dolphin-safe",
    label: "Dolphin Safe",
    // logo does not exist yet
    logo: "https://static.openfoodfacts.org/images/lang/en/labels/dolphin-safe.90x90.svg",
    type: "label"
  },
  "en:canada-organic": {
    tag: "en:canada-organic",
    label: "Canada Organic",
    logo: "https://static.openfoodfacts.org/images/lang/en/labels/canada-organic.90x90.svg",
    type: "label"
  },
  "de:ohne-gentechnik": {
    tag: "de:ohne-gentechnik",
    label: "Ohne Gentechnik",
    logo: "https://static.openfoodfacts.org/images/lang/de/labels/ohne-gentechnik.90x90.svg",
    type: "label"
  },
  "en:made-in-france": {
    tag: "en:made-in-france",
    label: "Fabriqué en France",
    // logo does not exist yet
    logo: "https://static.openfoodfacts.org/images/lang/en/labels/made-in-france.90x90.svg",
    type: "label"
  },
  "en:produced-in-brittany": {
    tag: "en:produced-in-brittany",
    label: "Produit en Bretagne",
    logo: "https://fr.openfoodfacts.org/images/lang/fr/labels/produit-en-bretagne.90x90.png",
    type: "label"
  },
  "en:transformed-in-france": {
    tag: "en:transformed-in-france",
    label: "Transformé en France",
    // logo does not exist yet
    logo: "https://static.openfoodfacts.org/images/lang/en/labels/transformed-in-france.90x90.svg",
    type: "label"
  },
  "fr:origine-france": {
    tag: "fr:origine-france",
    label: "Origine France",
    // logo does not exist yet
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/origine-france.90x90.svg",
    type: "label"
  },
  "en:packaged-in-france": {
    tag: "en:packaged-in-france",
    label: "Conditionné en France",
    // logo does not exist yet
    logo: "https://static.openfoodfacts.org/images/lang/en/labels/packaged-in-france.90x90.svg", type: "label"

  },
  "en:french-agriculture": {
    tag: "en:french-agriculture",
    label: "Agriculture France",
    // logo does not exist yet
    logo: "https://static.openfoodfacts.org/images/lang/en/labels/french-agriculture.90x90.svg", type: "label"
  },
  "en:cooked-in-france": {
    tag: "en:cooked-in-france",
    label: "Cuisiné en France",
    // logo does not exist yet
    logo: "https://static.openfoodfacts.org/images/lang/en/labels/cooked-in-france.90x90.svg", type: "label"
  },
  "fr:fruits-et-legumes-de-france": {
    tag: "fr:fruits-et-legumes-de-france",
    label: "Fruits et Légumes de France",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/fruits-et-legumes-de-france.94x90.png",
    type: "label"
  },
  "en:grown-in-france": {
    tag: "en:grown-in-france",
    label: "Cultivé en France",
    logo: "https://static.openfoodfacts.org/images/lang/en/labels/grown-in-france.90x90.svg", type: "label"
  },
  "fr:bio-equitable-en-france": {
    tag: "fr:bio-equitable-en-france",
    label: "Bio équitable en France",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/bio-equitable-en-france.90x90.svg",
    type: "label"
  },
  "en:french-eggs": {
    tag: "en:french-eggs",
    label: "Oeufs de France",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/oeufs-de-france.96x90.png",
    type: "label"
  },
  "en:potatoes-from-france": {
    tag: "en:potatoes-from-france",
    label: "Pommes de terre de France",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/pommes-de-terre-de-france.94x90.png",
    type: "label"
  },
  "en:max-havelaar-france": {
    tag: "en:max-havelaar-france",
    label: "Max Havelaar France",
    // does not exist
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/max-havelaar-france.90x90.svg",
    type: "label"
  },
  "fr:sud-de-france": {
    tag: "fr:sud-de-france",
    label: "Sud de France",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/sud-de-france.90x90.svg", type: "label"
  },
  "fr:legumes-de-france": {
    tag: "fr:legumes-de-france",
    label: "Légumes de France",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/legumes-de-france.90x90.svg", type: "label"
  },
  "en:harvested-in-france": {
    tag: "en:harvested-in-france",
    label: "Récolté en France",
    logo: "https://static.openfoodfacts.org/images/lang/en/labels/harvested-in-france.90x90.svg", type: "label"
  },
  "fr:agri-ethique-france": {
    tag: "fr:agri-ethique-france",
    label: "Agri-Éthique France",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/agri-ethique-france.90x90.svg", type: "label"
  },
  "en:apples-from-france": {
    tag: "en:apples-from-france",
    label: "Pommes de France",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/pommes-de-france.90x90.png", type: "label"
  },
  "en:egg-laid-in-france": {
    tag: "en:egg-laid-in-france",
    label: "Pondu en France",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/oeufs-de-france.96x90.png", type: "label"
  },
  "fr:fruits-de-france": {
    tag: "fr:fruits-de-france",
    label: "Fruits de France",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/fruits-de-france.90x90.svg", type: "label"
  },
  "fr:tomates-de-france": {
    tag: "fr:tomates-de-france",
    label: "Tomates de France",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/tomates-de-france.90x90.png", type: "label"
  },
  "en:qualite-france-french-quality": {
    tag: "en:qualite-france-french-quality",
    label: "Qualité France",
    logo: "https://static.openfoodfacts.org/images/lang/en/labels/qualite-france-french-quality.90x90.svg", type: "label"
  },
  "fr:mais-de-france": {
    tag: "fr:mais-de-france",
    label: "Maïs de France",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/mais-de-france.90x90.svg", type: "label"
  },
  "en:honey-from-france": {
    tag: "en:honey-from-france",
    label: "Miel de France",
    logo: "https://static.openfoodfacts.org/images/lang/en/labels/honey-from-france.90x90.svg", type: "label"
  },
  "en:french-meat": {
    tag: "en:french-meat",
    label: "Viande Française",
    logo: "https://static.openfoodfacts.org/images/lang/en/labels/french-meat.90x90.svg", type: "label"
  },
  "en:french-poultry": {
    tag: "en:french-poultry",
    label: "Volaille Française",
    logo: "https://fr.openfoodfacts.org/images/lang/fr/labels/volaille-francaise.94x90.png", type: "label"
  },
  "en:french-pork": {
    tag: "en:french-pork",
    label: "Viande Porcine Française",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/viande-porcine-francaise.94x90.png", type: "label"
  },
  "en:french-beef": {
    tag: "en:french-beef",
    label: "Viande Bovine Française",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/viande-bovine-francaise.94x90.png", type: "label"
  },
  "en:french-milk": {
    tag: "en:french-milk",
    label: "Lait Français",
    logo: "https://static.openfoodfacts.org/images/lang/en/labels/french-milk.90x90.svg", type: "label"
  },
  "fr:Farine-de-ble-français": {
    tag: "fr:Farine-de-ble-français",
    label: "Farine de blé français",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/farine-de-ble-français.90x90.svg", type: "label"
  },
  "fr:Ble-français": {
    tag: "fr:Ble-français",
    label: "Blé français",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/ble-francais.90x90.svg", type: "label"
  },
  "fr:Soja-Français": {
    tag: "fr:Soja-Français",
    label: "Soja Français",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/soja-francais.90x90.svg", type: "label"
  },
  "fr:Soja-Français-sans-OGM": {
    tag: "fr:Soja-Français-sans-OGM",
    label: "Soja Français sans OGM",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/soja-francais-sans-OGM.90x90.svg", type: "label"
  },
  "fr:poulet-francais": {
    tag: "fr:poulet-francais",
    label: "Poulet Français",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/poulet-francais.90x90.svg", type: "label"
  },
  "fr:lapin-francais": {
    tag: "fr:lapin-francais",
    label: "Lapin Français",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/lapin-de-france.90x90.png", type: "label"
  },
  "fr:french-duck": {
    tag: "fr:french-duck",
    label: "Canard Français",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/french-duck.90x90.png", type: "label"
  },
  "fr:viande-de-veau-francais": {
    tag: "fr:viande-de-veau-francais",
    label: "Viande de veau français",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/viande-de-veau-francais.90x90.png", type: "label"
  },
  "fr:farine-de-sarrasin-francais": {
    tag: "fr:farine-de-sarrasin-francais",
    label: "Farine de sarrasin français",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/farine-de-sarrasin-francais.90x90.png", type: "label"
  },
  "fr:peche-francaise": {
    tag: "fr:peche-francaise",
    label: "Pêche française",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/peche-francaise.90x90.png", type: "label"
  },
  "fr:viande-ovine-francaise": {
    tag: "fr:viande-ovine-francaise",
    label: "Viande Ovine Française",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/viande-ovine-francaise.90x90.png", type: "label"
  },
  "fr:viande-d-agneau-francais": {
    tag: "fr:viande-d-agneau-francais",
    label: "Viande d'agneau français",
    logo: "https://static.openfoodfacts.org/images/lang/fr/labels/viande-d-agneau-francais.90x90.png", type: "label"
  },

  // Eco-score
  // To-Do add the origin france logos
  "en:organic": {
    tag: "en:organic",
    label: "Bio",
    logo: "https://world-fr.openfoodfacts.org/images/lang/fr/labels/bio.96x90.png", type: "label"
  },
  "en:eg-oko-verordnung": {
    tag: "en:eg-oko-verordnung",
    label: "eg oko verordnung",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/labels/eg-oko-verordnung.110x90.svg", type: "label"
  },
  "fr:haute-valeur-environnementale": {
    tag: "fr:haute-valeur-environnementale",
    label: "Haute Valeur Environnementale",
    logo: "https://world-fr.openfoodfacts.org/images/lang/fr/labels/haute-valeur-environnementale.90x90.svg", type: "label"
  },
  "fr:bleu-blanc-coeur": {
    tag: "fr:bleu-blanc-coeur",
    label: "Bleu Blanc Coeur",
    logo: "https://world-fr.openfoodfacts.org/images/lang/fr/labels/bleu-blanc-coeur.98x90.svg", type: "label"
  },
  "en:roundtable-on-sustainable-palm-oil": {
    tag: "en:roundtable-on-sustainable-palm-oil",
    label: "Roundtable on sustainable palm oil",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/labels/roundtable-on-sustainable-palm-oil.90x90.svg", type: "label"
  },
  "en:rainforest-alliance": {
    tag: "en:rainforest-alliance",
    label: "Rainforest Alliance",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/labels/rainforest-alliance.90x90.svg", type: "label"
  },
  "en:fairtrade-international": {
    tag: "en:fairtrade-international",
    label: "Fairtrade International",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/labels/fairtrade-international.77x90.svg", type: "label"
  },
  "en:max-havelaar": {
    tag: "en:max-havelaar",
    label: "Max Havelaar",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/labels/max-havelaar.64x90.svg", type: "label"
  },
  "en:sustainable-seafood-msc": {
    tag: "en:sustainable-seafood-msc",
    label: "Sustainable seafood msc",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/labels/sustainable-seafood-msc.126x90.svg", type: "label"
  },
  "en:responsible-aquaculture-asc": {
    tag: "en:responsible-aquaculture-asc",
    label: "responsible aquaculture asc",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/labels/responsible-aquaculture-asc.188x90.svg", type: "label"
  },
  // To-Do add Packaging logos
  "en:1-pet": {
    tag: "en:1-pet",
    label: "1-PET",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/01-pet.73x90.svg", type: "label"
  },
  "en:1-PETE": {
    tag: "en:1-PETE",
    label: "1-PETE",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/01-pete.90x90.svg", type: "label"
  },
  "en:2-PEHD": {
    tag: "en:2-PEHD",
    label: "2-PEHD",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/02-pe-hd.73x90.svg", type: "label"
  },
  "en:2-HDPE": {
    tag: "en:2-HDPE",
    label: "2-HDPE",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/02-pe-hd.73x90.svg", type: "label"
  },
  "en:3-PVC": {
    tag: "en:3-PVC",
    label: "3-PVC",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/03-pvc.73x90.svg", type: "label"
  },
  "en:4-PELD": {
    tag: "en:4-PELD",
    label: "4-PELD",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/04-ldpe.90x90.svg", type: "label"
  },
  "en:4-LDPE": {
    tag: "en:4-LDPE",
    label: "4-LDPE",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/04-ldpe.90x90.svg", type: "label"
  },
  "en:5-PP": {
    tag: "en:5-PP",
    label: "5-PP",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/05-pp.73x90.svg", type: "label"
  },
  "en:06-PS": {
    tag: "en:06-PS",
    label: "06-PS",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/06-ps.73x90.svg", type: "label"
  },
  "en:7-O": {
    tag: "en:7-O",
    label: "7-O",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/07-o.73x90.svg", type: "label"
  },
  "en:8-Lead": {
    tag: "en:8-Lead",
    label: "8-Lead",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/08-lead.90x90.svg", type: "label"
  },
  "en:9-Alkaline": {
    tag: "en:9-Alkaline",
    label: "9-Alkaline",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/09-alkaline.90x90.svg", type: "label"
  },
  "en:10-NiCD": {
    tag: "en:10-NiCD",
    label: "10-NiCD",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/10-nicd.90x90.svg", type: "label"
  },
  "en:11-NiMH": {
    tag: "en:11-NiMH",
    label: "11-NiMH",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/11-nimh.90x90.svg", type: "label"
  },
  "en:12-Li": {
    tag: "en:12-Li",
    label: "12-Li",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/12-li.90x90.svg", type: "label"
  },
  "en:13-SO(Z)": {
    tag: "en:13-SO(Z)",
    label: "13-SO(Z)",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/13-soz.90x90.svg", type: "label"
  },
  "en:14-CZ": {
    tag: "en:14-CZ",
    label: "14-CZ",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/14-cz.90x90.svg", type: "label"
  },
  "en:20-PAP": {
    tag: "en:20-PAP",
    label: "20-PAP",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/20-pap.73x90.svg", type: "label"
  },
  "en:21-PAP": {
    tag: "en:21-PAP",
    label: "21-PAP",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/21-pap.73x90.svg", type: "label"
  },
  "en:22-PAP": {
    tag: "en:22-PAP",
    label: "22-PAP",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/22-pap.73x90.svg", type: "label"
  },
  "en:40-FE": {
    tag: "en:40-FE",
    label: "40-FE",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/40-fe.90x90.svg", type: "label"
  },
  "en:41-ALU": {
    tag: "en:41-ALU",
    label: "41-ALU",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/41-alu.90x90.svg", type: "label"
  },
  "en:50-FOR": {
    tag: "en:50-FOR",
    label: "50-FOR",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/50-for.90x90.svg", type: "label"
  },
  "en:51-FOR": {
    tag: "en:51-FOR",
    label: "51-FOR",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/51-for.90x90.svg", type: "label"
  },
  "en:60-COT": {
    tag: "60-COT",
    label: "60-COT",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/60-cot.90x90.svg", type: "label"
  },
  "en:61-TEX": {
    tag: "en:61-TEX",
    label: "61-TEX",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/61-tex.90x90.svg", type: "label"
  },
  "en:62-TEX": {
    tag: "en:62-TEX",
    label: "62-TEX",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/62-tex.90x90.svg", type: "label"
  },
  "en:69-TEX": {
    tag: "en:69-TEX",
    label: "69-TEX",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/69-tex.90x90.svg", type: "label"
  },
  "en:70-GL": {
    tag: "en:70-GL",
    label: "70-GL",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/70-gl.73x90.svg", type: "label"
  },
  "en:71-GL": {
    tag: "en:71-GL",
    label: "71-GL",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/71-gl.73x90.svg", type: "label"
  },
  "en:72-GL": {
    tag: "en:72-GL",
    label: "72-GL",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/72-gl.73x90.svg", type: "label"
  },
  "en:73-GL": {
    tag: "en:73-GL",
    label: "73-GL",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/73-gl.90x90.svg", type: "label"
  },
  "en:74-GL": {
    tag: "en:74-GL",
    label: "74-GL",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/74-gl.90x90.svg", type: "label"
  },
  "en:75-GL": {
    tag: "en:75-GL",
    label: "75-GL",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/75-gl.90x90.svg", type: "label"
  },
  "en:76-GL": {
    tag: "en:76-GL",
    label: "76-GL",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/76-gl.90x90.svg", type: "label"
  },
  "en:77-GL": {
    tag: "en:77-GL",
    label: "77-GL",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/77-gl.90x90.svg", type: "label"
  },
  "en:78-GL": {
    tag: "en:78-GL",
    label: "78-GL",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/78-gl.90x90.svg", type: "label"
  },
  "en:79-GL": {
    tag: "en:79-GL",
    label: "79-GL",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/79-gl.90x90.svg", type: "label"
  },
  "en:80-Paper": {
    tag: "en:80-Paper",
    label: "80-Paper",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/80-paper.90x90.svg", type: "label"
  },
  "en:81-PapPet": {
    tag: "en:81-PapPet",
    label: "81-PapPet",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/81-pappet.90x90.svg", type: "label"
  },
  "en:82": {
    tag: "en:82",
    label: "82",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/82.90x90.svg", type: "label"
  },
  "en:83": {
    tag: "en:83",
    label: "83",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/83.90x90.svg", type: "label"
  },
  "en:84-C/PAP": {
    tag: "en:84-C/PAP",
    label: "84-C/PAP",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/84-c-pap.73x90.svg", type: "label"
  },
  "en:84-PapAl": {
    tag: "en:84-PapAl",
    label: "84-PapAl",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/84-papal.90x90.svg", type: "label"
  },
  "en:85": {
    tag: "en:85",
    label: "85",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/85.90x90.svg", type: "label"
  },
  "en:87-CSL": {
    tag: "en:87-CSL",
    label: "87-CSL",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/87-csl.90x90.svg", type: "label"
  },
  "en:90": {
    tag: "en:90",
    label: "90",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/90.90x90.svg", type: "label"
  },
  "en:91": {
    tag: "en:91",
    label: "91",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/91.90x90.svg", type: "label"
  },
  "en:92": {
    tag: "en:92",
    label: "92",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/92.90x90.svg", type: "label"
  },
  "en:95": {
    tag: "en:95",
    label: "95",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/95.90x90.svg", type: "label"
  },
  "en:96": {
    tag: "en:96",
    label: "96",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/96.90x90.svg", type: "label"
  },
  "en:97": {
    tag: "en:97",
    label: "97",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/97.90x90.svg", type: "label"
  },
  "en:98": {
    tag: "en:98",
    label: "98",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/packaging/98.90x90.svg", type: "label"
  },
  "de:einwegpfand": {
    tag: "de:einwegpfand",
    label: "Einwegpfand",
    logo: "https://world-fr.openfoodfacts.org/images/lang/de/packaging/einwegpfand.70x90.svg", type: "label"
  },
  "en:fsc": {
    tag: "en:fsc",
    label: "FSC",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/labels/fsc.73x90.svg", type: "label"
  },
  "en:fsc-mix": {
    tag: "en:fsc-mix",
    label: "FSC-Mix",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/labels/fsc.73x90.svg", type: "label"
  },
  "en:pefc": {
    tag: "en:pefc",
    label: "PEFC",
    // logo does not exist yet
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/labels/pefc.90x90.svg", type: "label"
  },
  "en:green-dot": {
    tag: "en:green-dot",
    label: "Green Dot (means the manufacturer paid a contribution to CITEO)",
    logo: "https://static.openfoodfacts.org/images/lang/en/packaging/green-dot.90x90.svg", type: "label"
  },
  "fr:triman": {
    tag: "fr:triman",
    label: "Triman (means it's actually recyclable)",
    logo: "https://static.openfoodfacts.org/images/lang/en/labels/triman.90x90.svg", type: "label"
  },
  // To-Do add Halal logos
  "en:halal-food-council-of-europe": {
    tag: "en:halal-food-council-of-europe",
    label: "Halal Food Council of Europe",
    logo: "https://world-fr.openfoodfacts.org/images/lang/en/labels/halal-food-council-of-europe.188x90.svg", type: "label"
  },
  "fr:societe-francaise-de-controle-de-viande-halal": {
    tag: "fr:societe-francaise-de-controle-de-viande-halal",
    label: "Société française de contrôle de viande halal",
    logo: "https://world-fr.openfoodfacts.org/images/lang/fr/labels/societe-francaise-de-controle-de-viande-halal.90x90.png", type: "label"
  },
  "fr:controle-de-la-mosquee-d-evry-courcouronnes": {
    tag: "fr:controle-de-la-mosquee-d-evry-courcouronnes",
    label: "Contrôle de la mosquée d'Evry-Courcouronnes",
    logo: "https://world-fr.openfoodfacts.org/images/lang/fr/labels/controle-de-la-mosquee-d-evry-courcouronnes.90x90.png", type: "label"
  },
  "fr:association-rituelle-de-la-grande-mosquee-de-lyon": {
    tag: "fr:association-rituelle-de-la-grande-mosquee-de-lyon",
    label: "Association rituelle de la grande mosquée de Lyon",
    logo: "https://world-fr.openfoodfacts.org/images/lang/fr/labels/association-rituelle-de-la-grande-mosquee-de-lyon.88x90.png", type: "label"
  },
  // To-Do add Other scores logos
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
  // To-Do add Scores dashboard
  {
    tag: "packaging",
    title: "Packaging",
    logos: [
      "en:1-pet",
      "en:1-PETE",
      "en:2-PEHD",
      "en:2-HDPE",
      "en:3-PVC",
      "en:4-PELD",
      "en:4-LDPE",
      "en:5-PP",
      "en:06-PS",
      "en:7-O",
      "en:8-Lead",
      "en:9-Alkaline",
      "en:10-NiCD",
      "en:11-NiMH",
      "en:12-Li",
      "en:13-SO(Z)",
      "en:14-CZ",
      "en:20-PAP",
      "en:21-PAP",
      "en:22-PAP",
      "en:40-FE",
      "en:41-ALU",
      "en:50-FOR",
      "en:51-FOR",
      "en:60-COT",
      "en:61-TEX",
      "en:62-TEX",
      "en:69-TEX",
      "en:70-GL",
      "en:71-GL",
      "en:72-GL",
      "en:73-GL",
      "en:74-GL",
      "en:75-GL",
      "en:76-GL",
      "en:77-GL",
      "en:78-GL",
      "en:79-GL",
      "en:80-Paper",
      "en:81-PapPet",
      "en:82",
      "en:83",
      "en:84-C/PAP",
      "en:84-PapAl",
      "en:85",
      "en:87-CSL",
      "en:90",
      "en:91",
      "en:92",
      "en:95",
      "en:96",
      "en:97",
      "en:98",
      "en:fsc",
      "en:fsc-mix",
      "en:pefc",
      "fr:triman",
      "en:green-dot",
    ],
  },
  {
    tag: "halal",
    title: "Halal",
    logos: [
      "en:halal-food-council-of-europe",
      "fr:societe-francaise-de-controle-de-viande-halal",
      "fr:controle-de-la-mosquee-d-evry-courcouronnes",
      "fr:association-rituelle-de-la-grande-mosquee-de-lyon",
    ],
  },
  // To-Do add Kosher dashboard
  //  {
  //    tag: "kosher",
  //    title: "Kosher",
  //    logos: [
  //      "en:cor-kosher",
  //     "en:kosher-check",
  //      "en:tablet-k-kosher",
  //     "en:mk-kosher",
  //   ],
  // },
  // To-Do add Origins dashboard
  {
    tag: "origin-france",
    title: "Origine France",
    logos: [
      "en:made-in-france",
      "en:transformed-in-france",
      "fr:origine-france",
      "en:packaged-in-france",
      "en:french-agriculture",
      "en:cooked-in-france",
      "fr:fruits-et-legumes-de-france",
      "en:grown-in-france",
      "fr:bio-equitable-en-france",
      "en:french-eggs",
      "en:potatoes-from-france",
      "en:max-havelaar-france",
      "fr:sud-de-france",
      "fr:legumes-de-france",
      "en:harvested-in-france",
      "fr:agri-ethique-france",
      "en:apples-from-france",
      "en:egg-laid-in-france",
      "fr:fruits-de-france",
      "fr:tomates-de-france",
      "en:qualite-france-french-quality",
      "fr:mais-de-france",
      "en:honey-from-france",
      "en:french-meat",
      "en:french-poultry",
      "en:french-pork",
      "en:french-beef",
      "en:french-milk",
      "fr:Farine-de-ble-français",
      "fr:Ble-français",
      "fr:Soja-Français",
      "fr:Soja-Français-sans-OGM",
      "fr:poulet-francais",
      "fr:lapin-francais",
      "fr:french-duck",
      "fr:viande-de-veau-francais",
      "fr:farine-de-sarrasin-francais",
      "fr:peche-francaise",
      "fr:viande-ovine-francaise",
      "fr:viande-d-agneau-francais",
      "en:produced-in-brittany",
    ],
  },
  // TODO: vegetarian vegetalian categories
];
