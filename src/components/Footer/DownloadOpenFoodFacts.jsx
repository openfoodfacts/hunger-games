import AppleIcon from "@mui/icons-material/Apple";
import GoogleIcon from "@mui/icons-material/Google";
import WindowIcon from "@mui/icons-material/Window";
import AndroidIcon from "@mui/icons-material/Android";
import FooterButtons from "./FooterButtons";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

const footerLinks = [
  {
    titleKey: "appStore",
    icon: <AppleIcon fontSize="large" />,
    url: "https://apps.apple.com/app/open-food-facts/id588797948",
  },
  {
    titleKey: "playStore",
    icon: <GoogleIcon fontSize="large" />,
    url: "https://play.google.com/store/apps/details?id=org.openfoodfacts.scanner&hl=en",
  },
  {
    titleKey: "microsoft",
    icon: <WindowIcon fontSize="large" />,
    url: "https://apps.microsoft.com/store/detail/open-food-facts-scan-to-get-nutriscore-ecoscore-and-more/XP8LT18SRPKLRG",
  },
  {
    titleKey: "androidAPK",
    icon: <AndroidIcon fontSize="large" />,
    url: "https://github.com/openfoodfacts/smooth-app/releases/tag/v4.4.0",
  },
];

export default function DownloadOpenFoodFacts() {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="OFF-download"
    >
      {footerLinks.map((link) => {
        return (
          <FooterButtons
            key={link.title}
            title={t(`footer.${link.titleKey}.title`)}
            subTitle={t(`footer.${link.titleKey}.subtitle`)}
            icon={link.icon}
            url={link.url}
          />
        );
      })}
    </Box>
  );
}
