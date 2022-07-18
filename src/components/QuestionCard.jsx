import * as React from "react";

import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";

import robotoff from "../robotoff";
import { reformatValueTag } from "../utils";
import { getQuestionSearchParams } from "./QuestionFilter";
import { useTranslation } from "react-i18next";

const QuestionCard = (props) => {
  const { filterState, imageSrc, title, showFilterResume } = props;
  const {
    sortByPopularity,
    insightType,
    valueTag,
    brandFilter,
    countryFilter,
  } = filterState;

  const { t } = useTranslation();

  const targetUrl = `/questions?${getQuestionSearchParams(filterState)}`;

  const [questionNumber, setQuestionNumber] = React.useState("?");

  React.useEffect(() => {
    let isValid = true;
    robotoff
      .questions(
        sortByPopularity ? "popular" : "random",
        insightType,
        valueTag,
        reformatValueTag(brandFilter),
        countryFilter !== "en:world" ? countryFilter : null,
        1,
        1
      )
      .then(({ data }) => {
        if (isValid) {
          setQuestionNumber(data?.count ?? 0);
        }
      });
    return () => {
      isValid = false;
    };
  }, [sortByPopularity, insightType, valueTag, brandFilter, countryFilter]);

  return (
    <Badge
      sx={{
        "& .MuiBadge-badge": {
          fontSize: "1.5rem",
          minWidth: "2rem",
          minHeight: "2rem",
        },
      }}
      badgeContent={questionNumber}
      showZero
      color={
        questionNumber === "?"
          ? "info"
          : questionNumber > 0
          ? "error"
          : "success"
      }
    >
      <Card sx={{ width: 350, height: 300 }}>
        <CardActionArea
          component={Link}
          disabled={!questionNumber}
          href={targetUrl}
        >
          <CardMedia
            component="img"
            height="250"
            image={imageSrc}
            alt=""
            sx={{ objectFit: "contain" }}
          />
          <CardContent>
            {showFilterResume && (
              <Stack direction="row" flexWrap="wrap">
                {filterState?.insightType && (
                  <Chip
                    size="small"
                    label={`${t("questions.filters.short_label.value")}: ${
                      filterState?.insightType
                    }`}
                  />
                )}
                {filterState?.valueTag && (
                  <Chip
                    size="small"
                    label={`${t("questions.filters.short_label.value")}: ${
                      filterState?.valueTag
                    }`}
                  />
                )}
                {filterState?.countryFilter && (
                  <Chip
                    size="small"
                    label={`${t("questions.filters.short_label.country")}: ${
                      filterState?.countryFilter
                    }`}
                  />
                )}
                {filterState?.brandFilter && (
                  <Chip
                    size="small"
                    label={`${t("questions.filters.short_label.brand")}: ${
                      filterState?.brandFilter
                    }`}
                  />
                )}
                {filterState?.sortByPopularity && (
                  <Chip
                    size="small"
                    label={`${t("questions.filters.short_label.popularity")}`}
                  />
                )}
              </Stack>
            )}
            <Typography gutterBottom variant="h5" component="div">
              {title}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Badge>
  );
};

export default QuestionCard;
