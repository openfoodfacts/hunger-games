import * as React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router";

import "./i18n";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { MatomoProvider, createInstance } from "@jonkoops/matomo-tracker-react";

const instance = createInstance({
  urlBase: "https://analytics.openfoodfacts.org/",
  siteId: 3,
});

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <MatomoProvider value={instance}>
        <App />
      </MatomoProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
