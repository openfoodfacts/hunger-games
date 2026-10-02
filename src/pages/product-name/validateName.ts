export const MAX_PRODUCT_NAME_LENGTH = 120;

export type ProductNameErrorKey =
  "empty" | "too_long" | "same_as_brand" | "same_as_category";

/**
 * Lowercase, remove diacritics and collapse spaces so that "Café  au Lait"
 * and "cafe au lait" are considered equal.
 */
const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// brands and categories are comma separated lists in the OFF database, and
// categories may be prefixed by their language, for example "fr:Yogurts"
const splitValues = (value?: string) =>
  (value ?? "")
    .split(",")
    .map((item) =>
      item
        .trim()
        .replace(/^[a-z]{2,3}:/, "")
        .trim(),
    )
    .filter((item) => item.length > 0);

const includesNormalized = (values: string[], name: string) =>
  values.some((value) => normalize(value) === name);

/**
 * Checks a product name before it is sent to Open Food Facts.
 * Returns the translation key of the first problem found, or null if the name
 * is valid.
 */
export const validateProductName = (
  name: string,
  { brands, categories }: { brands?: string; categories?: string },
): ProductNameErrorKey | null => {
  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return "empty";
  }
  if (trimmedName.length > MAX_PRODUCT_NAME_LENGTH) {
    return "too_long";
  }

  const normalizedName = normalize(trimmedName);
  if (includesNormalized(splitValues(brands), normalizedName)) {
    return "same_as_brand";
  }
  if (includesNormalized(splitValues(categories), normalizedName)) {
    return "same_as_category";
  }

  return null;
};
