import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { OFF_URL } from "../../const";
import LoginContext from "../../contexts/login";

const ShouldLoggedinPage = () => {
  const { t } = useTranslation();
  const { refresh } = useContext(LoginContext);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  return (
    <Box
      sx={(theme) => ({
        minHeight: "calc(100vh - 64px)",
        py: { xs: 3, md: 6 },
        backgroundColor: theme.palette.action.hover,
      })}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center" }}>
            <AccountCircleOutlinedIcon color="primary" sx={{ fontSize: 56 }} />
            <Typography variant="h5" component="h1" sx={{ fontWeight: 800 }}>
              {t("login.restricted_title")}
            </Typography>
            <Typography color="text.secondary">
              {t("login.restricted_description")}
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ width: "100%", pt: 1 }}
            >
              <Button
                fullWidth
                size="large"
                variant="contained"
                href={`${OFF_URL}/cgi/login.pl`}
                target="_blank"
                rel="noreferrer"
              >
                {t("login.log_in")}
              </Button>
              <Button
                fullWidth
                size="large"
                variant="outlined"
                href={`${OFF_URL}/cgi/user.pl`}
                target="_blank"
                rel="noreferrer"
              >
                {t("login.sign_up")}
              </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {t("login.redirect_hint")}
            </Typography>
            <Box sx={{ pt: 1 }}>
              <Button
                size="small"
                color="inherit"
                startIcon={
                  isRefreshing ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <RefreshIcon />
                  )
                }
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {t("login.refresh_status", "Check login status")}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default ShouldLoggedinPage;
