import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import {
  CircularProgress,
  CardActionArea,
  CardMedia,
  Card,
  Link,
  Box,
  Typography,
} from "@mui/material";

import robotoff, { FilterState } from "../robotoff";
import logo from "../assets/logo.png";
import { getQuestionSearchParams } from "./QuestionFilter";

type SmallQuestionCardProps = {
  filterState: FilterState;
  imageSrc?: string;
  questionNumber?: number | null;
  questionCountLoading?: boolean;
  title?: string;
};

export default function SmallQuestionCard({
  filterState,
  imageSrc,
  questionNumber: providedQuestionNumber,
  questionCountLoading,
  title,
}: SmallQuestionCardProps) {
  const { t } = useTranslation();
  const targetUrl = `/questions?${getQuestionSearchParams(filterState)}`;

  const questionCountQuery = useQuery({
    queryKey: ["question-count", filterState],
    enabled: providedQuestionNumber === undefined,
    queryFn: async () => {
      const { data } = await robotoff.questions(
        { ...filterState, with_image: true },
        1,
        1,
      );
      return data?.count ?? 0;
    },
  });
  const questionNumber =
    providedQuestionNumber === undefined
      ? (questionCountQuery.data ?? null)
      : providedQuestionNumber;
  const isQuestionCountLoading =
    questionCountLoading ?? questionCountQuery.isLoading;

  return (
    <Card
      variant="outlined"
      sx={(theme) => ({
        width: "100%",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "none",
        transition: theme.transitions.create(["transform", "box-shadow"]),
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[2],
        },
      })}
    >
      <CardActionArea
        component={Link}
        href={targetUrl}
        sx={{ display: "block" }}
      >
        <CardMedia
          component="img"
          height="150"
          image={imageSrc || logo}
          alt={title || ""}
          sx={(theme) => ({
            objectFit: "contain",
            p: 2,
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.background.paper
                : theme.palette.secondary.light,
          })}
        />
        <Box
          sx={(theme) => ({
            display: "flex",
            flexDirection: "column",
            minHeight: 52,
            alignItems: "center",
            justifyContent: "center",
            gap: 0.25,
            px: 2,
            py: 1,
            backgroundColor: theme.palette.background.paper,
          })}
        >
          {isQuestionCountLoading || questionNumber == null ? (
            <CircularProgress size={16} sx={{ color: "text.secondary" }} />
          ) : (
            <>
              <Typography
                component="span"
                variant="h5"
                sx={{
                  color: "text.primary",
                  fontWeight: 800,
                  lineHeight: 1.1,
                }}
              >
                {questionNumber.toLocaleString()}
              </Typography>
              <Typography
                component="span"
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {t("green-score.questionCountLabel", {
                  count: questionNumber,
                })}
              </Typography>
            </>
          )}
        </Box>
      </CardActionArea>
    </Card>
  );
}
