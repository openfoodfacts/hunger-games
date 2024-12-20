import * as React from "react";
import Stack, { StackProps } from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useTranslation } from "react-i18next";
import offService from "../../off";
import { Typography } from "@mui/material";

export default function LinkToProduct(
  props: { barcode: string; count: number } & StackProps,
) {
  const { barcode, count, ...other } = props;

  const { t } = useTranslation();
  return (
    <Stack direction="row" alignItems="center" {...other}>
      <Button
        size="small"
        component={Link}
        target="_blank"
        href={offService.getProductUrl(barcode)}
        variant="outlined"
        startIcon={<VisibilityIcon />}
        sx={{ minWidth: 150 }}
        disabled={!barcode}
      >
        {t("questions.view")}
      </Button>
      <Button
        size="small"
        component={Link}
        target="_blank"
        href={offService.getProductEditUrl(barcode)}
        variant="contained"
        startIcon={<EditIcon />}
        sx={{ ml: 2, minWidth: 150 }}
        disabled={!barcode}
      >
        {t("questions.edit")}
      </Button>
      <Typography sx={{ ml: "auto" }}>
        {t("questions.remaining", {
          count,
        })}
      </Typography>
    </Stack>
  );
}
