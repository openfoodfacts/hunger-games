const fs = require("fs");
const axios = require("axios");

const countries = require("./src/assets/countries.json");

const CAMPAIGN = "agribalyse-category";
const INSIGHT_TYPE = "category";
const PAGE_SIZE = 100;
const OUTPUT_PATH = "./src/assets/category-insight-counts.json";
const ROBOTOFF_BASE_URL = "https://robotoff.openfoodfacts.org/api/v1";

async function fetchCountsForCountry(countryCode) {
  const counts = {};
  let page = 1;

  while (true) {
    const params = new URLSearchParams({
      type: INSIGHT_TYPE,
      campaign: CAMPAIGN,
      count: PAGE_SIZE.toString(),
      page: page.toString(),
    });

    if (countryCode) {
      params.set("countries", countryCode);
    }

    const { data } = await axios.get(
      `${ROBOTOFF_BASE_URL}/questions/unanswered/?${params.toString()}`,
    );

    const questions = data?.questions ?? [];
    for (const question of questions) {
      // `/questions/unanswered/` can return either:
      // - tuples: [value_tag, count]
      // - question objects (count inferred by tallying)
      if (Array.isArray(question)) {
        const [categoryId, count] = question;
        counts[categoryId] = count;
        continue;
      }

      const categoryId = question?.value_tag ?? question?.value;
      if (!categoryId) {
        continue;
      }
      counts[categoryId] = (counts[categoryId] ?? 0) + 1;
    }

    if (questions.length < PAGE_SIZE) {
      break;
    }
    page += 1;
  }

  return counts;
}

async function main() {
  const countryCodes = [
    ...new Set(countries.map((country) => country.countryCode)),
  ];
  const output = {
    generatedAt: new Date().toISOString(),
    campaign: CAMPAIGN,
    type: INSIGHT_TYPE,
    pageSize: PAGE_SIZE,
    world: {},
    countries: {},
  };

  console.log("Fetching world counts...");
  output.world = await fetchCountsForCountry("");

  for (const countryCode of countryCodes) {
    console.log(`Fetching ${countryCode}...`);
    output.countries[countryCode] = await fetchCountsForCountry(countryCode);
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(
    `Category insight counts updated (world: ${Object.keys(output.world).length}, countries: ${Object.keys(output.countries).length})`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
