import * as React from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Avatar from "@mui/material/Avatar";
import { alpha, useTheme } from "@mui/material/styles";

import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";

import { LeaderboardContributor } from "./types";
import LoginContext from "../../contexts/login";
import { getUserStats } from "./dataQualityService";

interface LeaderboardCardProps {
  contributors: LeaderboardContributor[];
}

export default function LeaderboardCard({
  contributors,
}: LeaderboardCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { userName } = React.useContext(LoginContext);

  const { fixedCount, streak } = getUserStats();

  // Augment leaderboard with current user if they have fixes
  const enrichedLeaderboard = React.useMemo(() => {
    let list = [...contributors];

    if (userName && fixedCount > 0) {
      const existingIndex = list.findIndex((c) => c.username === userName);
      if (existingIndex >= 0) {
        list[existingIndex] = {
          ...list[existingIndex],
          nbOfProductsFixed: list[existingIndex].nbOfProductsFixed + fixedCount,
          isCurrentUser: true,
        };
      } else {
        list.push({
          rank: list.length + 1,
          username: userName,
          nbOfProductsFixed: fixedCount,
          isCurrentUser: true,
        });
      }
      list.sort((a, b) => b.nbOfProductsFixed - a.nbOfProductsFixed);
      list = list.map((c, i) => ({ ...c, rank: i + 1 }));
    }

    return list;
  }, [contributors, userName, fixedCount]);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Typography sx={{ fontSize: "1.2rem" }}>🥇</Typography>;
      case 2:
        return <Typography sx={{ fontSize: "1.2rem" }}>🥈</Typography>;
      case 3:
        return <Typography sx={{ fontSize: "1.2rem" }}>🥉</Typography>;
      default:
        return (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 800,
              color: "text.secondary",
              width: 24,
              textAlign: "center",
            }}
          >
            #{rank}
          </Typography>
        );
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <EmojiEventsRoundedIcon sx={{ color: "#E65100" }} />
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {t(
                  "data_quality.leaderboard.title",
                  "Contributors' Board (Last 5 Days)",
                )}
              </Typography>
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 700 }}
            >
              {t(
                "data_quality.leaderboard.quote",
                "Can it help your motivation? That said, remember this is a collective effort. Every fix counts. But no shame if you don't have much time for it :-)",
              )}
            </Typography>
          </Box>

          {/* User's Current Session Stats Badge */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              px: 2,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexShrink: 0,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "text.secondary",
                  display: "block",
                }}
              >
                {t("data_quality.leaderboard.your_fixes", "Your Fixes Today")}
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "primary.main", lineHeight: 1.1 }}
              >
                {fixedCount}
              </Typography>
            </Box>
            {streak > 0 && (
              <Chip
                icon={
                  <LocalFireDepartmentRoundedIcon
                    sx={{ fontSize: "16px !important", color: "#e65100" }}
                  />
                }
                label={`${streak}d streak`}
                size="small"
                sx={{
                  fontWeight: 800,
                  backgroundColor: "#FFF3E0",
                  color: "#E65100",
                  height: 24,
                }}
              />
            )}
          </Paper>
        </Stack>

        {/* Leaderboard Table */}
        <TableContainer sx={{ maxHeight: 440, borderRadius: 2 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, width: 80 }}>
                  {t("data_quality.leaderboard.rank", "Rank")}
                </TableCell>
                <TableCell sx={{ fontWeight: 800 }}>
                  {t("data_quality.leaderboard.contributor", "Contributor")}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>
                  {t("data_quality.leaderboard.fixed_count", "Products Fixed")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enrichedLeaderboard.map((item) => {
                const isUser = item.isCurrentUser;
                return (
                  <TableRow
                    key={item.username}
                    sx={{
                      backgroundColor: isUser
                        ? alpha(theme.palette.primary.main, 0.1)
                        : "inherit",
                      "&:hover": {
                        backgroundColor: isUser
                          ? alpha(theme.palette.primary.main, 0.15)
                          : theme.palette.action.hover,
                      },
                    }}
                  >
                    <TableCell sx={{ py: 1.2 }}>
                      {getRankBadge(item.rank)}
                    </TableCell>
                    <TableCell sx={{ py: 1.2 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 30,
                            height: 30,
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            backgroundColor: isUser
                              ? theme.palette.primary.main
                              : theme.palette.secondary.main,
                            color: isUser
                              ? theme.palette.primary.contrastText
                              : theme.palette.secondary.contrastText,
                          }}
                        >
                          {item.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography
                            component="a"
                            href={`https://world.openfoodfacts.org/editor/${item.username}`}
                            target="_blank"
                            rel="noreferrer"
                            sx={{
                              fontWeight: 700,
                              color: "inherit",
                              textDecoration: "none",
                              "&:hover": { textDecoration: "underline" },
                            }}
                          >
                            {item.username}
                          </Typography>
                          {isUser && (
                            <Chip
                              label={t("data_quality.leaderboard.you", "You")}
                              size="small"
                              color="primary"
                              sx={{
                                ml: 1,
                                height: 18,
                                fontSize: "0.65rem",
                                fontWeight: 800,
                              }}
                            />
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {item.nbOfProductsFixed.toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
