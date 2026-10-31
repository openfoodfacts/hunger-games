import {
  DataQualityProduct,
  DataQualityMetrics,
  LeaderboardContributor,
  ErrorCategoryInfo,
} from "./types";
import { OFF_URL } from "../../const";

export const LOCAL_STORAGE_FIXED_KEY = "hg_dq_fixed_barcodes";
export const LOCAL_STORAGE_STREAK_KEY = "hg_dq_streak";
export const LOCAL_STORAGE_LAST_FIX_DATE = "hg_dq_last_fix_date";

export const WIKI_UNFIXABLE_URL =
  "https://wiki.openfoodfacts.org/Data_quality_issues_which_can%27t_be_fixed";
export const FORUM_DATABASE_URL =
  "https://forum.openfoodfacts.org/c/be-a-part-of-it/database/25";
export const SLACK_URL = "https://slack.openfoodfacts.org";
export const MIRABELLE_DASHBOARD_URL =
  "https://mirabelle.openfoodfacts.org/-/dashboards/data-quality-dashboard";
export const MIRABELLE_ERRORS_FROM_URL =
  "https://mirabelle.openfoodfacts.org/_memory/errors_from";
export const MIRABELLE_SUBSCRIBE_URL =
  "https://mirabelle.openfoodfacts.org/-/data-quality-daily/subscribe";

export const TAGLINE_ANNOUNCEMENT = {
  challengeTitle: "Data Quality Challenge",
  challengeMessage:
    "We are focusing on high-impact products! Every fix improves food transparency for thousands of consumers. Help us drive the error rate below the 0.9% threshold!",
  monthlyEventText:
    "Every month we organise the Data Quality Monthly, a dedicated one-hour meeting. Join us on Slack (#quality-data) to take part in the next session!",
};

export const INITIAL_METRICS: DataQualityMetrics = {
  lastProductEditedOn: new Date().toISOString().split("T")[0],
  totalNbOfProducts: 3524890,
  nbOfProductsWithAnIssue: 169120,
  percentOfProductsWithAnIssue: 4.798,
  goalInPercent: 0.9,
  totalNBOfModifiedProducts: 14850,
  totalNBOfNewProducts: 4320,
  newProductsLast7Days: [
    { day: "-7d", count: 3820 },
    { day: "-6d", count: 4110 },
    { day: "-5d", count: 3950 },
    { day: "-4d", count: 4290 },
    { day: "-3d", count: 4050 },
    { day: "-2d", count: 3780 },
    { day: "-1d", count: 4320 },
  ],
  nbOfProductsFixedYesterday: 312,
  nbOfNewProductsWithIssuesYesterday: 184,
  nbOfNewProductsWithIssues: 195,
  averageNbOfProductsFixedPerDay: 285,
  averageNbOfNewProductsInErrorPerDay: 145,
  averageNetProductsFixedPerDay: 140,
  uniqScans: 128450000,
  uniqScansIssues: 3420000,
  issuesInScansPercent: 2.662,
  activeContributorsCount: 148,
  estimatedDaysToGoal: 98,
};

export const ERROR_CATEGORIES: ErrorCategoryInfo[] = [
  {
    id: "nutrition_serving",
    titleKey: "data_quality.categories.nutrition_serving.title",
    defaultTitle: "Serving Size & Per-Serving Values",
    descriptionKey: "data_quality.categories.nutrition_serving.desc",
    defaultDescription:
      "Per-serving nutrition values are provided but serving size is missing or invalid.",
    count: 48210,
    tags: [
      "en:nutrition-data-per-serving-missing-serving-size",
      "en:serving-size-without-quantity",
    ],
    icon: "nutrition",
  },
  {
    id: "nutrition_limits",
    titleKey: "data_quality.categories.nutrition_limits.title",
    defaultTitle: "Nutrition Value > 100g",
    descriptionKey: "data_quality.categories.nutrition_limits.desc",
    defaultDescription:
      "Nutrient values per 100g exceeding 100g (e.g. fat, sugar, salt, protein).",
    count: 24190,
    tags: [
      "en:nutrition-value-over-100-sugars",
      "en:nutrition-value-over-100-fat",
      "en:nutrition-value-over-100-salt",
      "en:nutrition-value-over-100-proteins",
    ],
    icon: "nutrition",
  },
  {
    id: "nutrition_logic",
    titleKey: "data_quality.categories.nutrition_logic.title",
    defaultTitle: "Inconsistent Nutrition Math",
    descriptionKey: "data_quality.categories.nutrition_logic.desc",
    defaultDescription:
      "Sugars exceeding total carbohydrates, saturated fat exceeding total fat, or energy calculation mismatches.",
    count: 36450,
    tags: [
      "en:nutrition-sugars-greater-than-carbohydrates",
      "en:nutrition-fat-value-inconsistent-with-saturated-fat",
      "en:nutrition-energy-kj-kcal-mismatch",
      "en:energy-value-too-high",
    ],
    icon: "nutrition",
  },
  {
    id: "ingredients_syntax",
    titleKey: "data_quality.categories.ingredients_syntax.title",
    defaultTitle: "Ingredients & Percentages",
    descriptionKey: "data_quality.categories.ingredients_syntax.desc",
    defaultDescription:
      "Sum of ingredients percentages > 100%, unbalanced brackets, or unparsed ingredient text.",
    count: 31200,
    tags: [
      "en:ingredients-percent-sum-over-100",
      "en:ingredients-unbalanced-parentheses",
    ],
    icon: "ingredients",
  },
  {
    id: "salt_sodium",
    titleKey: "data_quality.categories.salt_sodium.title",
    defaultTitle: "Salt & Sodium Inconsistency",
    descriptionKey: "data_quality.categories.salt_sodium.desc",
    defaultDescription:
      "Salt should equal sodium multiplied by 2.5. Detected ratios that contradict physics.",
    count: 18740,
    tags: ["en:nutrition-salt-value-inconsistent-with-sodium"],
    icon: "nutrition",
  },
];

export const INITIAL_LEADERBOARD: LeaderboardContributor[] = [
  { rank: 1, username: "charlesnepote", nbOfProductsFixed: 148 },
  { rank: 2, username: "stephane", nbOfProductsFixed: 94 },
  { rank: 3, username: "tacinte", nbOfProductsFixed: 72 },
  { rank: 4, username: "alexfauquette", nbOfProductsFixed: 58 },
  { rank: 5, username: "hangy", nbOfProductsFixed: 46 },
  { rank: 6, username: "gala-nafikova", nbOfProductsFixed: 41 },
  { rank: 7, username: "manoncorneille", nbOfProductsFixed: 33 },
  { rank: 8, username: "teolemon", nbOfProductsFixed: 29 },
  { rank: 9, username: "raphael0202", nbOfProductsFixed: 22 },
  { rank: 10, username: "alex-off", nbOfProductsFixed: 19 },
];

export const SAMPLE_DATA_QUALITY_PRODUCTS: DataQualityProduct[] = [
  {
    code: "3017620422003",
    product_name: "Nutella Pâte à tartiner aux noisettes et au cacao",
    brands: "Ferrero, Nutella",
    unique_scans_n: 14820,
    data_quality_errors_tags: [
      "en:nutrition-data-per-serving-missing-serving-size",
    ],
    image_front_url:
      "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_fr.519.400.jpg",
    image_nutrition_url:
      "https://images.openfoodfacts.org/images/products/301/762/042/2003/nutrition_fr.467.400.jpg",
    image_ingredients_url:
      "https://images.openfoodfacts.org/images/products/301/762/042/2003/ingredients_fr.464.400.jpg",
    countries: "France, Belgium, Switzerland",
    energy_100g: 2252,
  },
  {
    code: "5411188110835",
    product_name: "Alpro Dessert Chocolat Soya",
    brands: "Alpro",
    unique_scans_n: 8750,
    data_quality_errors_tags: [
      "en:nutrition-sugars-greater-than-carbohydrates",
      "en:nutrition-data-per-serving-missing-serving-size",
    ],
    image_front_url:
      "https://images.openfoodfacts.org/images/products/541/118/811/0835/front_fr.200.400.jpg",
    image_nutrition_url:
      "https://images.openfoodfacts.org/images/products/541/118/811/0835/nutrition_fr.202.400.jpg",
    image_ingredients_url:
      "https://images.openfoodfacts.org/images/products/541/118/811/0835/ingredients_fr.201.400.jpg",
    countries: "France, United Kingdom, Netherlands",
    energy_100g: 345,
  },
  {
    code: "7613034928374",
    product_name: "KitKat 4 Finger White Chocolate Bar",
    brands: "Nestlé, KitKat",
    unique_scans_n: 6420,
    data_quality_errors_tags: [
      "en:nutrition-value-over-100-sugars",
      "en:nutrition-energy-kj-kcal-mismatch",
    ],
    image_front_url:
      "https://images.openfoodfacts.org/images/products/761/303/492/8374/front_en.112.400.jpg",
    image_nutrition_url:
      "https://images.openfoodfacts.org/images/products/761/303/492/8374/nutrition_en.114.400.jpg",
    image_ingredients_url:
      "https://images.openfoodfacts.org/images/products/761/303/492/8374/ingredients_en.113.400.jpg",
    countries: "United Kingdom, France",
    energy_100g: 2190,
  },
  {
    code: "3175680011480",
    product_name: "Galettes de riz complet bio",
    brands: "Bjorg",
    unique_scans_n: 5280,
    data_quality_errors_tags: [
      "en:nutrition-salt-value-inconsistent-with-sodium",
    ],
    image_front_url:
      "https://images.openfoodfacts.org/images/products/317/568/001/1480/front_fr.138.400.jpg",
    image_nutrition_url:
      "https://images.openfoodfacts.org/images/products/317/568/001/1480/nutrition_fr.140.400.jpg",
    image_ingredients_url:
      "https://images.openfoodfacts.org/images/products/317/568/001/1480/ingredients_fr.139.400.jpg",
    countries: "France",
    energy_100g: 1610,
  },
  {
    code: "8000500310427",
    product_name: "Kinder Bueno White",
    brands: "Ferrero, Kinder",
    unique_scans_n: 9140,
    data_quality_errors_tags: [
      "en:nutrition-fat-value-inconsistent-with-saturated-fat",
      "en:nutrition-data-per-serving-missing-serving-size",
    ],
    image_front_url:
      "https://images.openfoodfacts.org/images/products/800/050/031/0427/front_fr.112.400.jpg",
    image_nutrition_url:
      "https://images.openfoodfacts.org/images/products/800/050/031/0427/nutrition_fr.114.400.jpg",
    image_ingredients_url:
      "https://images.openfoodfacts.org/images/products/800/050/031/0427/ingredients_fr.113.400.jpg",
    countries: "France, Italy, Germany",
    energy_100g: 2400,
  },
  {
    code: "3033490004743",
    product_name: "Danette Chocolat",
    brands: "Danone, Danette",
    unique_scans_n: 7890,
    data_quality_errors_tags: [
      "en:ingredients-percent-sum-over-100",
      "en:serving-size-without-quantity",
    ],
    image_front_url:
      "https://images.openfoodfacts.org/images/products/303/349/000/4743/front_fr.198.400.jpg",
    image_nutrition_url:
      "https://images.openfoodfacts.org/images/products/303/349/000/4743/nutrition_fr.200.400.jpg",
    image_ingredients_url:
      "https://images.openfoodfacts.org/images/products/303/349/000/4743/ingredients_fr.199.400.jpg",
    countries: "France",
    energy_100g: 512,
  },
  {
    code: "5000128613401",
    product_name: "Heinz Tomato Ketchup",
    brands: "Heinz",
    unique_scans_n: 11200,
    data_quality_errors_tags: [
      "en:nutrition-data-per-serving-missing-serving-size",
      "en:nutrition-salt-value-inconsistent-with-sodium",
    ],
    image_front_url:
      "https://images.openfoodfacts.org/images/products/500/012/861/3401/front_en.162.400.jpg",
    image_nutrition_url:
      "https://images.openfoodfacts.org/images/products/500/012/861/3401/nutrition_en.164.400.jpg",
    image_ingredients_url:
      "https://images.openfoodfacts.org/images/products/500/012/861/3401/ingredients_en.163.400.jpg",
    countries: "United Kingdom, France",
    energy_100g: 435,
  },
  {
    code: "3229820782014",
    product_name: "Pain de mie complet sans sucres ajoutés",
    brands: "Harrys",
    unique_scans_n: 4980,
    data_quality_errors_tags: ["en:nutrition-value-over-100-fat"],
    image_front_url:
      "https://images.openfoodfacts.org/images/products/322/982/078/2014/front_fr.210.400.jpg",
    image_nutrition_url:
      "https://images.openfoodfacts.org/images/products/322/982/078/2014/nutrition_fr.212.400.jpg",
    image_ingredients_url:
      "https://images.openfoodfacts.org/images/products/322/982/078/2014/ingredients_fr.211.400.jpg",
    countries: "France",
    energy_100g: 1045,
  },
  {
    code: "8715700421377",
    product_name: "Heinz Baked Beanz in Tomato Sauce",
    brands: "Heinz",
    unique_scans_n: 6810,
    data_quality_errors_tags: ["en:nutrition-energy-kj-kcal-mismatch"],
    image_front_url:
      "https://images.openfoodfacts.org/images/products/871/570/042/1377/front_en.142.400.jpg",
    image_nutrition_url:
      "https://images.openfoodfacts.org/images/products/871/570/042/1377/nutrition_en.144.400.jpg",
    image_ingredients_url:
      "https://images.openfoodfacts.org/images/products/871/570/042/1377/ingredients_en.143.400.jpg",
    countries: "United Kingdom",
    energy_100g: 329,
  },
];

/**
 * Format raw Open Food Facts data quality error tag into a human-readable title and explanation
 */
export function formatErrorTag(tag: string): {
  title: string;
  category: "nutrition" | "ingredients" | "other";
  description: string;
} {
  const clean = tag.replace(/^en:/, "");

  switch (clean) {
    case "nutrition-data-per-serving-missing-serving-size":
      return {
        title: "Per-Serving Missing Serving Size",
        category: "nutrition",
        description:
          "Values per serving are specified, but the portion size (e.g. 30g, 1 pot) is missing.",
      };
    case "serving-size-without-quantity":
      return {
        title: "Serving Size Missing Unit / Quantity",
        category: "nutrition",
        description:
          "Serving size description is present without standardized weight or volume units.",
      };
    case "nutrition-sugars-greater-than-carbohydrates":
      return {
        title: "Sugars Exceed Carbohydrates",
        category: "nutrition",
        description:
          "Sugars cannot be greater than total carbohydrates since sugars are a subset of carbs.",
      };
    case "nutrition-fat-value-inconsistent-with-saturated-fat":
      return {
        title: "Saturated Fat Exceeds Total Fat",
        category: "nutrition",
        description: "Saturated fat cannot be greater than total lipids/fat.",
      };
    case "nutrition-salt-value-inconsistent-with-sodium":
      return {
        title: "Salt / Sodium Discrepancy",
        category: "nutrition",
        description:
          "Salt value is inconsistent with sodium (Salt should equal Sodium × 2.5).",
      };
    case "nutrition-value-over-100-sugars":
      return {
        title: "Sugars > 100g",
        category: "nutrition",
        description:
          "Sugars value per 100g is greater than 100g, which is impossible.",
      };
    case "nutrition-value-over-100-fat":
      return {
        title: "Fat > 100g",
        category: "nutrition",
        description: "Total fat per 100g exceeds 100g.",
      };
    case "nutrition-value-over-100-salt":
      return {
        title: "Salt > 100g",
        category: "nutrition",
        description: "Salt value per 100g exceeds 100g.",
      };
    case "nutrition-value-over-100-proteins":
      return {
        title: "Proteins > 100g",
        category: "nutrition",
        description: "Protein value per 100g exceeds 100g.",
      };
    case "nutrition-energy-kj-kcal-mismatch":
      return {
        title: "Energy kJ / kcal Mismatch",
        category: "nutrition",
        description:
          "1 kcal ≈ 4.184 kJ. The recorded energy in kJ and kcal do not match standard conversion.",
      };
    case "energy-value-too-high":
      return {
        title: "Energy Value Too High",
        category: "nutrition",
        description:
          "Energy per 100g exceeds pure fat maximum (~3700 kJ / 900 kcal per 100g).",
      };
    case "ingredients-percent-sum-over-100":
      return {
        title: "Ingredients Sum > 100%",
        category: "ingredients",
        description: "The percentage sum of listed ingredients exceeds 100%.",
      };
    case "ingredients-unbalanced-parentheses":
      return {
        title: "Unbalanced Parentheses in Ingredients",
        category: "ingredients",
        description:
          "Ingredients list has missing closing or opening parentheses/brackets.",
      };
    default:
      return {
        title: clean.replace(/-/g, " "),
        category: clean.startsWith("nutrition") ? "nutrition" : "other",
        description: `Data quality anomaly detected: ${clean.replace(/-/g, " ")}.`,
      };
  }
}

/**
 * Get direct URL to edit a product on Open Food Facts
 */
export function getProductEditUrl(barcode: string): string {
  return `${OFF_URL}/cgi/product.pl?type=edit&code=${barcode}`;
}

/**
 * Get URL to view a product on Open Food Facts
 */
export function getProductViewUrl(barcode: string): string {
  return `${OFF_URL}/product/${barcode}`;
}

/**
 * Get internal URL to the Hunger Games Nutrition extractor for this barcode
 */
export function getNutritionExtractorUrl(barcode: string): string {
  return `/nutrition?code=${barcode}`;
}

/**
 * Local storage state helpers
 */
export function getLocalFixedBarcodes(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FIXED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalFixedBarcode(barcode: string): {
  count: number;
  streak: number;
} {
  try {
    const existing = getLocalFixedBarcodes();
    if (!existing.includes(barcode)) {
      existing.push(barcode);
      localStorage.setItem(LOCAL_STORAGE_FIXED_KEY, JSON.stringify(existing));
    }

    // Update streak logic
    const today = new Date().toISOString().split("T")[0];
    const lastDate = localStorage.getItem(LOCAL_STORAGE_LAST_FIX_DATE);
    let streak = parseInt(
      localStorage.getItem(LOCAL_STORAGE_STREAK_KEY) || "1",
      10,
    );

    if (lastDate) {
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];
      if (lastDate === yesterday) {
        streak += 1;
      } else if (lastDate !== today) {
        streak = 1;
      }
    }
    localStorage.setItem(LOCAL_STORAGE_LAST_FIX_DATE, today);
    localStorage.setItem(LOCAL_STORAGE_STREAK_KEY, streak.toString());

    return { count: existing.length, streak };
  } catch {
    return { count: 1, streak: 1 };
  }
}

export function getUserStats(): { fixedCount: number; streak: number } {
  try {
    const count = getLocalFixedBarcodes().length;
    const streak = parseInt(
      localStorage.getItem(LOCAL_STORAGE_STREAK_KEY) || "0",
      10,
    );
    return { fixedCount: count, streak };
  } catch {
    return { fixedCount: 0, streak: 0 };
  }
}
