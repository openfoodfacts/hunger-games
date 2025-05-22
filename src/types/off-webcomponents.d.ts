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
    "robotoff-nutrients": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & { barcode?: string },
      HTMLElement
    >;
  }
}
