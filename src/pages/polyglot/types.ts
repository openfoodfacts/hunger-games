export interface PolyglotProduct {
  code: string;
  product_name?: string;
  ingredients_text?: string;
  brands?: string;
  lang?: string;
  languages_tags?: string[];
  categories?: string;
  categories_tags?: string[];
  labels_tags?: string[];
  quantity?: string;
  image_front_url?: string;
  image_ingredients_url?: string;
  image_packaging_url?: string;
  image_nutrition_url?: string;
  selected_images?: {
    front?: {
      display?: Record<string, string>;
      selected?: Record<string, string>;
    };
    ingredients?: {
      display?: Record<string, string>;
      selected?: Record<string, string>;
    };
    packaging?: {
      display?: Record<string, string>;
      selected?: Record<string, string>;
    };
  };
  images?: Record<string, Record<string, unknown> | string>;
  countries_tags?: string[];
  data_quality_warnings_tags?: string[];
  data_quality_errors_tags?: string[];
  [key: `product_name_${string}`]: string | undefined;
  [key: `ingredients_text_${string}`]: string | undefined;
}

export interface DetectedLanguageInfo {
  languageCode: string;
  confidence: number;
  sampleText?: string;
}

export interface PolyglotChallengeOption {
  id: string;
  tag: string;
  mainLang?: string;
  label: string;
  description: string;
  badge?: string;
}

export const POLYGLOT_CHALLENGE_OPTIONS: PolyglotChallengeOption[] = [
  {
    id: "en-contains-fr",
    tag: "ingredients-language-mismatch-en-contains-fr",
    mainLang: "en",
    label: "🇬🇧 Anglais ➜ 🇫🇷 Contient du français",
    description:
      "Produits déclarés en anglais dont les ingrédients ou textes sont en français (très fréquent avec les applis tierces)",
    badge: "Courant",
  },
  {
    id: "fr-contains-en",
    tag: "ingredients-language-mismatch-fr-contains-en",
    mainLang: "fr",
    label: "🇫🇷 Français ➜ 🇬🇧 Contient de l'anglais",
    description:
      "Produits déclarés en français avec des textes ou ingrédients en anglais",
  },
  {
    id: "en-contains-de",
    tag: "ingredients-language-mismatch-en-contains-de",
    mainLang: "en",
    label: "🇬🇧 Anglais ➜ 🇩🇪 Contient de l'allemand",
    description: "Produits déclarés en anglais avec des textes en allemand",
  },
  {
    id: "de-contains-fr",
    tag: "ingredients-language-mismatch-de-contains-fr",
    mainLang: "de",
    label: "🇩🇪 Allemand ➜ 🇫🇷 Contient du français",
    description:
      "Produits suisses ou germaniques déclarés en allemand avec des textes en français",
  },
  {
    id: "fr-contains-nl",
    tag: "ingredients-language-mismatch-fr-contains-nl",
    mainLang: "fr",
    label: "🇫🇷 Français ➜ 🇳🇱 Contient du néerlandais",
    description:
      "Produits belges déclarés en français avec du texte néerlandais",
  },
  {
    id: "en-contains-es",
    tag: "ingredients-language-mismatch-en-contains-es",
    mainLang: "en",
    label: "🇬🇧 Anglais ➜ 🇪🇸 Contient de l'espagnol",
    description:
      "Produits déclarés en anglais avec des ingrédients en espagnol",
  },
  {
    id: "en-contains-it",
    tag: "ingredients-language-mismatch-en-contains-it",
    mainLang: "en",
    label: "🇬🇧 Anglais ➜ 🇮🇹 Contient de l'italien",
    description: "Produits déclarés en anglais avec des ingrédients en italien",
  },
  {
    id: "all-language-mismatches",
    tag: "ingredients-language-mismatch",
    label: "Toutes les incohérences de langue",
    description:
      "Parcourir l'ensemble des produits signalés avec un décalage de langue",
  },
];
