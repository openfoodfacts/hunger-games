import * as React from "react";
import messages from "../../i18n/messages";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import MuiLink from "@mui/material/Link";

import { useTranslation } from "react-i18next";

import DevModeContext from "../../contexts/devMode";
import { localSettings,localSettingsKeys } from "../../localeStorageManager";


export default function Settings() {
  const { t, i18n } = useTranslation();

  const [language, setLanguage] = React.useState(i18n.language);

  const { devMode, setDevMode } = React.useContext(DevModeContext);

  const handleDevModeChange = (event) => {
    localSettings.update(localSettingsKeys.isDevMode, event.target.checked);
    setDevMode(event.target.checked);
  };

  const handleLangChange = (e) => {
    localSettings.update(localSettingsKeys.language, e.target.value);
    i18n.changeLanguage(e.target.value);
    setLanguage(e.target.value);
  };

  return (
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

      <div>
        <p>To explore the database content, activate the dev mode</p>
        <FormControlLabel
          checked={devMode}
          onChange={handleDevModeChange}
          control={<Switch />}
          label="Dev Mode"
          labelPlacement="end"
        />
      </div>
      <div>
      <MuiLink
              href="https://github.com/openfoodfacts/hunger-games/issues"
              target="_blank"
            >
            {t("settings.reportIssue")}
            </MuiLink>
      </div>
    </Stack>
  );
}
