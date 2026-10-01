import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";
import { alpha, useTheme } from "@mui/material/styles";

import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";

import { DataQualityMetrics } from "./types";
import { TAGLINE_ANNOUNCEMENT } from "./dataQualityService";

interface MetricsOverviewProps {
  metrics: DataQualityMetrics;
}

export default function MetricsOverview({ metrics }: MetricsOverviewProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  // Progress towards 0.9% goal
  // Current: ~4.8% -> Goal: 0.9%. Range from 10% to 0.9%
  const currentErrorPct = metrics.percentOfProductsWithAnIssue;
  const goalErrorPct = metrics.goalInPercent;
  const goalProgress = Math.min(
    100,
    Math.max(
      0,
      Math.round(((10.0 - currentErrorPct) / (10.0 - goalErrorPct)) * 100),
    ),
  );

  return (
    <Box sx={{ mb: 4 }}>
      {/* Announcement / Challenge Tagline */}
      <Alert
        severity="info"
        icon={<CampaignRoundedIcon />}
        sx={{
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
          "& .MuiAlert-message": { width: "100%" },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={1.5}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {TAGLINE_ANNOUNCEMENT.challengeTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {TAGLINE_ANNOUNCEMENT.challengeMessage}
            </Typography>
          </Box>
          <Chip
            size="small"
            color="primary"
            icon={<CalendarMonthRoundedIcon />}
            label={t(
              "data_quality.metrics.monthly_event",
              "Monthly Meetup on Slack",
            )}
            sx={{ fontWeight: 700, flexShrink: 0 }}
          />
        </Stack>
      </Alert>

      {/* Main KPI Cards Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {/* KPI 1: Products with Errors */}
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: "uppercase",
                color: "text.secondary",
              }}
            >
              {t("data_quality.metrics.error_rate_label", "Error Rate")}
            </Typography>
            <Chip
              size="small"
              color="error"
              label={`${metrics.percentOfProductsWithAnIssue}%`}
              sx={{ fontWeight: 800, height: 20, fontSize: "0.72rem" }}
            />
          </Stack>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "error.main", mb: 0.5 }}
          >
            {metrics.nbOfProductsWithAnIssue.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("data_quality.metrics.of_total_products", {
              total: metrics.totalNbOfProducts.toLocaleString(),
              defaultValue: `out of ${metrics.totalNbOfProducts.toLocaleString()} products`,
            })}
          </Typography>
        </Paper>

        {/* KPI 2: Target Goal */}
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: "uppercase",
                color: "text.secondary",
              }}
            >
              {t("data_quality.metrics.goal_label", "Target Threshold")}
            </Typography>
            <TrackChangesRoundedIcon
              sx={{ color: "primary.main", fontSize: 20 }}
            />
          </Stack>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "primary.main", mb: 0.5 }}
          >
            &lt; {metrics.goalInPercent}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("data_quality.metrics.days_remaining", {
              days: metrics.estimatedDaysToGoal,
              defaultValue: `~${metrics.estimatedDaysToGoal} days to reach threshold`,
            })}
          </Typography>
        </Paper>

        {/* KPI 3: Daily Net Velocity */}
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: "uppercase",
                color: "text.secondary",
              }}
            >
              {t("data_quality.metrics.velocity_label", "Net Fixed / Day")}
            </Typography>
            <Chip
              size="small"
              color="success"
              icon={
                <TrendingUpRoundedIcon sx={{ fontSize: "14px !important" }} />
              }
              label={`+${metrics.averageNetProductsFixedPerDay}`}
              sx={{ fontWeight: 800, height: 20, fontSize: "0.72rem" }}
            />
          </Stack>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "success.main", mb: 0.5 }}
          >
            {metrics.nbOfProductsFixedYesterday}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("data_quality.metrics.fixed_yesterday", {
              fixed: metrics.nbOfProductsFixedYesterday,
              newErrors: metrics.nbOfNewProductsWithIssues,
              defaultValue: `Fixed yesterday (${metrics.nbOfNewProductsWithIssues} new errors)`,
            })}
          </Typography>
        </Paper>

        {/* KPI 4: Consumer Scans Impact */}
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: "uppercase",
                color: "text.secondary",
              }}
            >
              {t(
                "data_quality.metrics.scans_impact_label",
                "Scans with Errors",
              )}
            </Typography>
            <BoltRoundedIcon sx={{ color: "#E65100", fontSize: 20 }} />
          </Stack>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "#E65100", mb: 0.5 }}
          >
            {metrics.issuesInScansPercent}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("data_quality.metrics.scans_count", {
              scans: (metrics.uniqScansIssues / 1000000).toFixed(1),
              defaultValue: `${(metrics.uniqScansIssues / 1000000).toFixed(1)}M scans affected`,
            })}
          </Typography>
        </Paper>
      </Box>

      {/* Goal Progress Bar & Detailed Statistics Card */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {/* Goal Progress Section */}
        <Box sx={{ mb: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {t(
                "data_quality.metrics.progress_title",
                "Progress towards Quality Goal (< 0.9%)",
              )}
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 800, color: "primary.main" }}
            >
              {metrics.percentOfProductsWithAnIssue}% → {metrics.goalInPercent}%
            </Typography>
          </Stack>

          <Box sx={{ position: "relative", my: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={goalProgress}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 6,
                  background: `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${theme.palette.success.main} 100%)`,
                },
              }}
            />
          </Box>

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              {t(
                "data_quality.metrics.current_rate",
                `Current: ${metrics.percentOfProductsWithAnIssue}%`,
              )}
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: "success.main" }}
            >
              {t(
                "data_quality.metrics.target_rate",
                `Goal: < 0.9% (${goalProgress}% accomplished)`,
              )}
            </Typography>
          </Stack>
        </Box>

        {/* 7-Day Sparkline Trend of Incoming Products */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2.5,
            backgroundColor:
              theme.palette.mode === "dark" ? "#1e1e1e" : "#f8f9fa",
            border: `1px solid ${theme.palette.divider}`,
            mb: 3,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {t(
                "data_quality.metrics.incoming_products_7d",
                "Products Created in Last 7 Days",
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t(
                "data_quality.metrics.seven_day_sparkline",
                "Mirabelle 7-day sparkline",
              )}
            </Typography>
          </Stack>

          {/* SVG Sparkline Bar Chart */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              height: 70,
              gap: 1.5,
              pt: 1,
            }}
          >
            {metrics.newProductsLast7Days.map((item, index) => {
              const maxVal = Math.max(
                ...metrics.newProductsLast7Days.map((d) => d.count),
              );
              const heightPct = Math.round((item.count / maxVal) * 100);

              return (
                <Tooltip
                  key={item.day}
                  title={`${item.day}: ${item.count.toLocaleString()} products created`}
                >
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "100%",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        height: `${heightPct}%`,
                        backgroundColor:
                          index === metrics.newProductsLast7Days.length - 1
                            ? theme.palette.primary.main
                            : alpha(theme.palette.primary.main, 0.45),
                        borderRadius: "4px 4px 0 0",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: theme.palette.primary.light,
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        color: "text.secondary",
                        mt: 0.5,
                      }}
                    >
                      {item.day}
                    </Typography>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </Box>

        {/* Detailed 14-Day Rolling Statistics */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
          {t(
            "data_quality.metrics.rolling_averages_title",
            "14-Day Rolling Performance & Daily Stats",
          )}
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 2,
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {t(
                "data_quality.metrics.avg_fixed_per_day",
                "Avg. Products Fixed / Day (14d)",
              )}
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: "success.main" }}
            >
              {metrics.averageNbOfProductsFixedPerDay}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {t(
                "data_quality.metrics.avg_new_errors_per_day",
                "Avg. New Errors / Day (14d)",
              )}
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: "warning.main" }}
            >
              {metrics.averageNbOfNewProductsInErrorPerDay}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {t(
                "data_quality.metrics.net_fixed_per_day",
                "Net Progress Velocity / Day",
              )}
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: "primary.main" }}
            >
              +{metrics.averageNetProductsFixedPerDay}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {t(
                "data_quality.metrics.modified_yesterday",
                "Products Modified Yesterday",
              )}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {metrics.totalNBOfModifiedProducts.toLocaleString()}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {t(
                "data_quality.metrics.created_yesterday",
                "New Products Created Yesterday",
              )}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {metrics.totalNBOfNewProducts.toLocaleString()}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {t(
                "data_quality.metrics.active_contributors",
                "Active Daily Fixers",
              )}
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: "secondary.main" }}
            >
              {metrics.activeContributorsCount} contributors
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
