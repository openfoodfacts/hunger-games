import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { EcoScorePage, LogosPage, SettingsPage, QuestionsPage, InsightsPage } from "./pages";
import ResponsiveAppBar from "./components/ResponsiveAppBar";

export default function App() {
  return (
    <Router>
      <CssBaseline />
      <div>
        <ResponsiveAppBar />
        <Routes>
          <Route path="eco-score" element={<EcoScorePage />} />
          <Route path="logos" element={<LogosPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="questions" element={<QuestionsPage />} />
          <Route path="insights" element={<InsightsPage />} />
        </Routes>
      </div>
    </Router>
  );
}
