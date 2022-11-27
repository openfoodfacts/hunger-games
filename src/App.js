import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Routes, Route, useLocation } from "react-router-dom";
import { useMatomo } from "@jonkoops/matomo-tracker-react";
import axios from "axios";
import {
  EcoScorePage,
  LogoAnnotationPage,
  LogoSearchPage,
  LogoUpdatePage,
  LogoDeepSearch,
  ProductLogoAnnotationPage,
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
import {
  getColor,
  getIsDevMode,
  getVisiblePages,
  localSettingsKeys,
  localSettings,
} from "./localeStorageManager";
import LoginContext from "./contexts/login";
import off from "./off";
import { IS_DEVELOPMENT_MODE } from "./const";
import ColorModeContext from "./contexts/colorMode";

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
  }, [refresh]);

  const location = useLocation();
  const { trackPageView } = useMatomo();

  React.useEffect(() => {
    if (!IS_DEVELOPMENT_MODE) {
      trackPageView();
    }
  }, [location, trackPageView]);

  const showFlaggedImage = ADMINS.includes(userState.userName);

  const [mode, setMode] = React.useState(getColor);
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          localSettings.update(localSettingsKeys.colorMode, newMode);
          return newMode;
        });
      },
    }),
    []
  );

  const theme = createTheme({
    palette: {
      mode: mode,
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
        main: "#f6f3f0",
        contrastText: "rgba(0, 0, 0, 0.87)",
      },
    },
    components: {
      MuiLink: {
        defaultProps: { color: "inherit" },
      },
    },
  });

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
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
              <Route
                path="/logos/product-search"
                element={<ProductLogoAnnotationPage />}
              />
              <Route path="/logos/deep-search" element={<LogoDeepSearch />} />

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
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
