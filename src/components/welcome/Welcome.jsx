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
    selector: ".questions",
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
];

const Welcome = () => {
  const theme = useTheme();
  const [showTour, setShowTour] = React.useState(getTour);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const handleShowTour = () => {
    setIsTourOpen(false);
    localSettings.update(localSettingsKeys.showTour, false);
  };

  React.useEffect(() => {
    if (getTour()) setIsTourOpen(true);
  }, [showTour]);
  return (
    <>
      <Tour
        steps={steps}
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
      >
        <QuestionMarkIcon />
      </Button>
    </>
  );
};

export default Welcome;
