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
        flexDirection: {
          xs: "column-reverse",
          sm: "column-reverse",
          md: "row",
        },
        gap: "20px",
        justifyContent: "space-around",
        px: { md: "25px", xs: "15px", sm: "15px" },
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button
          href="https://world.openfoodfacts.org/donate-to-open-food-facts?utm_source=off&utf_medium=web&utm_campaign=donate-2023&utm_term=en-text-button"
          target="_blank"
          sx={{
            height: { xs: "50px", md: "50%" },
            width: { xs: "200px", md: "100%" },
            borderRadius: "100px",
            p: "30px",
          }}
          variant="outlined"
          startIcon={<VolunteerActivismIcon />}
        >
          {t("settings.donate")}
        </Button>
      </div>
      <Typography textAlign={{ xs: "center", md: "left" }}>
        {t("settings.text1")}
        <br />
        <br />
        <Typography variant="h6">{t("settings.thank_you")} ❤️</Typography>
      </Typography>
    </Box>
  );
};

export default Donate;
