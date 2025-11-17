import * as React from "react";
import messages from "../../i18n/messages";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Button from "@mui/material/Button";
import MuiLink from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

import Loader from "../loader";

import { useTheme } from "@mui/material/styles";

import { useTranslation } from "react-i18next";

import DevModeContext from "../../contexts/devMode";
import ColorModeContext from "../../contexts/colorMode";
import { useCountry } from "../../contexts/CountryProvider";

import { localSettings, localSettingsKeys } from "../../localeStorageManager";
import FooterWithLinks from "../../components/Footer";
import countryNames from "../../assets/countries.json";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const [language, setLanguage] = React.useState(i18n.language);
  const { devMode, setDevMode, visiblePages, setVisiblePages } =
    React.useContext(DevModeContext);

  const [country, setCountry] = useCountry();

  const handleDevModeChange = (event) => {
    localSettings.update(localSettingsKeys.isDevMode, event.target.checked);
    setDevMode(event.target.checked);
  };

  const handleVisiblePagesChange = (pageUrl) => (event) => {
    const newVisiblePages = {
      ...visiblePages,
      [pageUrl]: event.target.checked,
    };
    localSettings.update(localSettingsKeys.visiblePages, newVisiblePages);
    setVisiblePages(newVisiblePages);
  };

  const handleLangChange = (e) => {
    localSettings.update(localSettingsKeys.language, e.target.value);
    i18n.changeLanguage(e.target.value);
    setLanguage(e.target.value);
  };

  const handleCountryChange = (e) => {
    setCountry(e.target.value, "global");
  };

  return (
    <React.Suspense fallback={<Loader />}>
      <Stack sx={{ my: 5, mx: 2, alignItems: "flex-start" }} spacing={4}>
        <Typography variant="h4" component="h2" sx={{ mb: 5 }}>
          {t("settings.settings")}
        </Typography>
        <TextField
          select
          sx={{ minWidth: 150 }}
          label={t("settings.language")}
          value={language}
          onChange={handleLangChange}
        >
          {Object.keys(messages).map((lang) => (
            <MenuItem key={lang} value={lang}>
              {lang.toUpperCase()}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label={t("green-score.countryLabel")}
          value={country}
          onChange={handleCountryChange}
          sx={{ width: 200 }}
        >
          {countryNames.map((country) => (
            <MenuItem value={country.countryCode} key={country.countryCode}>
              {country.label}
            </MenuItem>
          ))}
        </TextField>

        <div>
          <p>{t("settings.dev_mode_title")}</p>
          <FormControlLabel
            checked={devMode}
            onChange={handleDevModeChange}
            control={<Switch />}
            label={t("settings.dev_mode_label")}
            labelPlacement="end"
          />
        </div>
        {devMode &&
          [
            { pageUrl: "logos", pageName: "logos", isExperimental: false },
            {
              pageUrl: "insights",
              pageName: "insights",
              isExperimental: false,
            },
          ].map(({ pageUrl, pageName, isExperimental }) => (
            <FormControlLabel
              key={pageUrl}
              checked={visiblePages[pageUrl] ?? false}
              onChange={handleVisiblePagesChange(pageUrl)}
              control={<Switch />}
              label={`${t("settings.dev_page_toggle", { name: pageName })}${
                isExperimental ? " (🚧 experimental)" : ""
              }`}
              labelPlacement="end"
              sx={{
                marginInlineStart: `${2 * (pageUrl.split("/").length - 1)}px`,
              }}
            />
          ))}
        {/* color mode */}
        <Button
          sx={{ ml: 1 }}
          onClick={colorMode.toggleColorMode}
          color="inherit"
        >
          {theme.palette.mode} mode
          {theme.palette.mode === "dark" ? (
            <Brightness7Icon sx={{ ml: 2 }} />
          ) : (
            <Brightness4Icon sx={{ ml: 2 }} />
          )}
        </Button>

        <div>
          <MuiLink
            href="https://github.com/openfoodfacts/hunger-games/issues"
            target="_blank"
          >
            {t("settings.reportIssue")}
          </MuiLink>
        </div>
      </Stack>
      <Divider sx={{ width: "100%" }} light />
      <FooterWithLinks />
    </React.Suspense>
  );
}
