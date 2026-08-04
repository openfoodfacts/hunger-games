const fs = require("fs");
const axios = require("axios");

axios("https://static.openfoodfacts.org/data/taxonomies/categories.json")
  .then(({ data }) => {
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
      JSON.stringify(agribalyseCategories),
      () => console.log(`Agribalyse categories updated (${agribalyseCategories.length} entries)`),
    );
  })
  .catch(console.error);
