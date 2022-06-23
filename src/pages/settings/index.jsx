import * as React from "react";
import messages from "../../i18n/messages";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

import { useTranslation } from "react-i18next";

import { localSettings } from "../../localeStorageManager";

export default function Settings() {
  const { t, i18n } = useTranslation();

  const [language, setLanguage] = React.useState(i18n.language);

  const handleChange = (e) => {
    localSettings.update("lang", e.target.value);
    i18n.changeLanguage(e.target.value);
    setLanguage(e.target.value);
  };

  return (
    <Stack sx={{ my: 5, mx: 2, alignItems: "flex-start" }}>
      <Typography variant="h4" component="h2" sx={{ mb: 5 }}>
        Settings
      </Typography>
      <TextField
        select
        sx={{ minWidth: 150 }}
        label={t("settings.language")}
        value={language}
        onChange={handleChange}
      >
        {Object.keys(messages).map((lang) => (
          <MenuItem key={lang} value={lang}>
            {lang.toUpperCase()}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
