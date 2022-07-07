import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  EcoScorePage,
  LogoAnnotationPage,
  // LogoSearchPage,
  LogoUpdatePage,
  SettingsPage,
  QuestionsPage,
  InsightsPage,
  NotFoundPage,
  Home,
} from "./pages";
import ResponsiveAppBar from "./components/ResponsiveAppBar";

const theme = createTheme({});

export default function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ResponsiveAppBar />
        <Routes>
          {/* TODO: put a home page for root url */}
          <Route path="/" element={<Home />} />
          <Route path="/eco-score" element={<EcoScorePage />} />
          <Route path="/logos" element={<LogoAnnotationPage />} />
          {/* <Route path="/logos/search" element={<LogoSearchPage />} /> */}
          <Route path="/logos/:logoId" element={<LogoUpdatePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}
