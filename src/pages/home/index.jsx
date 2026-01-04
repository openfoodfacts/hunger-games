import * as React from "react";

import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Modal from "@mui/material/Modal";

import { OFF_URL } from "../../const";
import QuestionCard from "../../components/QuestionCard";
import FooterWithLinks from "../../components/Footer";
import HomeCards from "./homeCards";
import UserData from "./UserData";

import { localFavorites } from "../../localeStorageManager";
import LoginContext from "../../contexts/login";
import Loader from "../loader";

const Home = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [savedQuestions] = React.useState(() => {
    return localFavorites.fetch().questions ?? [];
  });

  const { isLoggedIn, userName } = React.useContext(LoginContext);

  const size = Object.keys(savedQuestions).length;
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <React.Suspense fallback={<Loader />}>
      <Box sx={{ p: 2, alignItems: "center" }}>
        <Typography
          variant="h5"
          sx={{ margin: "20px auto", textAlign: "center" }}
        >
          {t("home.game_selector.title")}
        </Typography>
        <HomeCards />
        {size > 0 && (
          <Typography
            variant="h5"
            sx={{ margin: "40px auto", textAlign: "center" }}
          >
            {t("home.saved_filters")}
          </Typography>
        )}
        <Stack spacing={4} flexWrap="wrap" direction="row">
          {savedQuestions.map((props) => (
            <Box sx={{ marginBottom: 5 }} key={props.title}>
              <QuestionCard showFilterResume editableTitle {...props} />
            </Box>
          ))}
        </Stack>
      </Box>

      {isLoggedIn ? (
        <UserData username={userName} />
      ) : (
        <React.Fragment>
          <Box
            padding={{ xs: "20px", sm: "50px" }}
            sx={{
              backgroundColor: theme.palette.action.selected,
            }}
          >
            <Stack
              spacing={4}
              flexWrap="wrap"
              direction={{ xs: "column", sm: "column", md: "row" }}
              alignItems="center"
              justifyContent="center"
            >
              <Typography
                variant="h5"
                sx={{
                  textAlign: "center",
                  lineHeight: "1.75",
                }}
              >
                {t("home.account_band.title")}
              </Typography>
              <Stack direction="row">
                <Button
                  variant="contained"
                  href={`${OFF_URL}/cgi/login.pl`}
                  sx={{
                    margin: "0 20px",
                  }}
                >
                  {t("home.account_band.log_in")}
                </Button>
                <Button variant="outlined" href={`${OFF_URL}/cgi/user.pl`}>
                  {t("home.account_band.sign_up")}
                </Button>
              </Stack>
            </Stack>
          </Box>
          <Box textAlign="center">
            <Button
              onClick={handleOpen}
              sx={{
                margin: "20px auto",
              }}
            >
              {t("home.account_band.contribution_details")}
            </Button>
          </Box>
          <Divider />

          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-contribution-title"
            aria-describedby="modal-contribution-information"
          >
            <Box
              width={{ xs: "90%", sm: "50%" }}
              sx={{
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.secondary.contrastText,
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                padding: "20px",
              }}
            >
              <Typography
                id="modal-contribution-title"
                variant="h6"
                component="h2"
                fontWeight={700}
              >
                {t("home.contribution_modal.title")}
              </Typography>
              <Typography
                class="modal-contribution-information"
                sx={{ mt: 2 }}
                component="p"
              >
                {t("home.contribution_modal.information")}
              </Typography>
              <Typography
                class="modal-contribution-information"
                sx={{ mt: 2 }}
                component="p"
              >
                {t("home.contribution_modal.thank_you")}
              </Typography>
            </Box>
          </Modal>
        </React.Fragment>
      )}

      <Divider sx={{ width: "100%" }} light />
      <FooterWithLinks />
    </React.Suspense>
  );
};

export default Home;
