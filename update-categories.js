const fs = require("fs");
const axios = require("axios");

axios("https://static.openfoodfacts.org/data/taxonomies/categories.json")
  .then(({ data }) => {
    const allCategories = Object.entries(data)
      .map(([key, value]) => ({
        id: key,
        name: value.name ?? {},
      }))
      .sort((a, b) => {
        const nameA = a.name.en ?? a.id;
        const nameB = b.name.en ?? b.id;
        return nameA.localeCompare(nameB);
      });

    const agribalyseCategories = Object.entries(data)
      .filter(
        ([, value]) =>
          value.agribalyse_food_code !== undefined ||
          value.agribalyse_proxy_food_code !== undefined,
      )
      .map(([key, value]) => ({
        id: key,
        name: value.name ?? {},
      }))
      .sort((a, b) => {
        const nameA = a.name.en ?? a.id;
        const nameB = b.name.en ?? b.id;
        return nameA.localeCompare(nameB);
      });

    fs.writeFile(
      "./src/assets/agribalyse-categories.json",
      JSON.stringify(agribalyseCategories, null, 2),
      () =>
        console.log(
          `Agribalyse categories updated (${agribalyseCategories.length} entries)`,
        ),
    );

    fs.writeFile(
      "./src/assets/categories.json",
      JSON.stringify(allCategories, null, 2),
      () =>
        console.log(`All categories updated (${allCategories.length} entries)`),
    );
  })
  .catch(console.error);
