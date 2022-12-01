export const ROBOTOFF_API_URL = "https://robotoff.openfoodfacts.org/api/v1";
export const OFF_URL = "https://world.openfoodfacts.org";
export const OFF_API_URL = `${OFF_URL}/api/v0`;
export const OFF_API_URL_V2 = `${OFF_URL}/api/v2`;
export const OFF_API_URL_V3 = `${OFF_URL}/api/v3`;
export const OFF_IMAGE_URL = "https://static.openfoodfacts.org/images/products";
export const OFF_SEARCH = "https://world.openfoodfacts.org/cgi/search.pl";
export const IS_DEVELOPMENT_MODE = process.env.NODE_ENV === "development";
export const URL_ORIGINE = IS_DEVELOPMENT_MODE
  ? "http://localhost:3000"
  : "https://hunger.openfoodfacts.org/";
export const NO_QUESTION_LEFT = "NO_QUESTION_LEFT";

export const CORRECT_INSIGHT = 1;
export const WRONG_INSIGHT = 0;
export const SKIPPED_INSIGHT = -1;
