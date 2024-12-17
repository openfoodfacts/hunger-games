const fs = require("fs");
const axios = require("axios");

axios("https://static.openfoodfacts.org/data/taxonomies/countries.json")
  .then(({ data }) => {
    fs.writeFile(
      "./src/assets/countries.json",
      JSON.stringify(
        Object.entries(data)
          .map(([key, value]) => {
            let countryCode =
              value.country_code_2 === undefined
                ? undefined
                : value.country_code_2.en.toLowerCase();
            if (countryCode === "world") {
              countryCode = "";
            }

            const languageCode =
              value.language_codes === undefined
                ? "en"
                : value.language_codes.en === undefined
                ? undefined
                : value.language_codes.en.split(",")[0];
            return {
              id: key,
              label: value.name.en,
              languageCode,
              countryCode,
            };
          })
          .filter((country) => country.countryCode !== undefined)
          .sort((a, b) => a.label.localeCompare(b.label)),
      ),
      () => console.log("Countries updated"),
    );
    fs.writeFile(
      "./src/assets/languages.json",
      JSON.stringify(
        [
          ...new Set(
            Object.values(data)
              .map((value) => {
                const languageCode =
                  value.language_codes === undefined
                    ? "en"
                    : value.language_codes.en === undefined
                    ? undefined
                    : value.language_codes.en.split(",")[0];
                return languageCode;
              })
              .filter(Boolean),
          ),
        ].sort(),
      ),
      () => console.log("Countries updated"),
    );
  })
  .catch(console.error);
