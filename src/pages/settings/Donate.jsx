import { Button, Typography } from "@mui/material";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import { Box } from "@mui/system";

const Donate = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: {
          xs: "column-reverse",
          sm: "column-reverse",
          md: "row",
        },
        gap: "20px",
        justifyContent: "space-around",
        pl: { md: "25px", xs: "", sm: "" },
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
          Donate
        </Button>
      </div>
      <Typography textAlign={{ xs: "center", md: "left" }}>
        Open Food Facts is a collaborative project built by tens of thousands of
        volunteers and managed by a non-profit organization with 8 employees. We
        need your donations to fund the Open Food Facts 2023 budget and to
        continue to develop the project.
        <br />
        <br />
        <Typography variant="h6">Thank you ❤️</Typography>
      </Typography>
    </Box>
  );
};

export default Donate;
