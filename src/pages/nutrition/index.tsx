import * as React from "react";
import { useSearchParams } from "react-router";

import { ErrorBoundary } from "../../components/ErrorBoundary";
import Instructions from "./Instructions";
import { RobotoffNutrientExtraction } from "../../components/OffWebcomponents";
import { Box, Autocomplete, TextField } from "@mui/material";
import { useCountry } from "../../contexts/CountryProvider";
import { useTranslation } from "react-i18next";
import countries from "../../assets/countries.json";

interface CountryOption {
  id: string;
  label: string;
  languageCode: string;
  countryCode: string;
}

function isValidCountryCode(countryCode?: string | null): countryCode is string {
  return !!countryCode && countryCode !== "world" && countryCode !== "";
}

export default function Nutrition() {
  const [searchParams] = useSearchParams();
  const productCode = searchParams.get("code") || undefined;
  const [country, setCountry] = useCountry();
  const { t } = useTranslation();

  // Find selected country, filter out empty string and "world"
  const selectedCountry = React.useMemo(() => {
    if (!isValidCountryCode(country)) {
      return null;
    }
    return countries.find((c) => c.countryCode === country) || null;
  }, [country]);

  // Only pass countryCode to webcomponent if it's a real country (not empty or "world")
  const filterCountryCode = isValidCountryCode(country) ? country : undefined;

  return (
    <React.Suspense>
      <ErrorBoundary>
        <Instructions />
        <Box sx={{ mb: 2, px: 2 }}>
          <Autocomplete<CountryOption>
            value={selectedCountry}
            onChange={(event, newValue) => {
              setCountry(newValue?.countryCode || "", "page");
            }}
            options={countries}
            isOptionEqualToValue={(option, value) =>
              option.countryCode === value.countryCode
            }
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("questions.filters.long_label.country")}
                placeholder={t("questions.filters.placeholders.country")}
                size="small"
              />
            )}
            sx={{ mb: 2, maxWidth: 400 }}
          />
          <RobotoffNutrientExtraction
            productCode={productCode}
            countryCode={filterCountryCode}
          />
        </Box>
      </ErrorBoundary>
    </React.Suspense>
  );
}
