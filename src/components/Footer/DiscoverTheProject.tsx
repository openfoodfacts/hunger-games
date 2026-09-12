import { Box, Chip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const discover = [
  {
    text: "settings.Who_we_are",
    url: "https://world.openfoodfacts.org/who-we-are",
  },
  {
    text: "settings.Vision_Mission_Values_and_Programs",
    url: "https://world.openfoodfacts.org/open-food-facts-vision-mission-values-and-programs",
  },
  {
    text: "settings.FAQS",
    url: "https://world.openfoodfacts.org/faq",
  },
  {
    text: "settings.open_Food_Facts_blog",
    url: "https://blog.openfoodfacts.org/en/",
  },
  {
    text: "settings.Press",
    url: "https://world.openfoodfacts.org/press",
  },
  {
    text: "settings.Open_Food_Facts_wiki",
    url: "https://wiki.openfoodfacts.org/",
  },
  {
    text: "settings.Translators",
    url: "https://world.openfoodfacts.org/cgi/top_translators.pl",
  },
  {
    text: "settings.Partners",
    url: "https://world.openfoodfacts.org/partners",
  },
  {
    text: "settings.Open_Beauty_Facts",
    url: "https://world-fr.openbeautyfacts.org/",
  },
];

export default function DiscoverTheProject() {
  const { t } = useTranslation();
  return (
    <Box component="section" sx={{ height: "100%" }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        {t("settings.discover_the_project")}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        {discover.map((content) => {
          return (
            <Chip
              key={content.text}
              label={t(content.text)}
              component="a"
              href={content.url}
              target="_blank"
              rel="noreferrer"
              clickable
              variant="outlined"
              sx={{
                maxWidth: "100%",
                height: "auto",
                borderRadius: 2,
                py: 0.75,
                "& .MuiChip-label": {
                  display: "block",
                  whiteSpace: "normal",
                  py: 0.25,
                },
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
