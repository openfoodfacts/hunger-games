import * as React from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

import { useTranslation } from "react-i18next";

import SmallQuestionCard from "../../components/SmallQuestionCard";
import Opportunities from "../../components/Opportunities";
import Loader from "../loader";
import { useCountry } from "../../contexts/CountryProvider";

import countryNames from "../../assets/countries.json";
import greenScoreCards from "./cards";

export default function GreenScore() {
  const { t } = useTranslation();
  const [country, setCountry] = useCountry();

  return (
    <React.Suspense fallback={<Loader />}>
      <Stack
        spacing={2}
        sx={{
          padding: 5,
        }}
      >
        <Typography>{t("green-score.description")}</Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gridGap: "10px 50px",
          }}
        >
          {greenScoreCards.map((props) => (
            <Box key={props.title}>
              <SmallQuestionCard {...props} />
            </Box>
          ))}
        </Box>

        <Divider />
        <TextField
          select
          label={t("green-score.countryLabel")}
          value={country}
          onChange={(event) => {
            setCountry(event.target.value, "global");
          }}
          sx={{ width: 200 }}
        >
          {countryNames.map((country) => (
            <MenuItem value={country.countryCode} key={country.countryCode}>
              {country.label}
            </MenuItem>
          ))}
        </TextField>

        <Opportunities
          type="category"
          countryCode={country}
          campaign="agribalyse-category"
        />
      </Stack>
    </React.Suspense>
  );
}
