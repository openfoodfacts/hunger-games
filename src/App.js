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
  Home,
  Nutrition,
  FlaggedImages,
  ShouldLoggedinPage,
  PackagingPage,
  LogoQuestionValidator,
  DashBoard,
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

// OFF colors
const latte = "#F6F3F0";
const cappucino = "#EDE0DB";
const latteMacchiato = "#DCC9C0";
const mocha = "#85746C";
const chocolate = "#341100";
const macchiato = "#A08D84";
const cortado = "#52443D";
const ristreto = "#201A17";

// additional top bar color between latte and cappucino
const cafecreme = "#f2e9e4";

const white = "#ffffff";
const black = "#000000";

const getToken = (colorMode) => ({
  palette: {
    mode: colorMode,
    success: {
      main: "#8bc34a",
      contrastText: white,
    },
    error: {
      main: "#ff5252",
      contrastText: white,
    },
    primary: {
      ...(colorMode === "dark"
        ? {
            dark: mocha,
            main: macchiato,
            light: macchiato,
          }
        : {
            dark: ristreto,
            main: chocolate,
            light: cortado,
          }),
      contrastText: white,
    },
    secondary: {
      ...(colorMode === "dark"
        ? {
            dark: chocolate,
            main: cortado,
            light: mocha,
          }
        : {
            light: latte,
            main: cappucino,
            dark: latteMacchiato,
          }),
      contrastText: black,
    },
    cafeCreme:
      colorMode === "dark"
        ? { main: ristreto, contrastText: white }
        : { main: cafecreme, contrastText: black },
  },
  components: {
    MuiLink: {
      defaultProps: { color: "inherit" },
    },
  },
});

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
  const [userState, setUserState] = React.useState(() => {
    if (IS_DEVELOPMENT_MODE) {
      return {
        userName: "",
        isLoggedIn: true,
      };
    }
    return {
      userName: "",
      isLoggedIn: false,
    };
  });
  const lastSeenCookie = React.useRef(null);

  const refresh = React.useCallback(async () => {
    if (IS_DEVELOPMENT_MODE) {
      setUserState({
        userName: "",
        isLoggedIn: true,
      });
      return true;
    }

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

  const theme = createTheme(getToken(mode));

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
              <Route
                path="/logos"
                element={
                  userState.isLoggedIn ? (
                    <LogoAnnotationPage />
                  ) : (
                    <ShouldLoggedinPage />
                  )
                }
              />
              <Route
                path="/logos/search"
                element={
                  userState.isLoggedIn ? (
                    <LogoSearchPage />
                  ) : (
                    <ShouldLoggedinPage />
                  )
                }
              />
              <Route
                path="/logos/:logoId"
                element={
                  userState.isLoggedIn ? (
                    <LogoUpdatePage />
                  ) : (
                    <ShouldLoggedinPage />
                  )
                }
              />
              <Route
                path="/logos/product-search"
                element={
                  userState.isLoggedIn ? (
                    <ProductLogoAnnotationPage />
                  ) : (
                    <ShouldLoggedinPage />
                  )
                }
              />
              <Route
                path="/logos/deep-search"
                element={
                  userState.isLoggedIn ? (
                    <LogoDeepSearch />
                  ) : (
                    <ShouldLoggedinPage />
                  )
                }
              />

              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/questions" element={<QuestionsPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/logoQuestion/" elemnt={<DashBoard />} />
              <Route path="/dashboard/" element={<DashBoard />} />
              <Route
                path="/logoQuestion/:valueTag"
                element={
                  userState.isLoggedIn ? (
                    <LogoQuestionValidator />
                  ) : (
                    <ShouldLoggedinPage />
                  )
                }
              />
              {/*  To delete in 2024 */}
              <Route path="/nutriscore" element={<DashBoard />} />
              <Route path="/inao" element={<DashBoard />} />

              <Route
                path="/nutrition"
                element={
                  userState.isLoggedIn ? <Nutrition /> : <ShouldLoggedinPage />
                }
              />
              {showFlaggedImage && (
                <Route path="/flagged-images" element={<FlaggedImages />} />
              )}

              <Route
                path="/packaging"
                element={
                  userState.isLoggedIn ? (
                    <PackagingPage />
                  ) : (
                    <ShouldLoggedinPage />
                  )
                }
              />
            </Routes>
          </DevModeContext.Provider>
        </LoginContext.Provider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
