import { Button, Chip, Divider, Typography } from "@mui/material";
import { Box } from "@mui/system";

const discover = [
  {
    text: "Who we are",
    url: "https://world.openfoodfacts.org/who-we-are",
  },
  {
    text: "Vision, Mission, Values and Programs",
    url: "https://world.openfoodfacts.org/open-food-facts-vision-mission-values-and-programs",
  },
  {
    text: "FAQs",
    url: "https://world.openfoodfacts.org/faq",
  },
  {
    text: "Open Food Facts blog",
    url: "https://blog.openfoodfacts.org/en/",
  },
  {
    text: "Press",
    url: "https://world.openfoodfacts.org/press",
  },
  {
    text: "Open Food Facts wiki (en)",
    url: "https://wiki.openfoodfacts.org/",
  },
  {
    text: "Translators",
    url: "https://world.openfoodfacts.org/cgi/top_translators.pl",
  },
  {
    text: "Partners",
    url: "https://world.openfoodfacts.org/partners",
  },
  {
    text: "Open Beauty Facts-Cosmétiques",
    url: "https://world-fr.openbeautyfacts.org/",
  },
];

const DiscoverTheProject = () => {
  return (
    <Box sx={{ width: { xs: "100%", sm: "50%" } }}>
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
              <Typography noWrap>{content.text}</Typography>
            </Button>
          );
        })}
      </Box>
    </Box>
  );
};

export default DiscoverTheProject;
