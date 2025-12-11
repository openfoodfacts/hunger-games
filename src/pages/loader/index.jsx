import * as React from "react";
import { Stack, CircularProgress, CssBaseline } from "@mui/material";

export default function Loader({
  fullScreen = true,
  height,
  ...props
}) {
  return (
    <React.Fragment>
      <CssBaseline />
      <Stack
        sx={(theme) => ({
          bgcolor: theme.palette.paper,
          height: height || (fullScreen ? "100vh" : "100%"),
          p: 3,
        })}
        justifyContent="center"
        alignItems="center"
        {...props}
      >
        <CircularProgress />
      </Stack>
    </React.Fragment>
  );
}
