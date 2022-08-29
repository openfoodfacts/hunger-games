import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Routes, Route, useLocation } from "react-router-dom";
import { useMatomo } from "@jonkoops/matomo-tracker-react";
import axios from "axios";
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
  Nutrition,
  FlaggedImages,
} from "./pages";
import ResponsiveAppBar from "./components/ResponsiveAppBar";
import DevModeContext from "./contexts/devMode";
import { getIsDevMode, getVisiblePages } from "./localeStorageManager";
import LoginContext from "./contexts/login";
import off from "./off";
import { IS_DEVELOPMENT_MODE } from "./const";

const ADMINS = [
  "alex-off",
  "charlesnepote",
  "gala-nafikova",
  "hangy",
  "manoncorneille",
  "raphael0202",
  "stephane",
  "tacinte",
  "teolemon",
  "alexfauquette",
];

export default function App() {
  const [devMode, setDevMode] = React.useState(getIsDevMode);
  const [visiblePages, setVisiblePages] = React.useState(getVisiblePages);
  const [userState, setUserState] = React.useState({
    userName: "",
    isLoggedIn: false,
  });
  const lastSeenCookie = React.useRef(null);

  const refresh = React.useCallback(async () => {
    const sessionCookie = off.getCookie("session");
    if (sessionCookie === lastSeenCookie.current) {
      return userState.isLoggedIn;
    }
    if (!sessionCookie) {
      setUserState({
        userName: "",
        isLoggedIn: false,
      });
      lastSeenCookie.current = sessionCookie;
      return false;
    }
    const isLoggedIn = await axios
      .get("https://world.openfoodfacts.org/cgi/auth.pl", {
        withCredentials: true,
      })
      .then((rep) => {
        const cookieUserName = off.getUsername();
        setUserState({
          userName: cookieUserName,
          isLoggedIn: true,
        });
        lastSeenCookie.current = sessionCookie;
        return true;
      })
      .catch((err) => {
        setUserState({
          userName: "",
          isLoggedIn: false,
        });
        lastSeenCookie.current = sessionCookie;
        return false;
      });

    return isLoggedIn;
  }, [userState.isLoggedIn]);

  React.useEffect(() => {
    refresh();
  });

  const location = useLocation();
  const { trackPageView } = useMatomo();

  React.useEffect(() => {
    if (!IS_DEVELOPMENT_MODE) {
      trackPageView();
    }
  }, [location, trackPageView]);

  const showFlaggedImage = ADMINS.includes(userState.userName);

  return (
    <LoginContext.Provider value={{ ...userState, refresh }}>
      <DevModeContext.Provider
        value={{
          devMode,
          setDevMode,
          visiblePages,
          setVisiblePages,
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
          <Route path="/nutrition" element={<Nutrition />} />
          {showFlaggedImage && (
            <Route path="/flagged-images" element={<FlaggedImages />} />
          )}
        </Routes>
      </DevModeContext.Provider>
    </LoginContext.Provider>
  );
}
