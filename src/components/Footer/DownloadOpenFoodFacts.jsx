import AppleIcon from "@mui/icons-material/Apple";
import GoogleIcon from "@mui/icons-material/Google";
import WindowIcon from "@mui/icons-material/Window";
import AndroidIcon from "@mui/icons-material/Android";
import FooterButtons from "./FooterButtons";
import { Box } from "@mui/material";

const footerLinks = [
  {
    title: "App Store",
    subTitle: "Download on the",
    icon: <AppleIcon fontSize="large" />,
    url: "https://apps.apple.com/app/open-food-facts/id588797948",
  },
  {
    title: "Play Store",
    subTitle: "Get it on",
    icon: <GoogleIcon fontSize="large" />,
    url: "https://play.google.com/store/apps/details?id=org.openfoodfacts.scanner&hl=en",
  },
  {
    title: "Microsoft",
    subTitle: "Get it from",
    icon: <WindowIcon fontSize="large" />,
    url: "https://www.microsoft.com/en-us/p/openfoodfacts/9nblggh0dkqr?activetab=pivot:overviewtab",
  },
  {
    title: "Android APK",
    subTitle: "Download",
    icon: <AndroidIcon fontSize="large" />,
    url: "https://github.com/openfoodfacts/smooth-app/releases/tag/v4.4.0",
  },
];

const DownloadOpenFoodFacts = () => {
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
            title={link.title}
            subTitle={link.subTitle}
            icon={link.icon}
            url={link.url}
          />
        );
      })}
    </Box>
  );
};

export default DownloadOpenFoodFacts;
