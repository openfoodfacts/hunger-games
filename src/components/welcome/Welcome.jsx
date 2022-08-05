import { Button, Box, Typography } from "@mui/material";
import React, { useState } from "react";
import Tour from "reactour";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import {
  localSettings,
  localSettingsKeys,
  getTour,
} from "../../localeStorageManager";

const steps = [
  {
    style: {
      minWidth: "750px",
    },
    content: () => (
      <Box
        sx={{
          minWidth: "500px",
        }}
      >
        <div style={{ display: "flex" }}>
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
        </div>
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
    style: {
      minWidth: "750px",
    },
    selector: ".questions",
    content: () => (
      <Box
        sx={{
          minWidth: "500px",
        }}
      >
        <div style={{ display: "flex" }}>
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
        </div>
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
];

const Welcome = () => {
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
