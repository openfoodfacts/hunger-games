import * as React from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import QuestionCard from "../components/QuestionCard";

import Loader from "./loader";
import data from "./data.json";

const shuffledData = data
  .map((value) => ({ value, sort: Math.random() }))
  .sort((a, b) => a.sort - b.sort)
  .map(({ value }) => value);

export default function Page() {
  const [maxSize, setMaxSize] = React.useState(5);

  return (
    <React.Suspense fallback={<Loader />}>
      <Box sx={{ p: 2 }}>
        <Stack spacing={4} flexWrap="wrap" direction="row">
          {data.slice(0, maxSize).map((props) => (
            <Box sx={{ marginBottom: 5 }} key={props.title}>
              <QuestionCard showFilterResume editableTitle {...props} />
            </Box>
          ))}
        </Stack>
      </Box>
      <Button
        fullWidth
        disabled={maxSize > shuffledData.length}
        onClick={() => {
          setMaxSize((p) => p + 5);
        }}
      >
        More
      </Button>
    </React.Suspense>
  );
}
