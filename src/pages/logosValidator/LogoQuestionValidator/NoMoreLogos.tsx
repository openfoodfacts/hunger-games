import * as React from "react";
import { useTranslation } from "react-i18next";

import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface NoMoreLogosProps {
  insightType?: string;
  valueTag?: string;
}
export default function NoMoreLogos({
  insightType,
  valueTag,
}: NoMoreLogosProps) {
  const { t } = useTranslation();

  return (
    <Box sx={{ width: "100%", textAlign: "center", py: 5, m: 0 }}>
      <Typography variant="subtitle1">
        {t("logos.no_more_questions")}
      </Typography>
      <Button
        color="secondary"
        size="small"
        component={Link}
        variant="contained"
        href={`/logos/deep-search?type=${insightType}&value=${valueTag}`}
        target="_blank"
        sx={{ ml: 2, minWidth: 150 }}
      >
        Search
      </Button>
    </Box>
  );
}
