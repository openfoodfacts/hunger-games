import * as React from "react";
import {
  TourProvider,
  useTour,
  type ProviderProps,
  type StepType,
} from "@reactour/tour";
import type { TFunction } from "i18next";
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

type GetStepsProps = { t: TFunction; withSelector: boolean };

const getSteps = ({ t, withSelector }: GetStepsProps): StepType[] => {
  const steps: Array<readonly [string, string | undefined]> = [
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

type WelcomeProps = {
  isOpen: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};

type WelcomeTourControllerProps = WelcomeProps & { steps: StepType[] };

const WelcomeTourController = ({
  isOpen,
  setIsOpen,
  steps,
}: WelcomeTourControllerProps) => {
  const {
    isOpen: tourIsOpen,
    setIsOpen: setTourIsOpen,
    setCurrentStep,
    setSteps,
  } = useTour();

  React.useEffect(() => {
    setSteps?.(steps);
  }, [steps, setSteps]);

  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setTourIsOpen(true);
    }
  }, [isOpen, setCurrentStep, setTourIsOpen]);

  React.useEffect(() => {
    if (tourIsOpen) {
      setIsOpen?.(true);
    }
  }, [tourIsOpen, setIsOpen]);

  return null;
};

const Welcome = ({ isOpen, setIsOpen }: WelcomeProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const steps = React.useMemo(
    () => getSteps({ t, withSelector: isDesktop }),
    [t, isDesktop],
  );
  const styles = React.useMemo<NonNullable<ProviderProps["styles"]>>(
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
  const handleClose = React.useCallback<
    NonNullable<ProviderProps["onClickClose"]>
  >(
    ({ setIsOpen: setTourIsOpen }) => {
      setTourIsOpen(false);
      setIsOpen?.(false);
      localSettings.update(localSettingsKeys.showTour, false);
    },
    [setIsOpen],
  );
  const handleKeyDown = React.useCallback<
    NonNullable<ProviderProps["keyboardHandler"]>
  >(
    (event, clickProps, status) => {
      if (event.keyCode === 27 && !status?.isEscDisabled) {
        event.preventDefault();
        if (clickProps) {
          handleClose(clickProps);
        }
        return;
      }

      if (event.keyCode === 39 && !status?.isRightDisabled) {
        event.preventDefault();
        clickProps?.setCurrentStep((step) =>
          Math.min(step + 1, (clickProps.steps?.length ?? 1) - 1),
        );
      }
      if (event.keyCode === 37 && !status?.isLeftDisabled) {
        event.preventDefault();
        clickProps?.setCurrentStep((step) => Math.max(step - 1, 0));
      }
    },
    [handleClose],
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
      keyboardHandler={handleKeyDown}
    >
      <WelcomeTourController
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        steps={steps}
      />
    </TourProvider>
  );
};

export default Welcome;
