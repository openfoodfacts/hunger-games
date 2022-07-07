import * as React from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import QuestionCard from "../../components/QuestionCard";
import { localFavorites } from "../../localeStorageManager";

const Home = () => {
  const [savedQuestions] = React.useState(() => {
    return localFavorites.fetch().questions ?? [];
  });

  return (
    <Box sx={{ p: 2 }}>
      <Typography>Home</Typography>
      <Stack spacing={4} flexWrap="wrap" direction="row">
        {savedQuestions.map((props) => (
          <Box sx={{ marginBottom: 5 }} key={props.title}>
            <QuestionCard showFilterResume {...props} />
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default Home;
