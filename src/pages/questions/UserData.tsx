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
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import { useTranslation } from "react-i18next";

import { CORRECT_INSIGHT, WRONG_INSIGHT, OFF_URL } from "../../const";
import offService from "../../off";
import LoginContext from "../../contexts/login";
import useQuestions from "../../hooks/useQuestions";

const UserData = () => {
  const { t } = useTranslation();

  const { questionsCount, recentAnswers } = useQuestions();

  const [loginAlreadyProposed, setLoginAlreadyProposed] = React.useState(false);
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);

  const { isLoggedIn } = React.useContext(LoginContext);

  React.useEffect(() => {
    if (recentAnswers.length > 3 && !isLoggedIn && !loginAlreadyProposed) {
      setLoginModalOpen(true);
    }
  }, [recentAnswers.length, isLoggedIn, loginAlreadyProposed]);

  return (
    <Box>
      <Stack spacing={1}>
        <Typography sx={{ my: 2 }}>
          {t("questions.remaining_annotations")}: {questionsCount}
        </Typography>
        {recentAnswers.map(
          ({ insight_id, barcode, value, insight_type, answer }) => (
            <Stack key={insight_id} direction="row" alignItems="center">
              <Link href={offService.getProductEditUrl(barcode)}>
                {insight_type}: {value}
              </Link>
              {answer === WRONG_INSIGHT && (
                <CancelOutlinedIcon color="error" sx={{ ml: 2 }} />
              )}
              {answer === CORRECT_INSIGHT && (
                <CheckCircleOutlineIcon color="success" sx={{ ml: 2 }} />
              )}
            </Stack>
          ),
        )}
      </Stack>
      <Dialog
        open={loginModalOpen}
        onClose={() => {
          setLoginModalOpen(false);
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
