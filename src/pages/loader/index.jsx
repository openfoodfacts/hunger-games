import * as React from "react";
import { Stack, CircularProgress, CssBaseline } from "@mui/material";

const Loader = () => {
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
};

export default Loader;
