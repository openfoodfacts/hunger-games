import * as React from "react";
import { useTranslation } from "react-i18next";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import Tour from "reactour";
import {
  localSettings,
  localSettingsKeys,
  getTour,
} from "../../localeStorageManager";

const styles = {
  minWidth: "min(90%, 800px)",
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
};

const getSteps = ({ t, withSelector }) => [
  {
    style: styles,
    content: () => (
      <Box>
        <Box sx={{ display: "flex" }}>
          <img
            alt="logo"
            style={{
              maxWidth: "50px",
              height: "auto",
              flex: "20%",
            }}
            src={require("../../assets/logo.png")}
          />
          <Typography
            variant="h6"
            component="h2"
            sx={{ flex: "80%", marginTop: "8px" }}
          >
            {t("helper.welcome.page1.title")}
          </Typography>
        </Box>
        <Typography sx={{ mt: 2 }} component="p">
          {t("helper.welcome.page1.text1")}
        </Typography>
        <Typography sx={{ mt: 2 }} component="p">
          {t("helper.welcome.page1.text2")}
        </Typography>
        <Typography sx={{ mt: 2 }} component="p">
          {t("helper.welcome.page1.text3")}
        </Typography>
      </Box>
    ),
  },
  {
    style: styles,
    selector: withSelector ? '[data-welcome-tour="questions"]' : undefined,
    content: () => (
      <Box>
        <Box sx={{ display: "flex" }}>
          <img
            alt="logo"
            style={{
              maxWidth: "50px",
              height: "auto",
              flex: "20%",
            }}
            src={require("../../assets/logo.png")}
          />
          <Typography
            variant="h6"
            component="h2"
            sx={{ flex: "80%", marginTop: "8px" }}
          >
            {t("helper.welcome.page2.title")}
          </Typography>
        </Box>
        <Box
          sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}
        >
          <Box>
            <Typography component="p" sx={{ mt: 2 }}>
              {t("helper.welcome.page2.text1")}
            </Typography>
            <Typography
              component="p"
              sx={{ mt: 2 }}
              dangerouslySetInnerHTML={{
                // https://github.com/i18next/react-i18next/issues/189#issuecomment-235181562
                __html: t("helper.welcome.page2.text2"),
              }}
            />
            <Typography component="p">
              {t("helper.welcome.page2.text3")}
            </Typography>
            <Typography
              component="p"
              sx={{ mt: 2 }}
              dangerouslySetInnerHTML={{
                // https://github.com/i18next/react-i18next/issues/189#issuecomment-235181562
                __html: t("helper.welcome.page2.text4"),
              }}
            />
            <Typography
              component="p"
              sx={{ mt: 2 }}
              dangerouslySetInnerHTML={{
                // https://github.com/i18next/react-i18next/issues/189#issuecomment-235181562
                __html: t("helper.welcome.page2.text5"),
              }}
            />
          </Box>
          <img
            alt={t("helper.welcome.page2.title")}
            style={{
              maxWidth: "50%",
              height: "auto",
              justifyContent: "center",
            }}
            src={require("../../assets/questionsGame.png")}
          />
        </Box>
      </Box>
    ),
  },
  {
    style: styles,
    selector: withSelector ? '[data-welcome-tour="logos"]' : undefined,
    content: () => (
      <Box>
        <Box sx={{ display: "flex" }}>
          <img
            alt="logo"
            style={{
              maxWidth: "50px",
              height: "auto",
              flex: "20%",
            }}
            src={require("../../assets/logo.png")}
          />
          <Typography
            variant="h6"
            component="h2"
            sx={{ flex: "80%", marginTop: "8px" }}
          >
            {t("helper.welcome.page3.title")}
          </Typography>
        </Box>
        <Box
          sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}
        >
          <Box>
            <Typography
              component="p"
              sx={{ mt: 2 }}
              dangerouslySetInnerHTML={{
                // https://github.com/i18next/react-i18next/issues/189#issuecomment-235181562
                __html: t("helper.welcome.page3.text1"),
              }}
            />
            <Typography component="p" sx={{ mt: 2 }}>
              {t("helper.welcome.page3.text2")}
            </Typography>
          </Box>
          <img
            alt={t("helper.welcome.page3.title")}
            style={{
              maxWidth: "50%",
              height: "auto",
              justifyContent: "center",
            }}
            src={require("../../assets/logosGame.png")}
          />
        </Box>
      </Box>
    ),
  },
  {
    style: styles,
    selector: withSelector ? '[data-welcome-tour="eco-score"]' : undefined,
    content: () => (
      <Box>
        <Box sx={{ display: "flex" }}>
          <img
            alt="logo"
            style={{
              maxWidth: "50px",
              height: "auto",
              flex: "20%",
            }}
            src={require("../../assets/logo.png")}
          />
          <Typography
            variant="h6"
            component="h2"
            sx={{ flex: "80%", marginTop: "8px" }}
          >
            {t("helper.welcome.page4.title")}
          </Typography>
        </Box>
        <Box
          sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}
        >
          <Box>
            <Typography component="p" sx={{ mt: 2 }}>
              {t("helper.welcome.page4.text1")}
            </Typography>
            <Typography component="p" sx={{ mt: 2 }}>
              {t("helper.welcome.page4.text2")}
            </Typography>
            <Typography component="p" sx={{ mt: 2 }}>
              <strong>{t("helper.welcome.page4.text3")}</strong>
            </Typography>
            <Typography component="p">
              {t("helper.welcome.page4.text4")}
            </Typography>
          </Box>
          <img
            alt={t("helper.welcome.page4.title")}
            style={{
              maxWidth: "50%",
              height: "auto",
              justifyContent: "center",
            }}
            src={require("../../assets/ecoScoreGame.png")}
          />
        </Box>
      </Box>
    ),
  },
  {
    selector: withSelector ? '[data-welcome-tour="settings"]' : undefined,
    content: () => (
      <Box>
        <Box sx={{ display: "flex" }}>
          <img
            alt="logo"
            style={{
              maxWidth: "50px",
              height: "auto",
              flex: "20%",
            }}
            src={require("../../assets/logo.png")}
          />
          <Typography variant="h6" component="h2" sx={{ marginTop: "8px" }}>
            {t("helper.welcome.page5.title")}
          </Typography>
        </Box>
        <Box>
          <Typography component="p" sx={{ mt: 2 }}>
            {t("helper.welcome.page5.text1")}
          </Typography>
          <Typography component="p" sx={{ mt: 2 }}>
            {t("helper.welcome.page5.text2")}
          </Typography>
        </Box>
      </Box>
    ),
  },
  {
    selector: withSelector ? '[data-welcome-tour="tour"]' : undefined,
    content: () => (
      <Box>
        <Box sx={{ display: "flex" }}>
          <img
            alt="logo"
            style={{
              maxWidth: "50px",
              height: "auto",
              flex: "20%",
            }}
            src={require("../../assets/logo.png")}
          />
          <Typography variant="h6" component="h2" sx={{ marginTop: "8px" }}>
            {t("helper.welcome.page6.title")}
          </Typography>
        </Box>
        <Box>
          <Typography component="p" sx={{ mt: 2 }}>
            {t("helper.welcome.page6.text1")}
          </Typography>
          <Typography component="p" sx={{ mt: 2 }}>
            {t("helper.welcome.page6.text2")}
          </Typography>
        </Box>
      </Box>
    ),
  },
];

const Welcome = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  const [isTourOpen, setIsTourOpen] = React.useState(false);
  const handleShowTour = () => {
    setIsTourOpen(false);
    localSettings.update(localSettingsKeys.showTour, false);
  };

  React.useEffect(() => {
    if (getTour()) setIsTourOpen(true);
  }, []);

  const steps = React.useMemo(
    () => getSteps({ t, withSelector: isDesktop }),
    [t, isDesktop]
  );
  return (
    <>
      <Tour
        steps={steps}
        startAt={0}
        isOpen={isTourOpen}
        showButtons={true}
        accentColor={theme.palette.primary.main}
        onRequestClose={() => {
          handleShowTour();
        }}
      />
      <IconButton
        color="inherit"
        onClick={() => {
          setIsTourOpen(true);
        }}
        data-welcome-tour="tour"
      >
        <QuestionMarkIcon />
      </IconButton>
    </>
  );
};

export default Welcome;
