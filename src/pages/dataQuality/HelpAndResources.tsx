import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { alpha, useTheme } from "@mui/material/styles";

import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";

import {
  WIKI_UNFIXABLE_URL,
  FORUM_DATABASE_URL,
  SLACK_URL,
  MIRABELLE_DASHBOARD_URL,
  MIRABELLE_ERRORS_FROM_URL,
  MIRABELLE_SUBSCRIBE_URL,
} from "./dataQualityService";

export default function HelpAndResources() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
          },
          gap: 3,
        }}
      >
        {/* "How Does It Work?" Educational Box */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 3,
            backgroundColor:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.warning.dark, 0.12)
                : "#FFFDF0",
            borderColor:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.warning.main, 0.3)
                : "#FDE68A",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <HelpOutlineRoundedIcon sx={{ color: "#D97706" }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {t(
                "data_quality.resources.how_it_works_title",
                "How does it work?",
              )}
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t(
              "data_quality.resources.how_it_works_desc",
              "Open Food Facts continuously monitors millions of barcodes for nutritional inconsistencies, missing serving sizes, and invalid syntax.",
            )}
          </Typography>

          <List disablePadding>
            <ListItem
              disableGutters
              sx={{ alignItems: "flex-start", py: 0.75 }}
            >
              <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                <CheckCircleOutlineRoundedIcon
                  fontSize="small"
                  sx={{ color: "success.main" }}
                />
              </ListItemIcon>
              <ListItemText
                primary={t(
                  "data_quality.resources.rule_1_title",
                  "You are empowered to resolve high-priority items",
                )}
                secondary={t(
                  "data_quality.resources.rule_1_desc",
                  "Instead of sorting through millions of errors, each session presents actionable products.",
                )}
                primaryTypographyProps={{ fontWeight: 700, fontSize: "0.9rem" }}
                secondaryTypographyProps={{ fontSize: "0.8rem" }}
              />
            </ListItem>

            <ListItem
              disableGutters
              sx={{ alignItems: "flex-start", py: 0.75 }}
            >
              <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                <CheckCircleOutlineRoundedIcon
                  fontSize="small"
                  sx={{ color: "success.main" }}
                />
              </ListItemIcon>
              <ListItemText
                primary={t(
                  "data_quality.resources.rule_2_title",
                  "Solvable products with verified photos",
                )}
                secondary={t(
                  "data_quality.resources.rule_2_desc",
                  "All selected items have photos of the nutrition table and ingredient list, so you can check and fix without guessing.",
                )}
                primaryTypographyProps={{ fontWeight: 700, fontSize: "0.9rem" }}
                secondaryTypographyProps={{ fontSize: "0.8rem" }}
              />
            </ListItem>

            <ListItem
              disableGutters
              sx={{ alignItems: "flex-start", py: 0.75 }}
            >
              <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                <CheckCircleOutlineRoundedIcon
                  fontSize="small"
                  sx={{ color: "success.main" }}
                />
              </ListItemIcon>
              <ListItemText
                primary={t(
                  "data_quality.resources.rule_3_title",
                  "Maximum impact prioritized by scans",
                )}
                secondary={t(
                  "data_quality.resources.rule_3_desc",
                  "Products are prioritized by consumer scans so every single correction benefits thousands of consumers immediately.",
                )}
                primaryTypographyProps={{ fontWeight: 700, fontSize: "0.9rem" }}
                secondaryTypographyProps={{ fontSize: "0.8rem" }}
              />
            </ListItem>
          </List>
        </Paper>

        {/* Community & Documentation Resources */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
            {t(
              "data_quality.resources.community_title",
              "Community & Assistance",
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t(
              "data_quality.resources.community_desc",
              "Hard to fix a specific product? Found an error that is actually true to packaging? The Open Food Facts community is here to assist!",
            )}
          </Typography>

          <Stack spacing={1.5}>
            <Button
              variant="outlined"
              color="primary"
              component="a"
              href={WIKI_UNFIXABLE_URL}
              target="_blank"
              rel="noreferrer"
              startIcon={<MenuBookRoundedIcon />}
              endIcon={<OpenInNewRoundedIcon fontSize="small" />}
              sx={{
                justifyContent: "space-between",
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
              }}
            >
              {t(
                "data_quality.resources.wiki_link",
                "Wiki: Issues which cannot be fixed",
              )}
            </Button>

            <Button
              variant="outlined"
              color="inherit"
              component="a"
              href={FORUM_DATABASE_URL}
              target="_blank"
              rel="noreferrer"
              startIcon={<ForumRoundedIcon />}
              endIcon={<OpenInNewRoundedIcon fontSize="small" />}
              sx={{
                justifyContent: "space-between",
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
              }}
            >
              {t(
                "data_quality.resources.forum_link",
                "Forum: Database Category",
              )}
            </Button>

            <Button
              variant="outlined"
              color="inherit"
              component="a"
              href={SLACK_URL}
              target="_blank"
              rel="noreferrer"
              startIcon={<ChatBubbleOutlineRoundedIcon />}
              endIcon={<OpenInNewRoundedIcon fontSize="small" />}
              sx={{
                justifyContent: "space-between",
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
              }}
            >
              {t(
                "data_quality.resources.slack_link",
                "Slack: #quality-data channel",
              )}
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              component="a"
              href={MIRABELLE_DASHBOARD_URL}
              target="_blank"
              rel="noreferrer"
              startIcon={<AnalyticsRoundedIcon />}
              endIcon={<OpenInNewRoundedIcon fontSize="small" />}
              sx={{
                justifyContent: "space-between",
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
              }}
            >
              {t(
                "data_quality.resources.mirabelle_link",
                "Mirabelle Data Quality Dashboard",
              )}
            </Button>

            <Button
              variant="outlined"
              color="inherit"
              component="a"
              href={MIRABELLE_ERRORS_FROM_URL}
              target="_blank"
              rel="noreferrer"
              startIcon={<InsightsRoundedIcon />}
              endIcon={<OpenInNewRoundedIcon fontSize="small" />}
              sx={{
                justifyContent: "space-between",
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
              }}
            >
              {t(
                "data_quality.resources.errors_from_link",
                "Where do errors come from? (Mirabelle)",
              )}
            </Button>

            <Button
              variant="text"
              color="primary"
              component="a"
              href={MIRABELLE_SUBSCRIBE_URL}
              target="_blank"
              rel="noreferrer"
              startIcon={<MailOutlineRoundedIcon />}
              endIcon={<OpenInNewRoundedIcon fontSize="small" />}
              sx={{
                justifyContent: "space-between",
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
              }}
            >
              {t(
                "data_quality.resources.daily_email_link",
                "Subscribe to Data Quality Daily Email",
              )}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
