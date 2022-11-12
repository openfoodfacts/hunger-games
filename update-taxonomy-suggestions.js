const fs = require("fs");
const axios = require("axios");

// Map locale folder name to the name used in the OFF api
const taxonomyURLfileName = {
  category: "categories",
  packaging: "packagings",
  label: "labels",
};

const LANG = ["fr", "en", "de", "es"];
const LETTERS = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
];

const cleanName = (name) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^0-9a-z]/gi, "-");

const isMatching = (prefix) => (name) =>
  cleanName(name)
    .split("-")
    .some((subString) => subString.startsWith(prefix));

Object.keys(taxonomyURLfileName).forEach(async (taxonomyType) => {
  const { data } = await axios.get(
    `https://static.openfoodfacts.org/data/taxonomies/${taxonomyURLfileName[taxonomyType]}.full.json`
  );

  LANG.forEach((lang) => {
    const saveFile = (prefix, data) => {
      const destFile = `./public/data/${lang}/${taxonomyType}/${prefix}.json`;
      const stringify = JSON.stringify(data, null, 2);
      fs.writeFileSync(destFile, stringify);
    };

    const exportedData = Object.keys(data).flatMap((key) => {
      const name = data[key]?.name?.[lang] ?? data[key]?.name?.en ?? null;
      return name ? [{ key, name }] : [];
    });

    exportedData.sort((a, b) => a.name.localeCompare(b.name));

    let fileNb = 0;
    console.log(`${taxonomyType}.${lang}`);

    LETTERS.forEach((l1) => {
      const prefix = `${l1}`;
      const solutions1 = exportedData.filter(({ name }) =>
        isMatching(prefix)(name)
      );
      if (solutions1.length === 0) {
        return;
      }
      if (solutions1.length < 100) {
        saveFile(prefix, solutions1);
        fileNb += 1;
        return;
      }
      saveFile(prefix, solutions1.slice(0, 10));
      LETTERS.forEach((l2) => {
        const prefix = `${l1}${l2}`;
        const solutions2 = solutions1.filter(({ name }) =>
          isMatching(prefix)(name)
        );
        if (solutions2.length === 0) {
          return;
        }
        if (solutions2.length < 100) {
          saveFile(prefix, solutions2);
          fileNb += 1;
          return;
        }
        saveFile(prefix, solutions2.slice(0, 10));
        LETTERS.forEach((l3) => {
          const prefix = `${l1}${l2}${l3}`;
          const solutions3 = solutions2.filter(({ name }) =>
            isMatching(prefix)(name)
          );
          if (solutions3.length === 0) {
            return;
          }
          saveFile(prefix, solutions3);
          fileNb += 1;
        });
      });
    });
    console.log(fileNb);
  });
});
