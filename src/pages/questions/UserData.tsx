import * as React from "react";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

import { useTranslation } from "react-i18next";
import { CORRECT_INSIGHT, WRONG_INSIGHT } from "../../const";
import offService from "../../off";

const NB_DISPLAYED_QUESTIONS = 30;
const UserData = ({ remainingQuestionNb = 0, answers = [] }) => {
  const { t } = useTranslation();

  let displayedAnswers = answers.filter(
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
          {t("questions.remaining_annotations")}: {remainingQuestionNb}
        </Typography>
        {displayedAnswers.map(
          ({ insight_id, barcode, value, insight_type, validationValue }) => (
            <Stack key={insight_id} direction="row">
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
    </Box>
  );
};

export default UserData;
