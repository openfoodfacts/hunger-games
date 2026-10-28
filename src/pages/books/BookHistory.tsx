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
import type { BookActionHistory } from "./types";

interface BookHistoryProps {
  history: BookActionHistory[];
}

export default function BookHistory({ history }: BookHistoryProps) {
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
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <HistoryRoundedIcon color="primary" />
        <Typography variant="h6" fontWeight={800}>
          {t("books.recent_activity", "Recent Session Activity")}
        </Typography>
        <Chip label={history.length} size="small" />
      </Stack>

      <Stack spacing={1}>
        {history.map((item, index) => {
          const isMoved = item.action === "moved";
          const isNotABook = item.action === "not_a_book";
          const isSkipped = item.action === "skipped";

          return (
            <Box
              key={`${item.code}-${index}`}
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
              <Stack direction="row" spacing={1.5} alignItems="center">
                {isMoved && (
                  <CheckCircleRoundedIcon color="success" fontSize="small" />
                )}
                {isNotABook && (
                  <CancelRoundedIcon color="error" fontSize="small" />
                )}
                {isSkipped && (
                  <ForwardRoundedIcon color="action" fontSize="small" />
                )}

                <Box>
                  <Typography variant="body2" fontWeight={700}>
                    {item.productName}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontFamily="monospace"
                  >
                    {item.code}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <Chip
                  size="small"
                  label={
                    isMoved
                      ? t("books.status_moved", "Moved to OPF")
                      : isNotABook
                        ? t("books.status_kept_off", "Kept in OFF")
                        : t("books.status_skipped", "Skipped")
                  }
                  color={isMoved ? "success" : isNotABook ? "error" : "default"}
                  variant={isMoved ? "filled" : "outlined"}
                  sx={{ fontWeight: 700 }}
                />

                <Link
                  href={`${OFF_URL}/product/${item.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    fontSize: "0.8rem",
                  }}
                >
                  OFF <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
                </Link>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}
