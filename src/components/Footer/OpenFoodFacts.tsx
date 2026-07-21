import { Box, Button, IconButton, Typography } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { useTranslation } from "react-i18next";
import {
  XIcon,
  TikTokIcon,
  ThreadsIcon,
  MastodonIcon,
  BlueskyIcon,
} from "./SocialIcons";

const socialMedia = [
  {
    label: "Email",
    icon: <EmailIcon />,
    link: "mailto:contact@openfoodfacts.org",
  },
  {
    label: "X",
    icon: <XIcon />,
    link: "https://x.com/OpenFoodFacts",
  },
  {
    label: "Facebook",
    icon: <FacebookIcon />,
    link: "https://www.facebook.com/openfoodfacts",
  },
  {
    label: "Instagram",
    icon: <InstagramIcon />,
    link: "https://www.instagram.com/openfoodfacts/",
  },
  {
    label: "Threads",
    icon: <ThreadsIcon />,
    link: "https://www.threads.net/@open.food.facts",
  },
  {
    label: "Bluesky",
    icon: <BlueskyIcon />,
    link: "https://bsky.app/profile/openfoodfacts.bsky.social",
  },
  {
    label: "Mastodon",
    icon: <MastodonIcon />,
    link: "https://mastodon.social/@openfoodfacts",
  },
  {
    label: "TikTok",
    icon: <TikTokIcon />,
    link: "https://www.tiktok.com/@openfoodfacts",
  },
  {
    label: "YouTube",
    icon: <YouTubeIcon />,
    link: "https://www.youtube.com/user/openfoodfacts",
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
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: 0.5,
          maxWidth: 360,
        }}
      >
        {socialMedia.map((media) => {
          return (
            <IconButton
              key={media.link}
              href={media.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={media.label}
              size="small"
            >
              {media.icon}
            </IconButton>
          );
        })}
      </Box>
    </Box>
  );
}
