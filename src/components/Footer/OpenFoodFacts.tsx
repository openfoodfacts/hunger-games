import { Box, Container, IconButton, Stack, Typography } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import { useTranslation } from "react-i18next";
import logo from "../../assets/logo.png";

const socialMedia = [
  {
    icon: <EmailIcon />,
    labelKey: "footer.social.email",
    link: "mailto:contact@openfoodfacts.org",
  },
  {
    icon: <TwitterIcon />,
    labelKey: "footer.social.twitter",
    link: "https://twitter.com/openfoodfacts",
  },
  {
    icon: <InstagramIcon />,
    labelKey: "footer.social.instagram",
    link: "https://www.instagram.com/open.food.facts/",
  },
  {
    icon: <FacebookIcon />,
    labelKey: "footer.social.facebook",
    link: "https://www.facebook.com/OpenFoodFacts",
  },
];

export default function OpenFoodFacts() {
  const { t } = useTranslation();
  return (
    <Box
      sx={(theme) => ({
        backgroundColor: theme.palette.cafeCreme.main,
        color: theme.palette.cafeCreme.contrastText,
        borderTop: `1px solid ${theme.palette.divider}`,
      })}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2.5}
          sx={{ alignItems: { xs: "center", sm: "center" } }}
        >
          <Box
            component="a"
            href="https://world.openfoodfacts.org/"
            target="_blank"
            rel="noreferrer"
            sx={{ display: "flex", flexShrink: 0 }}
          >
            <Box
              component="img"
              src={logo}
              alt="Open Food Facts"
              sx={{ width: 64, height: 64, objectFit: "contain" }}
            />
          </Box>
          <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
            <Typography component="h2" variant="h6" sx={{ fontWeight: 800 }}>
              Open Food Facts
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
              {t("settings.text2")}
            </Typography>
          </Box>
          <Stack direction="row" sx={{ flexShrink: 0 }}>
            {socialMedia.map((media) => {
              return (
                <IconButton
                  key={media.link}
                  href={media.link}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t(media.labelKey)}
                  color="inherit"
                >
                  {media.icon}
                </IconButton>
              );
            })}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
