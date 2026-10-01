import { useContext, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslation } from "react-i18next";
import LoginContext from "../../contexts/login";
import { OFF_URL } from "../../const";

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
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          borderRadius: 2,
        }}
      >
        <LockOutlinedIcon color="primary" sx={{ fontSize: 56, mb: 1 }} />
        <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
          {t("restricted_page.title", "Restricted page")}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t(
            "restricted_page.description",
            "Advanced games and tools are restricted to connected users. Log in to your Open Food Facts account or create one to proceed.",
          )}
        </Typography>

        <Stack
          spacing={2}
          direction={{ xs: "column", sm: "row" }}
          justifyContent="center"
        >
          <Button
            variant="contained"
            color="primary"
            href={`${OFF_URL}/cgi/login.pl`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("questions.log_in", "Log in")}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            href={`${OFF_URL}/cgi/user.pl`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("questions.sign_up", "Sign up")}
          </Button>
        </Stack>

        <Box sx={{ mt: 3 }}>
          <Button
            size="small"
            color="inherit"
            startIcon={
              isRefreshing ? <CircularProgress size={16} /> : <RefreshIcon />
            }
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {t("restricted_page.refresh_status", "Check login status")}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ShouldLoggedinPage;
