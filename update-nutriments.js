const fs = require("fs");
const axios = require("axios");

function parseNutrients(data, depth = 0) {
  return data.flatMap((item) => {
    const { display_in_edit_form, unit, id, name, nutrients } = item;

    if (nutrients === undefined) {
      return {
        id,
        name,
        unit,
        ...(display_in_edit_form ? { display: true } : {}),
        ...(depth > 0 ? { depth } : {}),
      };
    }
    return [
      {
        id,
        name,
        unit,
        ...(display_in_edit_form ? { display: true } : {}),
        ...(depth > 0 ? { depth } : {}),
      },
      ...parseNutrients(nutrients, depth + 1),
    ];
  });
}

axios("https://world.openfoodfacts.org/cgi/nutrients.pl")
  .then(({ data }) => {
    fs.writeFile(
      "./src/assets/nutriments.json",
      JSON.stringify(parseNutrients(data.nutrients)),
      () => console.log("nutriments updated"),
    );
  })
  .catch(console.error);
