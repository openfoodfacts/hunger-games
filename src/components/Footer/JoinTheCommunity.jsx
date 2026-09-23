import { Box, Link, Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTranslation } from "react-i18next";

const content = [
  {
    tag: "settings.join_the_community.discover_our",
    urlText: "settings.join_the_community.code_of_conduct",
    url: "https://world.openfoodfacts.org/code-of-conduct",
  },
  {
    tag: "settings.join_the_community.join_us_on",
    urlText: "slack",
    url: "https://slack.openfoodfacts.org/",
  },
  {
    tag: "",
    urlText: "settings.join_the_community.forum",
    url: "https://forum.openfoodfacts.org/",
  },
  {
    tag: "settings.join_the_community.subscribe_to_our",
    urlText: "settings.join_the_community.newsletter",
    url: "https://link.openfoodfacts.org/newsletter-en",
  },
];

export default function JoinTheCommunity() {
  const { t } = useTranslation();

  return (
    <Box component="section" sx={{ height: "100%" }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        {t("settings.join_community")}
      </Typography>
      <Stack
        component="ul"
        spacing={1.5}
        sx={{ m: 0, p: 0, listStyle: "none" }}
      >
        {content.map((step, index) => (
          <Box
            component="li"
            key={`${step.url}-${index}`}
            sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
          >
            <CheckCircleIcon
              sx={{ mt: 0.25, color: "primary.main", fontSize: 20 }}
              aria-hidden
            />
            <Typography component="span" variant="body2">
              {step.tag ? `${t(step.tag)} ` : ""}
              <Link href={step.url} target="_blank" rel="noreferrer">
                {t(step.urlText)}
              </Link>
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
