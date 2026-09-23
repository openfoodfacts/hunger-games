import * as React from "react";
import { useTranslation } from "react-i18next";

import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import CardMedia from "@mui/material/CardMedia";
import Badge from "@mui/material/Badge";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import { default as MuiLink } from "@mui/material/Link";
import { Link } from "react-router";

import robotoff from "../../robotoff";
import { getQuestionSearchParams } from "../../components/QuestionFilter";
import { LogoDefinition } from "./dashboardDefinition";

type QuestionNumber = "loading" | "error" | number;

const DashboardCardSkeleton = () => (
  <Card
    variant="outlined"
    sx={{
      width: "100%",
      height: "100%",
      borderRadius: 3,
      overflow: "hidden",
    }}
  >
    <Skeleton variant="rectangular" height={170} animation="wave" />
    <CardContent sx={{ p: 2.25 }}>
      <Skeleton variant="text" width="62%" height={34} />
      <Skeleton variant="text" width="92%" />
      <Skeleton variant="text" width="76%" />
    </CardContent>
    <CardActions sx={{ px: 2.25, pb: 2.25, pt: 0, gap: 1 }}>
      <Skeleton variant="rounded" width={92} height={32} />
      <Skeleton variant="rounded" width={76} height={32} />
    </CardActions>
  </Card>
);

const DashboardCard = React.memo(function DashboardCard(props: LogoDefinition) {
  const { t } = useTranslation();
  const { tag, label, logo, message, link, type } = props;

  const questionsUrl = `/questions?${getQuestionSearchParams({
    // insightType: "label",
    insightType: type,
    valueTag: tag,
  })}`;
  // const logoQuestionsUrl = `/logoQuestion/${tag}`;

  const logoAnnotationUrl = `/logos/deep-search?type=${type}&value=${tag}`;

  const [questionNumber, setQuestionNumber] =
    React.useState<QuestionNumber>("loading");

  React.useEffect(() => {
    let isValid = true;
    robotoff
      .questions(
        {
          insightType: "label",
          valueTag: tag,
        },
        1,
        1,
      )
      .then(({ data }) => {
        if (isValid) {
          setQuestionNumber(data?.count ?? 0);
        }
      })
      .catch(() => {
        if (isValid) {
          setQuestionNumber("error");
        }
      });
    return () => {
      isValid = false;
    };
  }, [tag]);

  return (
    <Box sx={{ minWidth: 0, height: "100%" }}>
      <Badge
        overlap="rectangular"
        sx={{
          width: "100%",
          height: "100%",
          "& .MuiBadge-badge": {
            borderRadius: 1.5,
            fontSize: "0.8rem",
            fontWeight: 700,
            height: 28,
            minWidth: 34,
            right: 12,
            top: 12,
            transform: "none",
          },
        }}
        badgeContent={typeof questionNumber === "number" ? questionNumber : "?"}
        showZero
        color={
          typeof questionNumber !== "number"
            ? "info"
            : questionNumber > 0
              ? "error"
              : "success"
        }
      >
        {questionNumber === "loading" ? (
          <DashboardCardSkeleton />
        ) : (
          <Card
            variant="outlined"
            sx={(theme) => ({
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: 3,
              overflow: "hidden",
              borderColor: theme.palette.divider,
              boxShadow: "none",
              transition: theme.transitions.create(["transform", "box-shadow"]),
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: theme.shadows[2],
              },
            })}
          >
            <CardMedia
              component="img"
              height="170"
              image={logo}
              alt=""
              sx={(theme) => ({
                objectFit: "contain",
                p: 2,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? theme.palette.common.white
                    : theme.palette.secondary.light,
                borderBottom: `1px solid ${theme.palette.divider}`,
              })}
            />
            <CardContent sx={{ flexGrow: 1, p: 2.25 }}>
              <Typography
                gutterBottom
                variant="h6"
                component="h2"
                sx={{ fontWeight: 700 }}
              >
                {label}
              </Typography>
              {(message || link) && (
                <Typography variant="body2" color="text.secondary">
                  {message}
                  {message && link ? " " : ""}
                  {link && (
                    <MuiLink href={link} target="_blank" rel="noreferrer">
                      {t("logos.dashboard.more_info")}
                    </MuiLink>
                  )}
                </Typography>
              )}
            </CardContent>
            <CardActions
              sx={{ px: 2.25, pb: 2.25, pt: 0, gap: 1, flexWrap: "wrap" }}
            >
              <Button
                variant="contained"
                size="small"
                component={Link as React.ElementType}
                to={questionsUrl}
              >
                {t("logos.dashboard.questions")}
              </Button>

              {/* <Button
              variant="outlined"
              size="small"
              component={Link as React.ElementType}
              to={logoQuestionsUrl}
            >
              Annotation
            </Button> */}

              <Button
                variant="outlined"
                size="small"
                component={Link as React.ElementType}
                to={logoAnnotationUrl}
              >
                {t("logos.dashboard.search")}
              </Button>
            </CardActions>
          </Card>
        )}
      </Badge>
    </Box>
  );
});

export default DashboardCard;
