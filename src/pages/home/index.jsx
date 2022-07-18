import * as React from "react";

import { Link } from "react-router-dom";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import HomeCard from "./homeCards";
import QuestionCard from "../../components/QuestionCard";
import { localFavorites } from "../../localeStorageManager";
import Divider from "@mui/material/Divider";
import { Button } from "@mui/material";

const Home = () => {
  const [savedQuestions] = React.useState(() => {
    return localFavorites.fetch().questions ?? [];
  });
  const size = Object.keys(savedQuestions).length;

  return (
    <>
      <Box sx={{ p: 2, alignItems: "center" }}>
        <Typography
          variant="h5"
          sx={{ margin: "20px auto", textAlign: "center" }}
        >
          What game would you like to play?
        </Typography>
        <HomeCard />
        {size > 0 && (
          <Typography
            variant="h5"
            sx={{ margin: "40px auto", textAlign: "center" }}
          >
            Saved Filters
          </Typography>
        )}
        <Stack
          spacing={4}
          flexWrap="wrap"
          direction={{ xs: "column", sm: "column", md: "row" }}
          alignItems="center"
          justifyContent="center"
        >
          {savedQuestions.map((props) => (
            <Box key={props.title}>
              <QuestionCard showFilterResume {...props} />
            </Box>
          ))}
        </Stack>
      </Box>
      <Box
        padding={{ xs: "20px", sm: "50px" }}
        sx={{
          backgroundColor: "#4fc3f7",
        }}
      >
        <Stack
          spacing={4}
          flexWrap="wrap"
          direction={{ xs: "column", sm: "column", md: "row" }}
          alignItems="center"
          justifyContent="center"
        >
          <Typography
            variant="h5"
            sx={{
              textAlign: "center",
              lineHeight: "1.75",
            }}
          >
            Want to make your contribution count? Create an account or sign in
            on Open Food Facts!
          </Typography>
          <Stack direction="row">
            <Button
              variant="contained"
              href="https://world.openfoodfacts.org/cgi/login.pl"
              sx={{
                backgroundColor: "white",
                color: "black",
                margin: "0 20px",
                "&:hover": {
                  backgroundColor: "#F5F5F5",
                },
              }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              href="https://world.openfoodfacts.org/cgi/user.pl"
              sx={{
                backgroundColor: "white",
                color: "black",
                "&:hover": {
                  backgroundColor: "#F5F5F5",
                },
              }}
            >
              Sign up
            </Button>
          </Stack>
        </Stack>
      </Box>
    </>
  );
};

export default Home;
