import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  EcoScorePage,
  LogoAnnotationPage,
  LogoSearchPage,
  LogoUpdatePage,
  SettingsPage,
  QuestionsPage,
  InsightsPage,
  NotFoundPage,
  NutriscoreValidator,
  Home,
} from "./pages";
import ResponsiveAppBar from "./components/ResponsiveAppBar";
import DevModeContext from "./contexts/devMode";
import {
  getIsDevMode,
  getShowDatabase,
  getShowNutriscore,
} from "./localeStorageManager";

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

export default function App() {
  const [devMode, setDevMode] = React.useState(getIsDevMode);
  const [showDatabase, setShowDatabase] = React.useState(getShowDatabase);
  const [showNutriscore, setShowNutriscore] = React.useState(getShowNutriscore);

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <DevModeContext.Provider
          value={{
            devMode,
            setDevMode,
            showDatabase,
            setShowDatabase,
            showNutriscore,
            setShowNutriscore,
          }}
        >
          <CssBaseline />
          <ResponsiveAppBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/eco-score" element={<EcoScorePage />} />
            <Route path="/logos" element={<LogoAnnotationPage />} />
            <Route path="/logos/search" element={<LogoSearchPage />} />
            <Route path="/logos/:logoId" element={<LogoUpdatePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/nutriscore" element={<NutriscoreValidator />} />
          </Routes>
        </DevModeContext.Provider>
      </ThemeProvider>
    </Router>
  );
}
