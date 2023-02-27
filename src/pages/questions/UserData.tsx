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
import IconButton from "@mui/material/IconButton";
import CancelScheduleSendIcon from "@mui/icons-material/CancelScheduleSend";

import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { CORRECT_INSIGHT, WRONG_INSIGHT } from "../../const";
import offService from "../../off";
import LoginContext from "../../contexts/login";
import {
  answeredQuestionsSelector,
  numberOfQuestionsAvailableSelector,
} from "./store";

const NB_DISPLAYED_QUESTIONS = 30;
const UserData = () => {
  const { t } = useTranslation();
  const numberOfQuestionsAvailable = useSelector(
    numberOfQuestionsAvailableSelector
  );
  const answered = useSelector(answeredQuestionsSelector);

  const [loginAlreadyProposed, setLoginAlreadyProposed] = React.useState(false);
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);

  const { isLoggedIn } = React.useContext(LoginContext);

  React.useEffect(() => {
    if (answered.length > 3 && !isLoggedIn && !loginAlreadyProposed) {
      setLoginModalOpen(true);
    }
  }, [answered.length, isLoggedIn, loginAlreadyProposed]);

  let displayedAnswers = answered.filter(
    (question) => question.validationValue !== -1
  );

  displayedAnswers = displayedAnswers.slice(
    Math.max(0, displayedAnswers.length - NB_DISPLAYED_QUESTIONS),
    displayedAnswers.length
  );

  return (
    <Box>
      <Stack spacing={1}>
        <Typography sx={{ my: 2 }}>
          {t("questions.remaining_annotations")}: {numberOfQuestionsAvailable}
        </Typography>
        {displayedAnswers.map(
          ({
            insight_id,
            barcode,
            value,
            insight_type,
            validationValue,
            isPending,
          }) => (
            <Stack key={insight_id} direction="row" alignItems="center">
              {isPending && (
                <IconButton
                  size="small"
                  sx={{ mr: 1 }}
                  // Prevent sending logos could be reintroduce if done sever side
                  // onClick={() => preventAnnotation(insight_id)}
                >
                  <CancelScheduleSendIcon fontSize="inherit" />
                </IconButton>
              )}
              <Link href={offService.getProductEditUrl(barcode)}>
                {insight_type}: {value}
              </Link>
              {validationValue === WRONG_INSIGHT && (
                <CancelOutlinedIcon color="error" sx={{ ml: 2 }} />
              )}
              {validationValue === CORRECT_INSIGHT && (
                <CheckCircleOutlineIcon color="success" sx={{ ml: 2 }} />
              )}
            </Stack>
          )
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
            href="https://world.openfoodfacts.org/cgi/login.pl"
            component={Link}
            target="_blank"
          >
            {t("questions.log_in")}
          </Button>
          <Button
            variant="contained"
            href="https://world.openfoodfacts.org/cgi/user.pl"
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
