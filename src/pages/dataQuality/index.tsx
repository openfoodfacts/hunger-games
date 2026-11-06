import * as React from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";

import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import Loader from "../loader";
import DailyMissionCard from "./DailyMissionCard";
import MetricsOverview from "./MetricsOverview";
import LeaderboardCard from "./LeaderboardCard";
import HelpAndResources from "./HelpAndResources";

import {
  SAMPLE_DATA_QUALITY_PRODUCTS,
  INITIAL_METRICS,
  INITIAL_LEADERBOARD,
  getUserStats,
} from "./dataQualityService";
import { DataQualityProduct } from "./types";

const useTypedSearchParams = useSearchParams as unknown as () => [
  URLSearchParams,
  (params: Record<string, string>, opts?: { replace?: boolean }) => void,
];

export default function DataQualityDashboard() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [searchParams, setSearchParams] = useTypedSearchParams();

  const tabParam = searchParams.get("tab");
  const initialTabIndex =
    tabParam === "metrics"
      ? 1
      : tabParam === "leaderboard"
        ? 2
        : tabParam === "resources"
          ? 3
          : 0;

  const [currentTab, setCurrentTab] = React.useState(initialTabIndex);
  const [userStats, setUserStats] = React.useState(getUserStats);
  const [productsPool, setProductsPool] = React.useState<DataQualityProduct[]>(
    SAMPLE_DATA_QUALITY_PRODUCTS,
  );
  const [visibleCount, setVisibleCount] = React.useState(3);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    const tabName =
      newValue === 1
        ? "metrics"
        : newValue === 2
          ? "leaderboard"
          : newValue === 3
            ? "resources"
            : "mission";
    setSearchParams({ tab: tabName }, { replace: true });
  };

  const handleProductFixed = (barcode: string) => {
    setUserStats(getUserStats());
    // Mark as fixed locally
    setProductsPool((prev) =>
      prev.map((p) => (p.code === barcode ? { ...p, status: "fixed" } : p)),
    );
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(productsPool.length, prev + 3));
  };

  const handleShuffle = () => {
    setProductsPool((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const visibleProducts = React.useMemo(() => {
    return productsPool.slice(0, visibleCount);
  }, [productsPool, visibleCount]);

  return (
    <React.Suspense fallback={<Loader />}>
      <Box
        component="main"
        sx={{
          minHeight: "calc(100vh - 100px)",
          background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.action.hover} 100%)`,
          py: { xs: 2.5, sm: 4 },
        }}
      >
        <Container maxWidth="xl">
          {/* Header Title & Summary Chips */}
          <Box sx={{ mb: 3 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "flex-end" }}
              spacing={2}
            >
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: "primary.main",
                    fontWeight: 800,
                    letterSpacing: "0.14em",
                  }}
                >
                  {t(
                    "data_quality.page.category",
                    "OPEN FOOD FACTS INFRASTRUCTURE & QUALITY",
                  )}
                </Typography>
                <Typography
                  component="h1"
                  variant="h3"
                  sx={{ fontWeight: 800, lineHeight: 1.15, mb: 1 }}
                >
                  {t("data_quality.page.title", "Data Quality Dashboard")}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ maxWidth: 760 }}
                >
                  {t(
                    "data_quality.page.description",
                    "Fix data quality errors on popular products, track progress toward the 0.9% error goal, and see daily community achievements!",
                  )}
                </Typography>
              </Box>

              {/* Status Indicator Badges */}
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ flexWrap: "wrap", gap: 1 }}
              >
                <Chip
                  color="error"
                  variant="outlined"
                  label={t("data_quality.page.current_errors", {
                    pct: INITIAL_METRICS.percentOfProductsWithAnIssue,
                    defaultValue: `${INITIAL_METRICS.percentOfProductsWithAnIssue}% errors`,
                  })}
                  sx={{ fontWeight: 800 }}
                />
                <Chip
                  color="success"
                  variant="outlined"
                  label={t("data_quality.page.target_goal", {
                    goal: INITIAL_METRICS.goalInPercent,
                    defaultValue: `Goal: < ${INITIAL_METRICS.goalInPercent}%`,
                  })}
                  sx={{ fontWeight: 800 }}
                />
                {userStats.fixedCount > 0 && (
                  <Chip
                    icon={<CheckCircleRoundedIcon fontSize="small" />}
                    color="primary"
                    label={t("data_quality.page.your_fixes", {
                      count: userStats.fixedCount,
                      defaultValue: `${userStats.fixedCount} fixed by you`,
                    })}
                    sx={{ fontWeight: 800 }}
                  />
                )}
                {userStats.streak > 0 && (
                  <Chip
                    icon={
                      <LocalFireDepartmentRoundedIcon
                        sx={{ fontSize: "16px !important", color: "#e65100" }}
                      />
                    }
                    label={`${userStats.streak}d streak`}
                    sx={{
                      fontWeight: 800,
                      backgroundColor: "#FFF3E0",
                      color: "#E65100",
                    }}
                  />
                )}
              </Stack>
            </Stack>
          </Box>

          {/* Navigation Tabs */}
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 3,
              mb: 3,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                px: 2,
                "& .MuiTab-root": {
                  minHeight: 52,
                  fontWeight: 700,
                  fontSize: "0.92rem",
                  textTransform: "none",
                  gap: 1,
                },
              }}
            >
              <Tab
                icon={<AutoFixHighRoundedIcon fontSize="small" />}
                iconPosition="start"
                label={t(
                  "data_quality.tabs.mission",
                  "Daily Fix Mission (3 Products)",
                )}
              />
              <Tab
                icon={<AnalyticsRoundedIcon fontSize="small" />}
                iconPosition="start"
                label={t("data_quality.tabs.metrics", "Daily Stats & Goals")}
              />
              <Tab
                icon={<EmojiEventsRoundedIcon fontSize="small" />}
                iconPosition="start"
                label={t(
                  "data_quality.tabs.leaderboard",
                  "5-Day Contributors Board",
                )}
              />
              <Tab
                icon={<HelpOutlineRoundedIcon fontSize="small" />}
                iconPosition="start"
                label={t("data_quality.tabs.resources", "How It Works & Wiki")}
              />
            </Tabs>
          </Paper>

          {/* Tab Panels */}
          {currentTab === 0 && (
            <DailyMissionCard
              products={visibleProducts}
              onFixedProduct={handleProductFixed}
              onLoadMoreProducts={handleLoadMore}
              onShuffleProducts={handleShuffle}
              userFixCount={userStats.fixedCount}
            />
          )}

          {currentTab === 1 && <MetricsOverview metrics={INITIAL_METRICS} />}

          {currentTab === 2 && (
            <LeaderboardCard contributors={INITIAL_LEADERBOARD} />
          )}

          {currentTab === 3 && <HelpAndResources />}
        </Container>
      </Box>
    </React.Suspense>
  );
}
