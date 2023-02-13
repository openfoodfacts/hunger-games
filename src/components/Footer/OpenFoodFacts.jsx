import { Box, Button, IconButton, Typography } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import { useTranslation } from "react-i18next";

const socialMedia = [
  {
    icon: <EmailIcon />,
    link: "mailto:contact@openfoodfacts.org",
  },
  {
    icon: <TwitterIcon />,
    link: "https://twitter.com/openfoodfacts",
  },
  {
    icon: <InstagramIcon />,
    link: "https://www.instagram.com/open.food.facts/",
  },
  {
    icon: <FacebookIcon />,
    link: "https://www.facebook.com/OpenFoodFacts",
  },
];

const OpenFoodFacts = () => {
  const { t } = useTranslation();
  return (
    <Box
      sx={(theme) => ({
        backgroundColor: theme.palette.cafeCreme.main,
        color: theme.palette.cafeCreme.contrastText,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pb: "20px",
      })}
      className="OFF-social-media"
    >
      <Button
        sx={{ cursor: "pointer" }}
        href="https://world.openfoodfacts.org/"
        target="_blank"
      >
        <img
          width={"100px"}
          height={"100px"}
          src="/logo192.png"
          alt="openFoodFacts"
        />
      </Button>
      <Typography textAlign={"center"} variant="caption">
        {t("settings.text2")}
      </Typography>
      <Box>
        {socialMedia.map((media) => {
          return (
            <IconButton href={media.link} target="_blank">
              {media.icon}
            </IconButton>
          );
        })}
      </Box>
    </Box>
  );
};

export default OpenFoodFacts;
