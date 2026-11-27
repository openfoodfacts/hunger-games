import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import ForwardRoundedIcon from "@mui/icons-material/ForwardRounded";
import { useTranslation } from "react-i18next";

import { OFF_URL } from "../../const";
import type { Gs1ActionHistory } from "./types";

interface Gs1HistoryProps {
  history: Gs1ActionHistory[];
}

export default function Gs1History({ history }: Gs1HistoryProps) {
  const { t } = useTranslation();

  if (history.length === 0) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 3,
        p: 2.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: "center" }}>
        <HistoryRoundedIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {t("gs1_country.recent_activity", "Recent Session Activity")}
        </Typography>
        <Chip label={history.length} size="small" />
      </Stack>

      <Stack spacing={1}>
        {history.map((item, index) => {
          const isAdded = item.action === "added";
          const isRejected = item.action === "rejected";
          const isSkipped = item.action === "skipped";

          return (
            <Box
              key={`${item.code}-${item.timestamp}-${index}`}
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: "action.hover",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center" }}
              >
                {isAdded && (
                  <CheckCircleRoundedIcon color="success" fontSize="small" />
                )}
                {isRejected && (
                  <CancelRoundedIcon color="error" fontSize="small" />
                )}
                {isSkipped && (
                  <ForwardRoundedIcon color="action" fontSize="small" />
                )}

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {item.productName}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontFamily: "monospace" }}
                  >
                    {item.code}
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center" }}
              >
                <Chip
                  size="small"
                  label={
                    isAdded
                      ? t("gs1_country.status_added", "Added {{country}}", {
                          country: item.countryName,
                        })
                      : isRejected
                        ? t(
                            "gs1_country.status_rejected",
                            "Not sold in {{country}}",
                            { country: item.countryName },
                          )
                        : t("gs1_country.status_skipped", "Skipped")
                  }
                  color={isAdded ? "success" : isRejected ? "error" : "default"}
                  variant={isAdded ? "filled" : "outlined"}
                  sx={{ fontWeight: 700 }}
                />

                <Link
                  href={`${OFF_URL}/product/${item.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  OFF
                  <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
                </Link>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}
