import { Button, Chip, Divider, Typography } from "@mui/material";
import { Box } from "@mui/system";
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

const DiscoverTheProject = () => {
  const { t } = useTranslation();
  return (
    <Box sx={{ width: { xs: "100%", sm: "50%" } }} className="OFF-discover">
      <Divider light>
        <Chip label="Discover the project" />
      </Divider>
      <br />
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {discover.map((content) => {
          return (
            <Button
              sx={{
                backgroundColor: "#a08d84",
                "&:hover": { backgroundColor: "#887369" },
              }}
              variant="contained"
              href={content.url}
              target="_blank"
            >
              <Typography noWrap>{t(content.text)}</Typography>
            </Button>
          );
        })}
      </Box>
    </Box>
  );
};

export default DiscoverTheProject;
