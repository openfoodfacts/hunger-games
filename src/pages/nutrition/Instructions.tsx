/* eslint-disable react/no-unescaped-entities */
import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { Trans, useTranslation } from "react-i18next";

export default function Instructions() {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button
        size="small"
        variant="outlined"
        onClick={handleClickOpen}
        sx={{ margin: 2 }}
      >
        {t("nutrition.instructions.open_button")}
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {t("nutrition.instructions.title")}
        </DialogTitle>
        <DialogContent sx={{ "& p": { marginBottom: 2 } }}>
          <DialogContentText component="div" id="alert-dialog-description">
            <Typography>
              {t(
                "nutrition.instructions.chose_between_empty_and_partially_filled",
              )}
            </Typography>
            <Typography>
              {t("nutrition.instructions.picture_date_is_display")}
            </Typography>
            <Typography>
              {t("nutrition.instructions.nutriments_from_off_are_displayed")}
              <ol>
                <li>
                  <Trans i18nKey="nutrition.instructions.green_for_same">
                    With <span style={{ color: "green" }}>green</span> for those
                    matching with the input value.
                  </Trans>
                </li>
                <li>
                  <Trans i18nKey="nutrition.instructions.orange_for_empty">
                    With <span style={{ color: "orange" }}>orange</span> for
                    those with empty input value.
                  </Trans>
                </li>
                <li>
                  <Trans i18nKey="nutrition.instructions.red_for_different">
                    With <span style={{ color: "red" }}>red</span> for those
                    with different input value.
                  </Trans>
                </li>
              </ol>
              {t("nutrition.instructions.indicate_not_provided_value")}
            </Typography>
            <Typography>
              {t("nutrition.instructions.validate_one_column")}
            </Typography>

            <ul>
              <li>{t("nutrition.instructions.skip_button")}</li>
              <li>{t("nutrition.instructions.invalid_image_button")}</li>
            </ul>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            {t("nutrition.instructions.close")}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
