import * as React from "react";
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
      assets-images-path="/assets/webcomponents"
    ></off-webcomponents-configuration>
  );
};

export const RobotoffNutrientExtraction = ({
  productCode,
}: {
  productCode?: string;
}) => {
  React.useEffect(() => {
    if (!productCode) {
      return;
    }

    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      const url = args[0];
      const urlString = typeof url === "string" ? url : url.toString();
      if (
        productCode &&
        urlString.includes(`${ROBOTOFF_API_URL}/insights`) &&
        urlString.includes(`barcode=${productCode}`)
      ) {
        const urlObj = new URL(urlString);
        urlObj.searchParams.delete("lc");
        urlObj.searchParams.delete("lang");
        const cleanedUrl = urlObj.toString();

        return originalFetch(cleanedUrl, args[1]);
      }

      return originalFetch.apply(this, args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [productCode]);

  return (
    <div>
      <robotoff-nutrient-extraction
        display-product-link
        product-code={productCode}
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
