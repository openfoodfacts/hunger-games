# Hunger Games: One-click categorizer for Open Food Facts

Hunger Games is a series of mini-apps that let users contribute data to Open Food Facts, in a rather fun way using React.
You are very welcome to write the game you want.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://static.openfoodfacts.org/images/logos/off-logo-horizontal-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="https://static.openfoodfacts.org/images/logos/off-logo-horizontal-light.png">
  <img height="100" src="https://static.openfoodfacts.org/images/logos/off-logo-horizontal-light.png">
</picture>

## Try it

The production website is available at https://hunger.openfoodfacts.org

## Why Hunger Games?

- Because we are sympathetic to Katniss' fight against Panem.
- Open Food Facts generates a lot of photos, and we need to turn them into reliable data about food and cosmetics, at very large scale.
- We process all pictures using top OCR techniques and get a lot of raw text and entities (logos) about the products.
- We then need to let users leverage this data to easily complete products, in a fun way, on their mobiles.

The main goal is: Every OpenFoodFact user can annotate products in a few minutes.

## Who do I talk to?

- Join us at [https://openfoodfacts.slack.com/](https://openfoodfacts.slack.com/) in the channel #hunger-games.

## Requirements:

- [Node](https://nodejs.org)

## Setup:

- Install libraries `yarn install`
- run the project locally `yarn start` (available on http://localhost:3000)

## Libraries:

- React
- [MUI](mui.com) (UI library based on material design)
- Axios (HTTP calls)

## APIs:

OFF APIs and [Robotoff](https://github.com/openfoodfacts/robotoff)

## Build

- `yarn build`

Use a [simple webpack config](https://github.com/facebook/create-react-app/issues/3365#issuecomment-376546407) to bundle in a single file (build/bundle.min.js) and facilitate integration in OFF main site

## Countries list

- `yarn countries`

Generate the JSON file `src/assets/countries.json` which contains all the countries available on OFF taxonomy. Data are obtained from static.openfoodfacts.org

## Taxonomy auto-complete

- `node update-taxonomy-suggestions.js`

Fetch categories and labels taxonomy from OpenFoodFacts static files, and generate JSON files used by the `Autocomplete` fields.

## How you can help

For developers, you can have a look at [good first issues](https://github.com/openfoodfacts/hunger-games/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22good+first+issue%22) or ask on [slack](https://slack.openfoodfacts.org/) in hunger-games channel.

You can also help by improving [translation in your language](https://translate.openfoodfacts.org/translate/openfoodfacts/1942/en-fr?filter=basic&value=0), Or the [wiki page](https://wiki.openfoodfacts.org/Hunger_Games) of the project
