import * as React from "react";
import { Trans, useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useControlled from "@mui/utils/useControlled";
import useMediaQuery from "@mui/material/useMediaQuery";
import logo from "../../assets/logo.png";
import logosGame from "../../assets/logosGame.png";
import questionsGame from "../../assets/questionsGame.png";
import ecoScoreGame from "../../assets/ecoScoreGame.png";

import Tour from "reactour";
import {
  localSettings,
  localSettingsKeys,
  getTour,
} from "../../localeStorageManager";

const modalStyles = {
  minWidth: "min(90%, 800px)",
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
};

export const getSteps = ({ t, withSelector, theme }) => [
  {
    style: {
      ...modalStyles,
      backgroundColor: theme?.palette?.background?.paper,
    },
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
            src={logo}
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
    style: {
      ...modalStyles,
      backgroundColor: theme?.palette?.background?.paper,
    },
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
            src={logo}
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
            <Typography component="p" sx={{ mt: 2 }}>
              <Trans
                i18nKey="helper.welcome.page2.text2"
                components={{ strong: <strong /> }}
              />
            </Typography>
            <Typography component="p">
              {t("helper.welcome.page2.text3")}
            </Typography>
            <Typography component="p" sx={{ mt: 2 }}>
              <Trans
                i18nKey="helper.welcome.page2.text4"
                components={{ strong: <strong /> }}
              />
            </Typography>
            <Typography component="p" sx={{ mt: 2 }}>
              <Trans
                i18nKey="helper.welcome.page2.text5"
                components={{ strong: <strong /> }}
              />
            </Typography>
          </Box>
          <img
            alt={t("helper.welcome.page2.title")}
            style={{
              maxWidth: "50%",
              height: "auto",
              justifyContent: "center",
            }}
            src={questionsGame}
          />
        </Box>
      </Box>
    ),
  },
  {
    style: {
      ...modalStyles,
      backgroundColor: theme?.palette?.background?.paper,
    },
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
            src={logo}
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
            <Typography component="p" sx={{ mt: 2 }}>
              <Trans
                i18nKey="helper.welcome.page3.text1"
                components={{ strong: <strong /> }}
              />
            </Typography>
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
            src={logosGame}
          />
        </Box>
      </Box>
    ),
  },
  {
    style: {
      ...modalStyles,
      backgroundColor: theme?.palette?.background?.paper,
    },
    selector: withSelector ? '[data-welcome-tour="green-score"]' : undefined,
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
            src={logo}
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
              <Trans
                i18nKey="helper.welcome.page4.text3"
                components={{ strong: <strong /> }}
              />
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
            src={ecoScoreGame}
          />
        </Box>
      </Box>
    ),
  },
  {
    style: { backgroundColor: theme?.palette?.background?.paper },
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
            src={logo}
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
    style: { backgroundColor: theme?.palette?.background?.paper },
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
            src={logo}
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

const Welcome = (props) => {
  const { isOpen, setIsOpen } = props;

  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [isTourOpen, setIsTourOpen] = useControlled({
    controlled: isOpen,
    default: false,
    name: "Welcome",
    state: "isOpen",
  });

  const handleCloseTour = () => {
    setIsOpen?.(false);
    setIsTourOpen(false);
    localSettings.update(localSettingsKeys.showTour, false);
  };

  React.useEffect(() => {
    if (getTour()) {
      setIsOpen?.(true);
      setIsTourOpen(true);
    }
  });

  const steps = React.useMemo(
    () => getSteps({ t, withSelector: isDesktop, theme }),
    [t, isDesktop, theme],
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
          handleCloseTour();
        }}
      />
    </>
  );
};

export default Welcome;
