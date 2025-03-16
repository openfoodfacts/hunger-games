import { Button, Typography } from "@mui/material";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import { Box } from "@mui/system";
import { useTranslation } from "react-i18next";

const Donate = () => {
  const { t } = useTranslation();
  return (
    <Box
      className="OFF-donate"
      sx={{
        display: "flex",
        flexDirection: { xs: "column-reverse", md: "row" },
        gap: "20px",
        justifyContent: "center",
        alignItems: "center",
        px: { md: "25px", xs: "15px" },
        maxWidth: "1200px",
        width: "100%",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography sx={{ maxWidth: "600px" }}>
          {t("settings.text1")}
          <br />
          <br />
          {t("settings.thank_you")} ❤️
        </Typography>

        <Button
          href="https://world.openfoodfacts.org/donate-to-open-food-facts?utm_source=off&utf_medium=web&utm_campaign=donate-2023&utm_term=en-text-button"
          target="_blank"
          sx={{
            mt: 3,
            width: { xs: "200px", md: "250px" },
            borderRadius: "100px",
            p: "12px 20px",
          }}
          variant="outlined"
          startIcon={<VolunteerActivismIcon />}
        >
          {t("settings.donate")}
        </Button>
      </Box>
    </Box>
  );
};

export default Donate;
