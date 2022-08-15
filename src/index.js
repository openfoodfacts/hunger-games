import React from "react";
import ReactDOM from "react-dom/client";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";

import "./i18n";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { MatomoProvider, createInstance } from "@jonkoops/matomo-tracker-react";

const instance = createInstance({
  urlBase: "https://analytics.openfoodfacts.org/",
  siteId: 3,
});

const theme = createTheme({
  palette: {
    success: {
      main: "#8bc34a",
      contrastText: "#ffffff",
    },
    error: {
      main: "#ff5252",
      contrastText: "#ffffff",
    },
    primary: {
      main: "#ff8714",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ffefb7",
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
  },
  components: {
    MuiLink: {
      defaultProps: { color: "inherit" },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <MatomoProvider value={instance}>
          <App />
        </MatomoProvider>{" "}
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
