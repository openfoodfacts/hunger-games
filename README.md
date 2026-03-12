<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://images.openfoodfacts.org/images/logos/off-logo-horizontal-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://images.openfoodfacts.org/images/logos/off-logo-horizontal-light.svg">
  <img height="100" src="https://images.openfoodfacts.org/images/logos/off-logo-horizontal-light.png">
</picture>

# Hunger Games: Annotation games for Open Food Facts

Hunger Games is a series of mini-apps that let users contribute data to Open Food Facts, in a rather fun way using React. It relies heavily on Robotoff APIs, as well as Open Food Facts APIs.
You are very welcome to write the game you want.

## Why Hunger Games?

- Because we are sympathetic to Katniss' fight against Panem.
- Open Food Facts generates a lot of photos, and we need to turn them into reliable data about food and cosmetics, at very large scale.
- We process all pictures using top OCR and Machine earning techniques and get a lot of predictions about the products.
- We then need to let users leverage those predictions to easily complete products, in a fun way, on their desktop and/or mobile devices.

![GitHub language count](https://img.shields.io/github/languages/count/openfoodfacts/hunger-games)
![GitHub top language](https://img.shields.io/github/languages/top/openfoodfacts/hunger-games)
![GitHub last commit](https://img.shields.io/github/last-commit/openfoodfacts/hunger-games)
![Github Repo Size](https://img.shields.io/github/repo-size/openfoodfacts/hunger-games)

## 🕹️ Try it

The production website is available at https://hunger.openfoodfacts.org

The main goal is: Every Open Food Facts user can annotate products in a few minutes.

## 💬 Who do I talk to?

- Join us at [https://openfoodfacts.slack.com/](https://openfoodfacts.slack.com/) in the channel #hunger-games. (Signup at [https://slack.openfoodfacts.org/](https://slack.openfoodfacts.org/)

## 🎨 Design & User interface

- We strive for a playful and refined UI that's very efficient on the Web and on Mobile.
- [![Figma](https://img.shields.io/badge/figma-%23F24E1E.svg?logo=figma&logoColor=white) Mockups on the current app and future plans to discuss](https://www.figma.com/design/pngqJwPkytFik6h4EW396n/Hunger-Games?node-id=801-2&p=f&t=xQnrkht1cbTJGOw9-0)
- Are you a designer ? [Join the design team](https://github.com/openfoodfacts/openfoodfacts-design)

## 🐛 Outstanding issues

- We need performance improvements server side (degrading the experience)
- We need to step up our design, as well as cognitive load on the users for the questions

## 👩‍💻 Development

### Other projects that Hunger Games is built upon

Hunger Games is built upon the following projects. Contributions to these projects will benefit Hunger Games, and they use the same technologies (JavaScript):

- https://github.com/openfoodfacts/openfoodfacts-js
- https://github.com/openfoodfacts/openfoodfacts-webcomponents

### Requirements:

- [Node](https://nodejs.org)

### Setup

#### Node & Yarn

- [Install Node](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Install yarn](https://classic.yarnpkg.com/lang/en/docs/install/)
- Install libraries: `yarn install`
- run the project locally `yarn dev`

#### Build with Yarn

```
yarn build
```

#### Ensure you don't run into CORS issues

- You may encounter CORS issues while testing Hunger Games on your localhost. You can use an extension to overcome those CORS exceptions on localhost. [You can use this one](https://chromewebstore.google.com/detail/moesif-origincors-changer/digfbfaphojjndkpccljibejjbppifbc?pli=1), for no particular reason (we haven't checked it's safe to use)

#### Generate the Countries list

```
yarn countries
```

Generates the JSON file `src/assets/countries.json` which contains all the countries available on OFF taxonomy. Data are obtained from static.openfoodfacts.org

#### Update the Taxonomy auto-complete file

```
node update-taxonomy-suggestions.js
```

Fetch categories and labels taxonomy from Open Food Facts static files, and generate JSON files used by the `Autocomplete` fields.

#### Maintenance - How to define a dashboard

Go to `src/pages/logosValidator/dashboardDefinition.ts`. You have two objects to edit:

- `LOGOS` which contains the logos available in dashboards. Add the logos you need by providing at least `tag`, `label`, and `logo` properties.
- `DASHBOARD` which for a dashboard associates an array of logos.

### Libraries we depend on

- React
- [MUI](mui.com) (UI library based on material design)
- Axios (HTTP calls)

### APIs we depend on

Open Food Facts APIs and [Robotoff](https://github.com/openfoodfacts/robotoff)

## How you can help

For developers, you can have a look at [good first issues](https://github.com/openfoodfacts/hunger-games/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22good+first+issue%22) or ask on [slack](https://slack.openfoodfacts.org/) in hunger-games channel.

You can also help by improving [translation in your language](https://translate.openfoodfacts.org/translate/openfoodfacts/1942/en-fr?filter=basic&value=0), Or the [wiki page](https://wiki.openfoodfacts.org/Hunger_Games) of the project

## 📆 Weekly meetings (joint with the ML/Robotoff meeting)

- We e-meet some Tuesday at 11:00 Paris Time (10:00 London Time, 15:30 IST, 02:00 AM PT)
- [Weekly Agenda](https://drive.google.com/open?id=1RUfmWHjtFVaBcvQ17YfXu6FW6oRFWg-2lncljG0giKI): please add the Agenda items as early as you can. Make sure to check the Agenda items in advance of the meeting, so that we have the most informed discussions possible.
- The meeting will handle Agenda items first, and if time permits, collaborative bug triage.
- We strive to timebox the core of the meeting (decision making) to 30 minutes, with an optional free discussion/live debugging afterwards.
- We take comprehensive notes in the Weekly Agenda of agenda item discussions and of decisions taken.

## 👩‍⚖️ Licence

- See [LICENSE.md](./LICENSE.md)

## Contributors

<a href="https://github.com/openfoodfacts/hunger-games/graphs/contributors">
  <img alt="List of contributors to this repository" src="https://contrib.rocks/image?repo=openfoodfacts/hunger-games" />
</a>
