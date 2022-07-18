import * as React from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import HomeCard from "./homeCards";
import QuestionCard from "../../components/QuestionCard";
import { localFavorites } from "../../localeStorageManager";

const Home = () => {
  const [savedQuestions] = React.useState(() => {
    return localFavorites.fetch().questions ?? [];
  });

  return (
    <Box sx={{ p: 2, alignItems:"center" }}>
      <HomeCard/>
      <Stack spacing={4} flexWrap="wrap" direction={{xs:"column",sm:"row"}} alignItems="center">
        {savedQuestions.map((props) => (
          <Box key={props.title}>
            <QuestionCard showFilterResume {...props} />
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default Home;
