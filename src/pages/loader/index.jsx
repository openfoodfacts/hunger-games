import * as React from "react";
import { Stack, CircularProgress, CssBaseline } from "@mui/material";

export default function Loader() {
  return (
    <React.Fragment>
      <CssBaseline />
      <Stack
  sx={(theme) => ({
    bgcolor: theme.palette.paper,
    height: "100vh",
    p: 3, // Added padding
  })}
  justifyContent="center"
  alignItems="center"
>

        <CircularProgress />
      </Stack>
    </React.Fragment>
  );
}
