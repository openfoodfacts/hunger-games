import * as React from "react";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";

import { useTranslation } from "react-i18next";

import { CORRECT_INSIGHT, WRONG_INSIGHT, OFF_URL } from "../../const";
import offService from "../../off";
import LoginContext from "../../contexts/login";
import useQuestions from "../../hooks/useQuestions";

const UserData = () => {
  const { t } = useTranslation();

  const { questionsCount, recentAnswers } = useQuestions();

  const [loginAlreadyProposed, setLoginAlreadyProposed] = React.useState(false);

  const { isLoggedIn } = React.useContext(LoginContext);
  const loginModalOpen =
    recentAnswers.length > 3 && !isLoggedIn && !loginAlreadyProposed;

  return (
    <Box>
      <Stack spacing={1.25}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {t("questions.remaining_annotations")}:{" "}
          {questionsCount !== null && questionsCount >= 99
            ? "100+"
            : (questionsCount ?? 0)}
        </Typography>
        <Stack spacing={1} sx={{ maxHeight: 160, overflowY: "auto", pr: 0.5 }}>
          {recentAnswers.map(
            ({ insight_id, barcode, value, insight_type, answer }) => (
              <Stack
                key={insight_id}
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Link
                  href={offService.getProductEditUrl(barcode)}
                  sx={{ overflowWrap: "anywhere", fontSize: "0.875rem" }}
                >
                  {insight_type}: {value}
                </Link>
                {answer === WRONG_INSIGHT && (
                  <CancelOutlinedIcon color="error" fontSize="small" />
                )}
                {answer === CORRECT_INSIGHT && (
                  <CheckCircleOutlineIcon color="success" fontSize="small" />
                )}
              </Stack>
            ),
          )}
        </Stack>
      </Stack>
      <Dialog
        open={loginModalOpen}
        onClose={() => {
          setLoginAlreadyProposed(true);
        }}
      >
        <DialogTitle>{t("questions.login_title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("questions.login_description")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            href={`${OFF_URL}/cgi/login.pl`}
            component={Link}
            target="_blank"
          >
            {t("questions.log_in")}
          </Button>
          <Button
            variant="contained"
            href={`${OFF_URL}/cgi/user.pl`}
            component={Link}
            target="_blank"
          >
            {t("questions.sign_up")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserData;
