import * as React from "react";

import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Autocomplete from "@mui/material/Autocomplete";
import BugReportIcon from "@mui/icons-material/BugReport";

import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

import Loader from "../loader";
import messages from "../../i18n/messages";

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

  const handleDevModeChange = (_: React.SyntheticEvent, checked: boolean) => {
    localSettings.update(localSettingsKeys.isDevMode, checked);
    setDevMode(checked);
  };

  const handleVisiblePagesChange =
    (pageUrl: string) => (_: React.SyntheticEvent, checked: boolean) => {
      const newVisiblePages = { ...visiblePages, [pageUrl]: checked };
      localSettings.update(localSettingsKeys.visiblePages, newVisiblePages);
      setVisiblePages(newVisiblePages);
    };

  const handleLangChange = (newLang: string) => {
    localSettings.update(localSettingsKeys.language, newLang);
    void i18n.changeLanguage(newLang);
    setLanguage(newLang);
  };

  return (
    <React.Suspense fallback={<Loader />}>
      <Stack sx={{ my: 5, mx: 2, alignItems: "flex-start" }} spacing={4}>
        <Typography variant="h4" component="h2" sx={{ mb: 5 }}>
          {t("settings.settings")}
        </Typography>

        <Autocomplete
          sx={{ width: 150 }}
          options={Object.keys(messages)}
          getOptionLabel={(lang) => lang.toUpperCase()}
          value={language}
          onChange={(_, newLang) => {
            if (newLang) {
              handleLangChange(newLang);
            }
          }}
          disableClearable
          renderInput={(params) => (
            <TextField {...params} label={t("settings.language")} />
          )}
        />

        <Autocomplete
          sx={{ width: 260 }}
          options={countryNames}
          getOptionLabel={(option) => option.label}
          value={countryNames.find((c) => c.countryCode === country) ?? null}
          isOptionEqualToValue={(option, value) =>
            option.countryCode === value.countryCode
          }
          onChange={(_, newValue) =>
            setCountry(newValue?.countryCode ?? "", "global")
          }
          renderInput={(params) => (
            <TextField {...params} label={t("green-score.countryLabel")} />
          )}
        />

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

        <Button
          variant="outlined"
          href="https://github.com/openfoodfacts/hunger-games/issues"
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<BugReportIcon />}
        >
          {t("settings.reportIssue")}
        </Button>
      </Stack>
      <Divider sx={{ width: "100%" }} light />
      <FooterWithLinks />
    </React.Suspense>
  );
}
