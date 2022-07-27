# Hunger Games: One-click categorizer for Open Food Facts

Hunger Games is a series of mini-apps that let users contribute data to Open Food Facts, in a rather fun way using React.
You are very welcome to write the game you want.

![Open Food Facts](https://static.openfoodfacts.org/images/logos/off-logo-horizontal-dark.svg#gh-dark-mode-only)
![Open Food Facts](https://static.openfoodfacts.org/images/logos/off-logo-horizontal-light.svg#gh-light-mode-only)

## Try it

The production website is available at https://hunger.openfoodfacts.org

## Why Hunger Games?

- Because we are sympathetic to Katniss' fight against Panem.
- Open Food Facts generates a lot of photos, and we need to turn them into reliable data about food and cosmetics, at very large scale.
- We process all pictures using top OCR techniques and get a lot of raw text and entities (logos) about the products.
- We then need to let users leverage this data to easily complete products, in a fun way, on their mobiles.

The main goal is: Every OpenFoodFact user can annotate products in a few minutes.

## Requirements:

- [Node](https://nodejs.org)

## Setup:

- Install libraries `yarn install`
- run the project locally `yarn start` (available on http://localhost:3000)

To test the ingredients parts, add `?type=ingredients` to the URL

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
