import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Routes, Route, useLocation } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMatomo } from "@jonkoops/matomo-tracker-react";
import axios from "axios";

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
import { IS_DEVELOPMENT_MODE, OFF_URL } from "./const";
import ColorModeContext from "./contexts/colorMode";

import Loader from "./pages/loader";
import { CountryProvider } from "./contexts/CountryProvider";

const GreenScorePage = React.lazy(() => import("./pages/green-score"));
const LogoAnnotationPage = React.lazy(
  () => import("./pages/logos/LogoAnnotation"),
);
const LogoSearchPage = React.lazy(() => import("./pages/logos/LogoSearch"));
const LogoUpdatePage = React.lazy(() => import("./pages/logos/LogoUpdate"));
const LogoDeepSearch = React.lazy(() => import("./pages/logos/LogoDeepSearch"));
const ProductLogoAnnotationPage = React.lazy(
  () => import("./pages/logos/ProductLogoAnnotations"),
);
const SettingsPage = React.lazy(() => import("./pages/settings"));
const QuestionsPage = React.lazy(() => import("./pages/questions"));
const InsightsPage = React.lazy(() => import("./pages/insights"));
const NotFoundPage = React.lazy(() => import("./pages/not-found"));
const Home = React.lazy(() => import("./pages/home"));
const Nutrition = React.lazy(() => import("./pages/nutrition"));
const FlaggedImages = React.lazy(() => import("./pages/flaggedImages"));
const ShouldLoggedinPage = React.lazy(
  () => import("./pages/shouldLoggedinPage"),
);
const PackagingPage = React.lazy(() => import("./pages/packaging"));
const LogoQuestionValidator = React.lazy(
  () => import("./pages/logosValidator/LogoQuestionValidator"),
);
const DashBoard = React.lazy(() => import("./pages/logosValidator/DashBoard"));
const GalaBoard = React.lazy(() => import("./pages/GalaPage"));
const IngredientPage = React.lazy(() => import("./pages/ingredients"));
const Brandinator = React.lazy(() => import("./pages/Brandinator"));
const BugPage = React.lazy(() => import("./pages/bug"));

const TaxonomyWalk = React.lazy(() => import("./pages/taxonomyWalk"));

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
    success: { main: "#8bc34a", contrastText: white },
    error: { main: "#ff5252", contrastText: white },
    primary: {
      ...(colorMode === "dark"
        ? { dark: mocha, main: macchiato, light: macchiato }
        : { dark: ristreto, main: chocolate, light: cortado }),
      contrastText: white,
    },
    secondary: {
      ...(colorMode === "dark"
        ? { dark: chocolate, main: cortado, light: mocha }
        : { light: latte, main: cappucino, dark: latteMacchiato }),
      contrastText: black,
    },
    cafeCreme:
      colorMode === "dark"
        ? { main: ristreto, contrastText: white }
        : { main: cafecreme, contrastText: black },
  },
  components: { MuiLink: { defaultProps: { color: "inherit" } } },
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

const queryClient = new QueryClient();

export default function App() {
  const [devMode, setDevMode] = React.useState(getIsDevMode);
  const [visiblePages, setVisiblePages] = React.useState(getVisiblePages);
  const [userState, setUserState] = React.useState(() => {
    if (IS_DEVELOPMENT_MODE) {
      return { userName: "", isLoggedIn: true };
    }
    return { userName: "", isLoggedIn: false };
  });
  const lastSeenCookie = React.useRef(null);

  const refresh = React.useCallback(async () => {
    if (IS_DEVELOPMENT_MODE) {
      setUserState({ userName: "", isLoggedIn: true });
      return true;
    }

    const sessionCookie = off.getCookie("session");
    if (sessionCookie === lastSeenCookie.current) {
      return userState.isLoggedIn;
    }
    if (!sessionCookie) {
      setUserState({ userName: "", isLoggedIn: false });
      lastSeenCookie.current = sessionCookie;
      return false;
    }
    const isLoggedIn = await axios
      .get(`${OFF_URL}/cgi/auth.pl`, { withCredentials: true })
      .then(() => {
        const cookieUserName = off.getUsername();
        setUserState({ userName: cookieUserName, isLoggedIn: true });
        lastSeenCookie.current = sessionCookie;
        return true;
      })
      .catch(() => {
        setUserState({ userName: "", isLoggedIn: false });
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
    [],
  );

  const theme = createTheme(getToken(mode));

  return (
    <React.Suspense fallback={<Loader />}>
      <CountryProvider>
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <LoginContext.Provider value={{ ...userState, refresh }}>
              <DevModeContext.Provider
                value={{ devMode, setDevMode, visiblePages, setVisiblePages }}
              >
                <QueryClientProvider client={queryClient}>
                  <CssBaseline />
                  <ResponsiveAppBar />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/eco-score" element={<GreenScorePage />} />
                    <Route path="/green-score" element={<GreenScorePage />} />
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
                    <Route
                      path="/ingredients"
                      element={
                        // userState.isLoggedIn ? (
                        <IngredientPage />
                        // ) : (
                        //   <ShouldLoggedinPage />
                        // )
                      }
                    />

                    <Route path="/brandinator" element={<Brandinator />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/questions" element={<QuestionsPage />} />
                    <Route path="/insights" element={<InsightsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                    <Route path="/logoQuestion/" elemnt={<DashBoard />} />
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

                    <Route path="/dashboard/" element={<DashBoard />} />
                    <Route
                      path="/dashboard/:dasboardId"
                      element={<DashBoard />}
                    />
                    {/**
                     * To delete in 2025 because nutriscore and inao are now availabel as
                     * - dasboard/nutriscore
                     * - dasboard/inao
                     */}
                    <Route path="/nutriscore" element={<DashBoard />} />
                    <Route path="/inao" element={<DashBoard />} />

                    <Route
                      path="/nutrition"
                      element={
                        userState.isLoggedIn ? (
                          <Nutrition />
                        ) : (
                          <ShouldLoggedinPage />
                        )
                      }
                    />
                    {showFlaggedImage && (
                      <Route
                        path="/flagged-images"
                        element={<FlaggedImages />}
                      />
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
                    <Route path="/gala" element={<GalaBoard />} />
                    <Route path="/bugs" element={<BugPage />} />
                    <Route path="/taxo-walk" element={<TaxonomyWalk />} />
                  </Routes>
                </QueryClientProvider>
              </DevModeContext.Provider>
            </LoginContext.Provider>
          </ThemeProvider>
        </ColorModeContext.Provider>
      </CountryProvider>
    </React.Suspense>
  );
}
