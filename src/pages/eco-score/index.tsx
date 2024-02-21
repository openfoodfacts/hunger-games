import * as React from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

import SmallQuestionCard from "../../components/SmallQuestionCard";
import Opportunities from "../../components/Opportunities";
import { DEFAULT_FILTER_STATE } from "../../components/QuestionFilter/const";
import { useTranslation } from "react-i18next";
import Loader from "../loader";
import { useSearchParams } from "react-router-dom";
import { localSettings } from "../../localeStorageManager";
import countryNames from "../../assets/countries.json";

const ecoScoreCards = [
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:organic",
    },
    title: "en:organic",
    imageSrc:
      "https://static.openfoodfacts.org/images/lang/fr/labels/bio.96x90.png",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:eu-organic",
    },
    title: "en:eu-organic",
    imageSrc:
      "https://static.openfoodfacts.org/images/lang/en/labels/eu-organic.135x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "fr:ab-agriculture-biologique",
    },
    title: "fr:ab-agriculture-biologique",
    imageSrc:
      "https://static.openfoodfacts.org/images/lang/fr/labels/ab-agriculture-biologique.74x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:eg-oko-verordnung",
    },
    title: "en:eg-oko-verordnung",
    imageSrc:
      "https://static.openfoodfacts.org/images/lang/de/labels/eg-oko-verordnung.110x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "fr:haute-valeur-environnementale",
    },
    title: "fr:haute-valeur-environnementale",
    imageSrc:
      "https://static.openfoodfacts.org/images/lang/fr/labels/haute-valeur-environnementale.90x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "fr:label-rouge",
    },
    title: "fr:label-rouge",
    imageSrc:
      "https://static.openfoodfacts.org/images/lang/fr/labels/label-rouge.90x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "fr:bleu-blanc-coeur",
    },
    title: "fr:bleu-blanc-coeur",
    imageSrc:
      "https://static.openfoodfacts.org/images/lang/fr/labels/bleu-blanc-coeur.98x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:roundtable-on-sustainable-palm-oil",
    },
    title: "en:roundtable-on-sustainable-palm-oil",
    imageSrc:
      "https://static.openfoodfacts.org/images/lang/en/labels/roundtable-on-sustainable-palm-oil.90x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:rainforest-alliance",
    },
    title: "en:rainforest-alliance",
    imageSrc:
      "https://static.openfoodfacts.org/images/lang/en/labels/rainforest-alliance.90x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:fairtrade-international",
    },
    title: "en:fairtrade-international",
    imageSrc:
      "https://static.openfoodfacts.org/images/lang/en/labels/fairtrade-international.77x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:max-havelaar",
    },
    title: "en:Max-Havelaar",
    imageSrc:
      "https://static.openfoodfacts.org/images/lang/en/labels/max-havelaar.64x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:sustainable-seafood-msc",
    },
    title: "en:sustainable-seafood-msc",
    imageSrc:
      "https://static.openfoodfacts.org/images/lang/en/labels/sustainable-seafood-msc.126x90.svg",
  },
  {
    filterState: {
      ...DEFAULT_FILTER_STATE,
      insightType: "label",
      valueTag: "en:responsible-aquaculture-asc",
    },
    title: "en:responsible-aquaculture-asc",
    imageSrc:
      "https://static.openfoodfacts.org/images/lang/en/labels/responsible-aquaculture-asc.188x90.svg",
  },
];

export default function EcoScore() {
  const { t } = useTranslation();
  const localData = localSettings.fetch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCountry, setSelectedCountry] = React.useState(
    searchParams.get("cc") || localData["country"] || "en:france",
  );

  React.useEffect(() => {
    setSearchParams({ cc: selectedCountry });
  }, [selectedCountry, searchParams]);

  return (
    <React.Suspense fallback={<Loader />}>
      <Stack
        spacing={2}
        sx={{
          padding: 5,
        }}
      >
        <Typography>{t("eco-score.description")}</Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gridGap: "10px 50px",
          }}
        >
          {ecoScoreCards.map((props) => (
            <Box key={props.title}>
              <SmallQuestionCard {...props} />
            </Box>
          ))}
        </Box>

        <Divider />
        <TextField
          select
          label={t("eco-score.countryLabel")}
          value={selectedCountry}
          onChange={(event) => {
            setSelectedCountry(event.target.value);
          }}
          sx={{ width: 200 }}
        >
          {countryNames.map((country) => (
            <MenuItem value={country.id} key={country.id}>
              {country.label}
            </MenuItem>
          ))}
        </TextField>

        <Opportunities
          type="category"
          country={selectedCountry}
          campaign="agribalyse-category"
        />
      </Stack>
    </React.Suspense>
  );
}
