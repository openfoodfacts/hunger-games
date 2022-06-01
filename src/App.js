import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { EcoScorePage, LogosPage, SettingsPage, QuestionsPage, InsightsPage } from "./pages";

export default function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/eco-score">eco-score</Link>
            </li>
            <li>
              <Link to="/logos">logos</Link>
            </li>
            <li>
              <Link to="/settings">settings</Link>
            </li>
          </ul>
        </nav>
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
