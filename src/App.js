import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
} from "./pages";
import ResponsiveAppBar from "./components/ResponsiveAppBar";
import DevModeContext from "./contexts/devMode";
import { getIsDevMode, getVisiblePages } from "./localeStorageManager";
import LoginContext from "./contexts/login";
import off from "./off";

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
    async function firstFetch() {
      const isLoggedIn = await refresh();
      console.log(isLoggedIn);
    }

    firstFetch();
  });

  return (
    <Router>
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
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/questions" element={<QuestionsPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/nutriscore" element={<NutriscoreValidator />} />
            </Routes>
          </DevModeContext.Provider>
        </LoginContext.Provider>
      </ThemeProvider>
    </Router>
  );
}
