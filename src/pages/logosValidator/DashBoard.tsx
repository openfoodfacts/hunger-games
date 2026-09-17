import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

import { LOGOS, DASHBOARD } from "./dashboardDefinition";
import DashboardCard from "./DashboardCard";
import { Link, useLocation } from "react-router";

interface TabPanelProps {
  children?: React.ReactNode;
  hasBeenVisible: boolean;
  index: number;
  isActive: boolean;
}

type DashboardState = {
  value: number;
  visitedTabs: Set<number>;
};

type DashboardAction = {
  type: "routeChanged" | "tabSelected";
  index: number;
};

const createDashboardState = (index: number): DashboardState => ({
  value: index,
  visitedTabs: new Set([index]),
});

const dashboardStateReducer = (
  state: DashboardState,
  action: DashboardAction,
): DashboardState => {
  if (state.value === action.index && state.visitedTabs.has(action.index)) {
    return state;
  }

  return {
    value: action.index,
    visitedTabs: new Set(state.visitedTabs).add(action.index),
  };
};

const TabPanel = React.memo(function TabPanel({
  hasBeenVisible,
  isActive,
  index,
}: TabPanelProps) {
  const { t } = useTranslation();

  const dashboard = DASHBOARD[index];

  return (
    <Box
      role="tabpanel"
      hidden={!isActive}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      sx={{ minWidth: 0 }}
    >
      {hasBeenVisible && (
        <Box
          sx={{
            p: { xs: 2, sm: 3, lg: 4 },
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ alignItems: { xs: "flex-start", sm: "center" }, mb: 3 }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="overline"
                sx={{
                  color: "primary.main",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                }}
              >
                {t("logos.dashboard.category")}
              </Typography>
              <Typography
                component="h2"
                variant="h4"
                sx={{ fontWeight: 800, lineHeight: 1.15 }}
              >
                {dashboard.title}
              </Typography>
            </Box>
            <Chip
              color="secondary"
              label={t("logos.dashboard.logo_count", {
                count: dashboard.logos.length,
              })}
              sx={{ fontWeight: 700 }}
            />
          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {dashboard.logos.map((tag) => (
              <DashboardCard key={tag} {...LOGOS[tag]} />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
});

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

export default function VerticalTabs() {
  const getLocation = useLocation as unknown as () => { pathname: string };
  const location = getLocation();
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const dasboardId = location.pathname.split("/").filter(Boolean).at(-1);
  const dashboardIndex = DASHBOARD.findIndex(({ tag }) => tag === dasboardId);
  const initialDashboardIndex = dashboardIndex >= 0 ? dashboardIndex : 0;
  const [{ value, visitedTabs }, dispatch] = React.useReducer(
    dashboardStateReducer,
    initialDashboardIndex,
    createDashboardState,
  );

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    dispatch({ type: "tabSelected", index: newValue });
  };

  React.useEffect(() => {
    dispatch({
      type: "routeChanged",
      index: initialDashboardIndex,
    });
  }, [initialDashboardIndex]);

  return (
    <React.Suspense>
      <Box
        component="main"
        sx={(theme) => ({
          minHeight: "calc(100vh - 100px)",
          background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.action.hover} 100%)`,
        })}
      >
        <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
          <Box sx={{ mb: { xs: 2, sm: 2.5 } }}>
            <Typography
              component="h1"
              variant="h3"
              sx={{ fontWeight: 800, lineHeight: 1.1 }}
            >
              {t("logos.dashboard.title")}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 680, mt: 0.75 }}
            >
              {t("logos.dashboard.description")}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "220px minmax(0, 1fr)",
              },
              gap: { xs: 2, md: 2.5 },
              alignItems: "start",
            }}
          >
            <Paper
              variant="outlined"
              sx={(theme) => ({
                p: 1,
                borderRadius: 3,
                position: { md: "sticky" },
                top: { md: 16 },
                backgroundColor: theme.palette.background.paper,
              })}
            >
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  px: 1.5,
                  pt: 1,
                  pb: 0.75,
                  color: "text.secondary",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {t("logos.dashboard.categories")}
              </Typography>
              <Tabs
                orientation={isDesktop ? "vertical" : "horizontal"}
                variant="scrollable"
                value={value}
                onChange={handleChange}
                aria-label={t("logos.dashboard.categories")}
                sx={{
                  maxHeight: { md: "calc(100vh - 180px)" },
                  "& .MuiTabs-indicator": { display: "none" },
                  "& .MuiTab-root": {
                    alignItems: "flex-start",
                    borderRadius: 2,
                    color: "text.secondary",
                    minHeight: 44,
                    minWidth: { xs: 150, md: 0 },
                    px: 1.5,
                    py: 1,
                    textAlign: "left",
                    textTransform: "none",
                  },
                  "& .MuiTab-root.Mui-selected": {
                    backgroundColor: "action.selected",
                    color: "text.primary",
                    fontWeight: 700,
                  },
                }}
              >
                {DASHBOARD.map(({ tag, title }, index) => (
                  <Tab
                    label={title}
                    key={tag}
                    {...a11yProps(index)}
                    component={Link as React.ElementType}
                    to={`/dashboard/${tag}`}
                  />
                ))}
              </Tabs>
            </Paper>
            <Paper
              variant="outlined"
              sx={{ borderRadius: 3, overflow: "hidden" }}
            >
              {DASHBOARD.map((_, index) => (
                <TabPanel
                  hasBeenVisible={visitedTabs.has(index)}
                  isActive={value === index}
                  key={index}
                  index={index}
                />
              ))}
            </Paper>
          </Box>
        </Container>
      </Box>
    </React.Suspense>
  );
}
