declare namespace JSX {
  interface IntrinsicElements {
    "off-webcomponents-configuration": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        "robotoff-configuration"?: string;
        "openfoodfacts-api-url"?: string;
        languageCode?: string;
      },
      HTMLElement
    >;

    "robotoff-nutrient-extraction": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        "product-code"?: string;
        "country-codes"?: string;
        "language-codes"?: string;
        "display-product-link"?: boolean;
      },
      HTMLElement
    >;
    "robotoff-ingredient-spellcheck": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    "robotoff-ingredient-detection": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
  }
}
