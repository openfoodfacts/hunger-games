import * as React from "react";
import { Stack, CircularProgress, CssBaseline } from "@mui/material";

export default function Loader({ inline = false }) {
  if (inline) {
    return (
      <Stack
        sx={{
          justifyContent: "center",
          alignItems: "center",
          py: 3,
        }}
      >
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <Stack
        sx={[
          {
            justifyContent: "center",
            alignItems: "center",
          },
          (theme) => ({
            bgcolor: theme.palette.paper,
            height: "100vh",
            p: 3,
          }),
        ]}
      >
        <CircularProgress />
      </Stack>
    </React.Fragment>
  );
}
