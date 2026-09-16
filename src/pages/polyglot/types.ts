export type PolyglotMode = "photos" | "texts" | "full";

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
  sourceLang?: string;
  targetLang?: string;
  label: string;
  description: string;
  badge?: string;
}

export const LANGUAGE_METADATA: Record<
  string,
  { flag: string; name: string; nativeName: string }
> = {
  fr: { flag: "🇫🇷", name: "Français", nativeName: "Français" },
  en: { flag: "🇬🇧", name: "Anglais", nativeName: "English" },
  de: { flag: "🇩🇪", name: "Allemand", nativeName: "Deutsch" },
  es: { flag: "🇪🇸", name: "Espagnol", nativeName: "Español" },
  it: { flag: "🇮🇹", name: "Italien", nativeName: "Italiano" },
  nl: { flag: "🇳🇱", name: "Néerlandais", nativeName: "Nederlands" },
  pt: { flag: "🇵🇹", name: "Portugais", nativeName: "Português" },
  pl: { flag: "🇵🇱", name: "Polonais", nativeName: "Polski" },
  ru: { flag: "🇷🇺", name: "Russe", nativeName: "Русский" },
  ar: { flag: "🇸🇦", name: "Arabe", nativeName: "العربية" },
  he: { flag: "🇮🇱", name: "Hébreu", nativeName: "עברית" },
  zh: { flag: "🇨🇳", name: "Chinois", nativeName: "中文" },
  ja: { flag: "🇯🇵", name: "Japonais", nativeName: "日本語" },
};

export const POLYGLOT_CHALLENGE_OPTIONS: PolyglotChallengeOption[] = [
  {
    id: "en-contains-fr",
    tag: "ingredients-language-mismatch-en-contains-fr",
    mainLang: "en",
    sourceLang: "en",
    targetLang: "fr",
    label: "🇬🇧 Anglais ➜ 🇫🇷 Contient du français",
    description:
      "Produits déclarés en anglais dont les ingrédients ou textes sont en français (très fréquent avec les applis tierces)",
    badge: "Courant",
  },
  {
    id: "fr-contains-en",
    tag: "ingredients-language-mismatch-fr-contains-en",
    mainLang: "fr",
    sourceLang: "fr",
    targetLang: "en",
    label: "🇫🇷 Français ➜ 🇬🇧 Contient de l'anglais",
    description:
      "Produits déclarés en français avec des textes ou ingrédients en anglais",
  },
  {
    id: "en-contains-de",
    tag: "ingredients-language-mismatch-en-contains-de",
    mainLang: "en",
    sourceLang: "en",
    targetLang: "de",
    label: "🇬🇧 Anglais ➜ 🇩🇪 Contient de l'allemand",
    description: "Produits déclarés en anglais avec des textes en allemand",
  },
  {
    id: "de-contains-fr",
    tag: "ingredients-language-mismatch-de-contains-fr",
    mainLang: "de",
    sourceLang: "de",
    targetLang: "fr",
    label: "🇩🇪 Allemand ➜ 🇫🇷 Contient du français",
    description:
      "Produits suisses ou germaniques déclarés en allemand avec des textes en français",
  },
  {
    id: "fr-contains-nl",
    tag: "ingredients-language-mismatch-fr-contains-nl",
    mainLang: "fr",
    sourceLang: "fr",
    targetLang: "nl",
    label: "🇫🇷 Français ➜ 🇳🇱 Contient du néerlandais",
    description:
      "Produits belges déclarés en français avec du texte néerlandais",
  },
  {
    id: "en-contains-es",
    tag: "ingredients-language-mismatch-en-contains-es",
    mainLang: "en",
    sourceLang: "en",
    targetLang: "es",
    label: "🇬🇧 Anglais ➜ 🇪🇸 Contient de l'espagnol",
    description:
      "Produits déclarés en anglais avec des ingrédients en espagnol",
  },
  {
    id: "en-contains-it",
    tag: "ingredients-language-mismatch-en-contains-it",
    mainLang: "en",
    sourceLang: "en",
    targetLang: "it",
    label: "🇬🇧 Anglais ➜ 🇮🇹 Contient de l'italien",
    description: "Produits déclarés en anglais avec des ingrédients en italien",
  },
  {
    id: "all-language-mismatches",
    tag: "ingredients-language-mismatch",
    sourceLang: "en",
    targetLang: "fr",
    label: "Toutes les incohérences de langue",
    description:
      "Parcourir l'ensemble des produits signalés avec un décalage de langue",
  },
];
