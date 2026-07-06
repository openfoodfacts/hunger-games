import { Box, Button, IconButton, Typography } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import {
  TikTokIcon,
  MastodonIcon,
  ThreadsIcon,
  BlueskyIcon,
} from "./SocialIcons";

import { useTranslation } from "react-i18next";

const socialMedia = [
  { icon: <EmailIcon />, link: "mailto:contact@openfoodfacts.org" },
  { icon: <TwitterIcon />, link: "https://x.com/OpenFoodFacts" },
  { icon: <InstagramIcon />, link: "https://instagram.com/openfoodfacts" },
  { icon: <FacebookIcon />, link: "https://facebook.com/openfoodfacts" },
  { icon: <YouTubeIcon />, link: "https://www.youtube.com/user/openfoodfacts" },
  { icon: <TikTokIcon />, link: "https://www.tiktok.com/@openfoodfacts" },
  { icon: <ThreadsIcon />, link: "https://www.threads.net/@open.food.facts" },
  { icon: <MastodonIcon />, link: "https://mastodon.social/@openfoodfacts" },
  {
    icon: <BlueskyIcon />,
    link: "https://bsky.app/profile/openfoodfacts.bsky.social",
  },
];

export default function OpenFoodFacts() {
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
            <IconButton key={media.link} href={media.link} target="_blank">
              {media.icon}
            </IconButton>
          );
        })}
      </Box>
    </Box>
  );
}
