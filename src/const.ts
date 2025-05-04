export const ROBOTOFF_API_URL = "https://robotoff.openfoodfacts.org/api/v1";
export const OFF_DOMAIN = "openfoodfacts.org";
export const OFF_URL = `https://world.${OFF_DOMAIN}`;
export const OFF_API_URL = `${OFF_URL}/api/v0`;
export const OFF_API_URL_V2 = `${OFF_URL}/api/v2`;
export const OFF_API_URL_V3 = `${OFF_URL}/api/v3`;
export const OFF_IMAGE_URL = `https://images.${OFF_DOMAIN}/images/products`;
export const OFF_SEARCH = `${OFF_URL}/cgi/search.pl`;
export const OFF_SEARCH_A_LISIOUS =
  "https://search.openfoodfacts.org/autocomplete";
export const IS_DEVELOPMENT_MODE = process.env.NODE_ENV === "development";
export const URL_ORIGINE = IS_DEVELOPMENT_MODE
  ? "http://localhost:5173"
  : "https://hunger.openfoodfacts.org";
export const NO_QUESTION_LEFT = "NO_QUESTION_LEFT";

export const CORRECT_INSIGHT = 1 as const;
export const WRONG_INSIGHT = 0 as const;
export const SKIPPED_INSIGHT = -1 as const;

// insight types that do not have an associated value
export const TYPE_WITHOUT_VALUE = ["packager_code", "qr_code", "no_logo"];
