import * as React from "react";
import { OFF_IMAGE_URL, OFF_URL, ROBOTOFF_API_URL } from "../const";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";

let webcomponentsLoadPromise: Promise<unknown> | undefined;

const loadWebcomponents = () => {
  webcomponentsLoadPromise ??=
    import("@openfoodfacts/openfoodfacts-webcomponents");
  return webcomponentsLoadPromise;
};

export const OffWebcomponentsConfiguration = () => {
  const { i18n } = useTranslation();

  React.useEffect(() => {
    void loadWebcomponents().catch((error) => {
      console.error("Failed to load Open Food Facts webcomponents", error);
    });
  }, []);

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

const useWebcomponentsThemeStyle = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return {
    "--off-input-bg": isDark ? "#2b2b2b" : "#fafafa",
    "--off-input-border": isDark ? "#555555" : "#cccccc",
    "--off-input-color": isDark ? "#eeeeee" : "#333333",
    "--off-card-bg": isDark ? "#1e1e1e" : "#ffffff",
    "--off-text-color": isDark ? "#f0f0f0" : "#222222",
    color: isDark ? "#f0f0f0" : "#222222",
    width: "100%",
  } as React.CSSProperties;
};

export const RobotoffNutrientExtraction = ({
  productCode,
  countryCode,
}: {
  productCode?: string;
  countryCode?: string;
}) => {
  const themeStyle = useWebcomponentsThemeStyle();

  return (
    <div style={themeStyle}>
      <robotoff-nutrient-extraction
        display-product-link
        product-code={productCode}
        country-codes={countryCode}
        key={`${productCode}-${countryCode || "all"}`}
      />
    </div>
  );
};

export const RobotoffIngredientSpellcheck = () => {
  const themeStyle = useWebcomponentsThemeStyle();

  return (
    <div style={themeStyle}>
      <robotoff-ingredient-spellcheck
        display-product-link
      ></robotoff-ingredient-spellcheck>
    </div>
  );
};

export const RobotoffIngredientDetection = () => {
  const themeStyle = useWebcomponentsThemeStyle();

  return (
    <div style={themeStyle}>
      <robotoff-ingredient-detection
        display-product-link
      ></robotoff-ingredient-detection>
    </div>
  );
};
