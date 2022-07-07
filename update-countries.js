const fs = require("fs");
const axios = require("axios");

axios("https://static.openfoodfacts.org/data/taxonomies/countries.json")
  .then(({ data }) => {
    fs.writeFile(
      "./src/assets/countries.json",
      JSON.stringify(
        Object.entries(data)
          .map(([key, value]) => ({
            id: key,
            label: value.name.en,
            languageCode:
              value.languages === undefined
                ? "en"
                : value.languages.en === undefined
                ? undefined
                : value.languages.en.split(",")[0],
            countryCode:
              value.country_code_2 === undefined
                ? undefined
                : value.country_code_2.en,
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
      ),
      () => console.log("Countries updated")
    );
  })
  .catch(console.error);
