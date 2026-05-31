import * as React from "react";
import { OFF_IMAGE_URL, OFF_URL, ROBOTOFF_API_URL } from "../const";
import { useTranslation } from "react-i18next";
import "@openfoodfacts/openfoodfacts-webcomponents";

export const OffWebcomponentsConfiguration = () => {
  const { i18n } = useTranslation();
  // Ensure we have a valid 2-letter language code
  const languageCode = i18n.language?.substring(0, 2) || "en";

  const robotoffConfiguration = JSON.stringify({
    apiUrl: ROBOTOFF_API_URL,
    imgUrl: OFF_IMAGE_URL,
  });

  return (
    <off-webcomponents-configuration
      robotoff-configuration={robotoffConfiguration}
      openfoodfacts-api-url={OFF_URL}
      language-code={languageCode}
      assets-images-path="/assets/webcomponents"
    ></off-webcomponents-configuration>
  );
};

export const RobotoffNutrientExtraction = ({
  productCode,
  countryCode,
}: {
  productCode?: string;
  countryCode?: string;
}) => {
  return (
    <robotoff-nutrient-extraction
      display-product-link
      product-code={productCode}
      country-codes={countryCode}
      key={`${productCode}-${countryCode || "all"}`}
    />
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
