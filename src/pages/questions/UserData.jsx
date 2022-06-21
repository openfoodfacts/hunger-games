import * as React from "react";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

import offService from "../../off";

const NB_DISPLAYED_QUESTIONS = 30;
const UserData = (props) => {
  const { remainingQuestionNb = 0, answers = [] } = props;

  let displayedAnswers = answers.filter((question) => question.validationValue !== -1);

  displayedAnswers = displayedAnswers.slice(Math.max(0, displayedAnswers.length - NB_DISPLAYED_QUESTIONS), displayedAnswers.length);

  return (
    <Box sx={{ padding: 2 }}>
      <Stack spacing={1}>
        <Typography sx={{ my: 2 }}>Remaining: {remainingQuestionNb}</Typography>
        {displayedAnswers.map(({ insight_id, barcode, value, insight_type, validationValue }) => (
          <Stack key={insight_id} direction="row">
            <Link href={offService.getProductEditUrl(barcode)}>
              {insight_type}: {value}
            </Link>
            {validationValue === 0 && <CancelOutlinedIcon color="error" sx={{ ml: 2 }} />}
            {validationValue === 1 && <CheckCircleOutlineIcon color="success" sx={{ ml: 2 }} />}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default UserData;
