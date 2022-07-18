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

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">Home</Typography>

      <Divider sx={{ m: 2 }} />
      <Typography variant="h6">Favorite filters</Typography>

      <Stack spacing={4} flexWrap="wrap" direction="row">
        {savedQuestions.length === 0 && (
          <Typography variant="body1">
            You will find here all the filter setting you saved in the{" "}
            <Link to="/questions">question game</Link>
          </Typography>
        )}
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
