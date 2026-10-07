import * as React from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import GlobalStyles from "@mui/material/GlobalStyles";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
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

const getSteps = ({ t, withSelector, theme }) => {
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
    style: {
      ...modalStyles,
      backgroundColor: theme.palette.background.paper,
    },
    ...(target && withSelector
      ? { selector: `[data-welcome-tour="${target}"]` }
      : {}),
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

const Welcome = ({ setIsOpen }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [isTourOpen, setIsTourOpen] = React.useState(getTour);

  const handleCloseTour = () => {
    setIsOpen?.(false);
    setIsTourOpen(false);
    localSettings.update(localSettingsKeys.showTour, false);
  };

  React.useEffect(() => {
    if (isTourOpen) {
      queueMicrotask(() => setIsOpen?.(true));
    }
  }, [isTourOpen, setIsOpen]);

  const steps = React.useMemo(
    () => getSteps({ t, withSelector: isDesktop, theme }),
    [t, isDesktop, theme],
  );

  return (
    <>
      {theme.palette.mode === "dark" && (
        <GlobalStyles
          styles={{
            "#___reactour .reactour__close": {
              color: theme.palette.text.secondary,
              "&:hover": { color: theme.palette.text.primary },
            },
            "#___reactour [data-tour-elem='left-arrow']": {
              color: theme.palette.text.secondary,
              "&:hover": { color: theme.palette.text.primary },
            },
            "#___reactour [data-tour-elem='right-arrow']": {
              color: theme.palette.text.secondary,
              "&:hover": { color: theme.palette.text.primary },
            },
            "#___reactour [data-tour-elem='dot']": {
              color: theme.palette.text.secondary,
              borderColor: theme.palette.text.secondary,
            },
          }}
        />
      )}
      <Tour
        steps={steps}
        startAt={0}
        isOpen={isTourOpen}
        showButtons={true}
        accentColor={theme.palette.primary.main}
        onRequestClose={handleCloseTour}
      />
    </>
  );
};

export default Welcome;
