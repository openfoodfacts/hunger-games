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

export const RobotoffNutrients = () => {
  return (
    <div>
      <robotoff-nutrients></robotoff-nutrients>
    </div>
  );
};

export const RobotoffIngredients = () => {
  const [searchParams] = useSearchParams();

  const country = searchParams.get("country");

  const languageCodes = JSON.stringify([getCountryLanguageCode(country)]);

  return (
    <div>
      <robotoff-ingredients
        language-codes={languageCodes}
      ></robotoff-ingredients>
    </div>
  );
};
