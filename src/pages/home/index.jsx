import * as React from "react";

import { Link } from "react-router-dom";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import HomeCard from "./homeCards";
import QuestionCard from "../../components/QuestionCard";
import { localFavorites } from "../../localeStorageManager";
import Divider from "@mui/material/Divider";

const Home = () => {
  const [savedQuestions] = React.useState(() => {
    return localFavorites.fetch().questions ?? [];
  });
  const size = Object.keys(savedQuestions).length;

  return (
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
        direction={{ xs: "column", sm: "column", md:"row" }}
        alignItems="center"
        justifyContent="center"
      >
        {savedQuestions.map((props) => (
          <Box sx={{ marginBottom: 5 }} key={props.title}>
            <QuestionCard showFilterResume editableTitle {...props} />
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default Home;
