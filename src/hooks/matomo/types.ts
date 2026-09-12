export interface MatomoInstance {
  /**
   * Tracks a page view in Matomo.
   * This should be called whenever the user navigates to a new page or route in your application.
   * @returns
   */
  trackPageView: () => void;
  /**
   * Tracks a custom event in Matomo.
   * @param category The category of the event (e.g., "Video", "Button").
   * @param action The action that occurred (e.g., "Play", "Click").
   * @param name Optional name for the event (e.g., "Homepage Video").
   * @param value Optional numeric value associated with the event (e.g., 42).
   */
  trackEvent: (params: {
    category: string;
    action: string;
    name?: string;
    value?: number;
  }) => void;
}

export interface MatomoConfig {
  /** The base URL of your Matomo instance (e.g., "https://matomo.example.com/"). */
  urlBase: string;
  /** The site ID configured in Matomo for your application. */
  siteId: number;
}

declare global {
  interface Window {
    _paq: unknown[][];
  }
}
