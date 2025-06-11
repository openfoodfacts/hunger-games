import { OFF_IMAGE_URL, OFF_URL, ROBOTOFF_API_URL } from "../const";
import { useCountry } from "../contexts/CountryProvider";
import { getCountryLanguageCode } from "../pages/nutrition/utils";
import "@openfoodfacts/openfoodfacts-webcomponents";

const getLanguageCode = () => {
  const [country] = useCountry();

  return getCountryLanguageCode(country);
};

export const OffWebcomponentsConfiguration = () => {
  const languageCode = getLanguageCode();

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

export const RobotoffNutrientExtraction = () => {
  return (
    <div>
      <robotoff-nutrient-extraction
        display-product-link
      ></robotoff-nutrient-extraction>
    </div>
  );
};

export const RobotoffIngredientSpellcheck = () => {
  return (
    <div>
      <robotoff-ingredient-spellcheck
        display-product-link
      ></robotoff-ingredient-spellcheck>
    </div>
  );
};

export const RobotoffIngredientDetection = () => {
  return (
    <div>
      <robotoff-ingredient-detection
        display-product-link
      ></robotoff-ingredient-detection>
    </div>
  );
};
