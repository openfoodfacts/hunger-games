import * as React from "react";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";

export default function Insights() {
  const { t } = useTranslation();
  return (
    <center>
      <Box
        component="img"
        sx={{
          width: { xs: "100%", md: "60%" },
          height: "auto",
        }}
        alt="404 not found"
        src={require("../../assets/404.png")}
      />
      <Box
        sx={{
          typography: "h1",
          fontSize: "2em",
          marginTop: "-5rem",
        }}
      >
        {t("notfound.nopage")}
      </Box>
      <Box
        sx={{
          typography: "body1",
          fontSize: "1.2em",
          marginTop: "1rem",
        }}
      >
        {t("notfound.redirect1")}
        <Box
          component="a"
          href="/logos"
          sx={{
            textDecoration: "none",
            color: "#6559f6",
          }}
        >
          {t("notfound.redirect2")}
        </Box>
      </Box>
    </center>
  );
}
