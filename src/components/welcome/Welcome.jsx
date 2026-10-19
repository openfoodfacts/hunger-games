import * as React from "react";
import { TourProvider, useTour } from "@reactour/tour";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  localSettings,
  localSettingsKeys,
  getTour,
} from "../../localeStorageManager";

const getSteps = ({ t, withSelector }) => {
  const steps = [
    ["intro", undefined],
    ["games", "games"],
    ["tools", "logo_search"],
    ["manage", "dashboard"],
    ["country", "country"],
    ["settings", "settings"],
    ["help", "tour"],
  ];

  return steps.map(([page, target]) => ({
    selector:
      target && withSelector ? `[data-welcome-tour="${target}"]` : "body",
    position: "center",
    content: () => (
      <Box>
        <Typography variant="h6" component="h2">
          {t(`helper.navigation_tour.${page}.title`)}
        </Typography>
        <Typography component="p" sx={{ mt: 2 }}>
          {t(`helper.navigation_tour.${page}.text1`)}
        </Typography>
        <Typography component="p" sx={{ mt: 2 }}>
          {t(`helper.navigation_tour.${page}.text2`)}
        </Typography>
      </Box>
    ),
  }));
};

const WelcomeTourController = ({ isOpen, setIsOpen }) => {
  const { isOpen: tourIsOpen, setIsOpen: setTourIsOpen } = useTour();

  React.useEffect(() => {
    if (isOpen) {
      setTourIsOpen(true);
    }
  }, [isOpen, setTourIsOpen]);

  React.useEffect(() => {
    if (tourIsOpen) {
      setIsOpen?.(true);
    }
  }, [tourIsOpen, setIsOpen]);

  return null;
};

const Welcome = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const steps = React.useMemo(
    () => getSteps({ t, withSelector: isDesktop }),
    [t, isDesktop],
  );
  const styles = React.useMemo(
    () => ({
      popover: (base) => ({
        ...base,
        minWidth: "min(90vw, 800px)",
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }),
      close: (base) => ({ ...base, color: theme.palette.text.secondary }),
      arrow: (base) => ({ ...base, color: theme.palette.text.secondary }),
      dot: (base) => ({ ...base, color: theme.palette.text.secondary }),
    }),
    [theme],
  );
  const handleClose = React.useCallback(
    ({ setIsOpen: setTourIsOpen }) => {
      setTourIsOpen(false);
      setIsOpen?.(false);
      localSettings.update(localSettingsKeys.showTour, false);
    },
    [setIsOpen],
  );

  return (
    <TourProvider
      steps={steps}
      defaultOpen={getTour()}
      startAt={0}
      position="center"
      styles={styles}
      onClickClose={handleClose}
      onClickMask={handleClose}
    >
      <WelcomeTourController isOpen={isOpen} setIsOpen={setIsOpen} />
    </TourProvider>
  );
};

export default Welcome;
