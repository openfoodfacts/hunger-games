import { Button, Box, Typography } from "@mui/material";
import React, { useState } from "react";
import Tour from "reactour";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import {
  localSettings,
  localSettingsKeys,
  getTour,
} from "../../localeStorageManager";
import { useTheme } from "@mui/material/styles";

const styles = {
  minWidth: "min(90%, 800px)",
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
};

const steps = [
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
            Welcome to Hunger Games
          </Typography>
        </Box>
        <Typography sx={{ mt: 2 }} component="p">
          Hunger Games is a collection of mini-games that help contribute to
          Open Food Facts in many ways. You can play are really exciting games
          from anywhere. Here is a guided tour of the entire website which will
          get you started.
        </Typography>
        <Typography sx={{ mt: 2 }} component="p">
          Make sure to login to the Open Food Facts website to get credit for
          your contributions. If you make a mistake, please take the time to
          correct it by heading to the website.
        </Typography>
        <Typography sx={{ mt: 2 }} component="p">
          In case of any doubt about the games, click on the question mark icon
          at the top right of the page, and you can reach us on slack at the
          #hunger-games channel
        </Typography>
      </Box>
    ),
  },
  {
    style: styles,
    selector: '[data-welcome-tour="questions"]',
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
            Questions Game
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection:{xs:"column",md:"row"} }}>
          <Box>
            <Typography component="p" sx={{ mt: 2 }}>
              Does the food product belong to this brand?
            </Typography>
            <Typography component="p" sx={{ mt: 2 }}>
              Answer simply with a <strong>yes/no</strong>! Don't know the answer? That's
              alright, just skip it.
            </Typography>
            <Typography component="p">
              You can also use your keyboard keys o,n and k.
            </Typography>
            <Typography component="p" sx={{ mt: 2 }}>
              You can <strong>filter</strong> the products based on country, brands, popularity and much more!
            </Typography>
            <Typography component="p" sx={{ mt: 2 }}>
            If you don't want to do this every single time, you can also <strong>save the filters</strong> by clicking on the star. Next time you come back, find the saved filters on the home page itself
            </Typography>
          </Box>
          <img
            alt="questions game"
            style={{
              maxWidth: "50%",
              height: "auto",
              justifyContent: "center"
            }}
            src={require("../../assets/questionsGame.png")}
          />
        </Box>
      </Box>
    ),
  },
  {
    style: styles,
    selector: '[data-welcome-tour="logos"]',
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
            Logos Game
          </Typography>
        </Box>
        <Box
          sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}
        >
          <Box>
            <Typography component="p" sx={{ mt: 2 }}>
              Our another really loved game is the logos game where you have to
              <strong> select all the logos</strong> you feel are the same.
            </Typography>
            <Typography component="p" sx={{ mt: 2 }}>
              As shown in the example, once you select all the similar logos,
              just type their value and select where it is a brand, a label or
              something else. It's that simple!
            </Typography>
          </Box>
          <img
            alt="logos game"
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
    selector: '[data-welcome-tour="eco-score"]',
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
            Eco-Score Questions Game
          </Typography>
        </Box>
        <Box
          sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}
        >
          <Box>
            <Typography component="p" sx={{ mt: 2 }}>
              Help us finish the remaining questions in the most high priority
              labels!
            </Typography>
            <Typography component="p" sx={{ mt: 2 }}>
              These cards are linked to labels used in the computation of the
              eco-score.
            </Typography>
            <Typography component="p" sx={{ mt: 2 }}>
              <strong>What is Eco-Score?</strong>
            </Typography>
            <Typography component="p">
              Eco-Score captures the total environmental footprint, making it
              easier for consumers to compare products and decide which is better for the environment.
            </Typography>
          </Box>
          <img
            alt="eco score game"
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
    selector: '[data-welcome-tour="settings"]',
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
            sx={{ marginTop: "8px" }}
          >
            Settings
          </Typography>
        </Box>
          <Box>
            <Typography component="p" sx={{ mt: 2 }}>
              Set your preferred language, and report issues from our settings page.
            </Typography>
            <Typography component="p" sx={{ mt: 2 }}>
              If you're a developer, you can also explore our database content using our dev mode.
            </Typography>
          </Box>
      </Box>
    ),
  },
  {
    selector: '[data-welcome-tour="tour"]',
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
            sx={{ marginTop: "8px" }}
          >
            Tour
          </Typography>
        </Box>
          <Box>
            <Typography component="p" sx={{ mt: 2 }}>
              Got stuck somewhere? Want to take the tour again?
            </Typography>
            <Typography component="p" sx={{ mt: 2 }}>
              Just click on the question mark and start the journey again!
            </Typography>
          </Box>
      </Box>
    ),
  },
];

const Welcome = () => {
  const theme = useTheme();
  const [isTourOpen, setIsTourOpen] = useState(false);
  const handleShowTour = () => {
    setIsTourOpen(false);
    localSettings.update(localSettingsKeys.showTour, false);
  };

  React.useEffect(() => {
    if (getTour()) setIsTourOpen(true);
  }, []);
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
      <Button
        color="inherit"
        onClick={() => {
          setIsTourOpen(true);
        }}
        data-welcome-tour="tour"
      >
        <QuestionMarkIcon />
      </Button>
    </>
  );
};

export default Welcome;
