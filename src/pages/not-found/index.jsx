import * as React from "react";
import Box from "@mui/material/Box";

export default function Insights() {
  return (
    <center>
      <Box
        component="img"
        sx={{
          width: { xs: "100%", md: "60%" },
          height: "auto",
        }}
        alt="The house from the offer."
        src={require("../../assets/404.png")}
      />
      <Box
        sx={{
          typography: "h1",
          fontSize: "2em",
          marginTop: "-5rem",
        }}
      >
        Whoops! The page you're looking for can't be found.
      </Box>
      <Box
        sx={{
          typography: "body1",
          fontSize: "1.2em",
          marginTop: "1rem",
        }}
      >
        Want to play some games?{" "}
        <Box
          component="a"
          href="/logos"
          sx={{
            textDecoration: "none",
            color: "#6559f6",
          }}
        >
          Click here
        </Box>
      </Box>
    </center>
  );
}
