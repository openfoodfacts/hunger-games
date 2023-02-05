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

export const reformatValueTag = (value) => {
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

export const removeEmptyKeys = (obj) => {
  Object.keys(obj).forEach(
    (key) => (obj[key] == null || obj[key] === "") && delete obj[key]
  );
  return obj;
};

//  Only for testing purpose
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//to provide capitalised country name; en:france => France
export const capitaliseName = (string) => {
  if (!string) {
    return string;
  }
  let name = string.slice(3);
  return name.charAt(0).toUpperCase() + name.slice(1);
};
