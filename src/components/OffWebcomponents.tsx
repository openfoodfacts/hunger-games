import { useSearchParams } from "react-router-dom";
import { OFF_IMAGE_URL, OFF_URL, ROBOTOFF_API_URL } from "../const";
import { useCountry } from "../contexts/CountryProvider";
import { getCountryLanguageCode } from "../pages/nutrition/utils";
import "@openfoodfacts/openfoodfacts-webcomponents";
import { json } from "stream/consumers";

export const OffWebcomponentsConfiguration = () => {
  const [country] = useCountry();

  const languageCode = getCountryLanguageCode(country);

  const robotoffConfiguration = JSON.stringify({
    apiUrl: ROBOTOFF_API_URL,
    imgUrl: OFF_IMAGE_URL,
  });

  return (
    <off-webcomponents-configuration
      robotoff-configuration={robotoffConfiguration}
      openfoodfacts-api-url={OFF_URL}
      language-code={languageCode}
    ></off-webcomponents-configuration>
  );
};

const getLanguageCodes = () => {
  const [searchParams] = useSearchParams();

  const country = searchParams.get("country");

  return JSON.stringify([getCountryLanguageCode(country)]);
};

export const RobotoffNutrientExtraction = () => {
  const languageCodes = getLanguageCodes();

  return (
    <div>
      <robotoff-nutrient-extraction
        language-codes={languageCodes}
      ></robotoff-nutrient-extraction>
    </div>
  );
};

export const RobotoffIngredientSpellcheck = () => {
  const languageCodes = getLanguageCodes();

  return (
    <div>
      <robotoff-ingredient-spellcheck
        language-codes={languageCodes}
      ></robotoff-ingredient-spellcheck>
    </div>
  );
};

export const RobotoffIngredientDetection = () => {
  const languageCodes = getLanguageCodes();
  return (
    <div>
      <robotoff-ingredient-detection
        language-codes={languageCodes}
      ></robotoff-ingredient-detection>
    </div>
  );
};
