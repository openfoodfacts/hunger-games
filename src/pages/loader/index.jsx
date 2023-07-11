import * as React from "react";
import { Stack, CircularProgress, CssBaseline } from "@mui/material";

export default function Loader() {
  return (
    <React.Fragment>
      <CssBaseline />
      <Stack
        sx={{ bgcolor: "#121212", height: "100vh" }}
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Stack>
    </React.Fragment>
  );
}
