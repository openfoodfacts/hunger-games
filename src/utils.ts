const reformatTagMapping = {
  " ": "-",
  "'": "-",
  "&": "",
  à: "a",
  â: "a",
  ä: "a",
  é: "e",
  è: "e",
  ê: "e",
  ë: "e",
  î: "i",
  ï: "i",
  ô: "o",
  ö: "o",
  û: "u",
  ù: "u",
  ü: "u",
};

export const reformatValueTag = (value: string | undefined) => {
  if (!value) {
    return value;
  }
  let output = value.trim().toLowerCase();
  for (const [search, replace] of Object.entries(reformatTagMapping)) {
    output = output.replace(new RegExp(search, "g"), replace);
  }
  output = output.replace(/-{2,}/g, "-");
  return output;
};

/**
 * Comment sent to Open Food Facts alongside every edit made from Hunger Games.
 * The edit stays attributed to the user who made it (that comes from the
 * session), the comment only tells readers which tool performed it.
 */
export const EDIT_SOURCE = "Hunger Games";

/**
 * Build the edit comment, e.g. `editComment("Packaging updated")` returns
 * "Packaging updated (Hunger Games)".
 */
export const editComment = (action: string) => `${action} (${EDIT_SOURCE})`;

export const removeEmptyKeys = <T extends Record<string, unknown>>(obj: T) => {
  Object.keys(obj).forEach(
    (key) => (obj[key] == null || obj[key] === "") && delete obj[key],
  );
  return obj;
};

//  Only for testing purpose
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//to provide capitalised country name; en:france => France
export const capitaliseName = (string: string | undefined) => {
  if (!string) {
    return string;
  }
  const name = string.slice(3);
  return name.charAt(0).toUpperCase() + name.slice(1);
};
