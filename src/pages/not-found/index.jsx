import * as React from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function Insights() {
  const { t } = useTranslation();

  return (
    <Box sx={{ textAlign: "center" }}>
      <Box
        component="img"
        sx={{
          width: { xs: "100%", sm: 600 },
          height: "auto",
        }}
        alt={t("notfound.image_alt")}
        src={require("../../assets/404.png")}
      />
      <Typography variant="h4">{t("notfound.nopage")}</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        {t("notfound.redirect1")}{" "}
        <Typography
          component="a"
          href="/questions"
          sx={{
            textDecoration: "none",
            color: "#6559f6",
          }}
        >
          {t("notfound.redirect2")}
        </Typography>
      </Typography>
    </Box>
  );
}
