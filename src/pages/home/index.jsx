import * as React from "react";

import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { OFF_URL } from "../../const";
import QuestionCard from "../../components/QuestionCard";
import FooterWithLinks from "../../components/Footer";
import logo from "../../assets/logo.png";
import HomeCards from "./homeCards";
import UserData from "./UserData";

import { localFavorites } from "../../localeStorageManager";
import LoginContext from "../../contexts/login";
import Loader from "../loader";

const HomeHero = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Paper
      component="section"
      elevation={0}
      aria-labelledby="home-title"
      sx={{
        position: "relative",
        overflow: "hidden",
        px: { xs: 3, sm: 5, md: 7 },
        py: { xs: 2.75, sm: 3.5 },
        borderRadius: 3,
        color: theme.palette.cafeCreme.contrastText,
        backgroundColor: theme.palette.cafeCreme.main,
        border: `1px solid ${theme.palette.divider}`,
        "&::after": {
          content: '""',
          position: "absolute",
          width: 180,
          height: 180,
          right: { xs: -100, sm: -50 },
          top: -110,
          borderRadius: "50%",
          backgroundColor: theme.palette.action.hover,
        },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 2.5, sm: 4 }}
        sx={{ position: "relative", zIndex: 1, alignItems: "center" }}
      >
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: 68, sm: 84 },
            height: { xs: 68, sm: 84 },
            display: "grid",
            placeItems: "center",
            borderRadius: "32%",
          }}
        >
          <Box
            component="img"
            src={logo}
            alt=""
            sx={{ width: "72%", height: "72%", objectFit: "contain" }}
          />
        </Box>
        <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
          <Typography
            variant="overline"
            sx={{
              display: "block",
              fontWeight: 700,
              letterSpacing: "0.16em",
              opacity: 0.78,
            }}
          >
            {t("menu.title")}
          </Typography>
          <Typography
            id="home-title"
            component="h1"
            variant="h3"
            sx={{
              fontWeight: 800,
              lineHeight: 1.1,
              fontSize: { xs: "1.75rem", sm: "2.35rem" },
            }}
          >
            {t("home.game_selector.title")}
          </Typography>
        </Box>
      </Stack>
      <Divider sx={{ my: { xs: 2.5, sm: 3 }, borderColor: "divider" }} />
      <HomeCards />
    </Paper>
  );
};

const SavedFilters = ({ savedQuestions, onDelete }) => {
  const { t } = useTranslation();
  const [filterToDelete, setFilterToDelete] = React.useState(null);

  if (savedQuestions.length === 0) {
    return null;
  }

  return (
    <Box
      component="section"
      aria-labelledby="saved-filters-title"
      sx={{ mt: 6 }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: "center", mb: 2.5 }}
      >
        <Typography
          id="saved-filters-title"
          component="h2"
          variant="h5"
          sx={{ fontWeight: 700 }}
        >
          {t("home.saved_filters")}
        </Typography>
        <Chip label={savedQuestions.length} size="small" color="primary" />
      </Stack>
      <Box sx={{ display: "grid", gap: 1.5 }}>
        {savedQuestions.map((props) => (
          <QuestionCard
            key={props.title}
            showFilterResume
            editableTitle
            compact
            onDelete={() => setFilterToDelete(props)}
            {...props}
          />
        ))}
      </Box>
      <Dialog
        open={Boolean(filterToDelete)}
        onClose={() => setFilterToDelete(null)}
        fullWidth
        maxWidth="xs"
        aria-labelledby="delete-saved-filter-title"
      >
        <DialogTitle id="delete-saved-filter-title" sx={{ fontWeight: 700 }}>
          {t("home.saved_filters_delete_title")}
        </DialogTitle>
        <DialogContent>
          <Typography>{t("home.saved_filters_delete_description")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterToDelete(null)}>
            {t("questions.filters.actions.cancel")}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (filterToDelete) {
                onDelete(filterToDelete);
                setFilterToDelete(null);
              }
            }}
          >
            {t("home.saved_filters_delete_confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const AccountPrompt = ({ onLearnMore }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box
      component="section"
      aria-labelledby="account-prompt-title"
      sx={{ mt: 6 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.action.selected,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          sx={{ alignItems: { xs: "stretch", md: "center" } }}
        >
          <Typography
            id="account-prompt-title"
            component="h2"
            variant="h5"
            sx={{ flex: 1, fontWeight: 700, lineHeight: 1.35 }}
          >
            {t("home.account_band.title")}
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ flexShrink: 0 }}
          >
            <Button
              variant="contained"
              size="large"
              href={`${OFF_URL}/cgi/login.pl`}
            >
              {t("home.account_band.log_in")}
            </Button>
            <Button
              variant="outlined"
              size="large"
              href={`${OFF_URL}/cgi/user.pl`}
            >
              {t("home.account_band.sign_up")}
            </Button>
          </Stack>
        </Stack>
      </Paper>
      <Box sx={{ textAlign: "center", mt: 1.5 }}>
        <Button onClick={onLearnMore}>
          {t("home.account_band.contribution_details")}
        </Button>
      </Box>
    </Box>
  );
};

const ContributionDialog = ({ open, onClose }) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="contribution-dialog-title"
    >
      <DialogTitle id="contribution-dialog-title" sx={{ fontWeight: 700 }}>
        {t("home.contribution_modal.title")}
      </DialogTitle>
      <DialogContent dividers>
        <Typography component="p">
          {t("home.contribution_modal.information")}
        </Typography>
        <Typography component="p" sx={{ mt: 2 }}>
          {t("home.contribution_modal.thank_you")}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {t("questions.filters.actions.cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Home = () => {
  const [savedQuestions, setSavedQuestions] = React.useState(() => {
    return localFavorites.fetch().questions ?? [];
  });
  const { isLoggedIn, userName } = React.useContext(LoginContext);
  const [isContributionDialogOpen, setContributionDialogOpen] =
    React.useState(false);
  const handleDeleteSavedFilter = (questionToDelete) => {
    localFavorites.removeQuestion(questionToDelete.filterState);
    setSavedQuestions((questions) =>
      questions.filter((question) => question !== questionToDelete),
    );
  };

  return (
    <React.Suspense fallback={<Loader />}>
      <Box
        component="main"
        sx={(theme) => ({
          background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.action.hover} 100%)`,
        })}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
          <HomeHero />
          <SavedFilters
            savedQuestions={savedQuestions}
            onDelete={handleDeleteSavedFilter}
          />
          {isLoggedIn ? (
            <UserData userName={userName} />
          ) : (
            <AccountPrompt
              onLearnMore={() => setContributionDialogOpen(true)}
            />
          )}
        </Container>
      </Box>
      <ContributionDialog
        open={isContributionDialogOpen}
        onClose={() => setContributionDialogOpen(false)}
      />
      <FooterWithLinks />
    </React.Suspense>
  );
};

export default Home;
