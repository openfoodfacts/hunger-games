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
