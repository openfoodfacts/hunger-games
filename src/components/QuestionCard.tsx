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
import TextField from "@mui/material/TextField";
import { Box, IconButton } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";

import robotoff from "../robotoff";
import { localFavorites } from "../localeStorageManager";
import logo from "../assets/logo.png";
import { getQuestionSearchParams } from "./QuestionFilter";
import { useTranslation } from "react-i18next";

type QuestionCardProps = {
  filterState: any;
  imageSrc: any;
  title: any;
  showFilterResume: any;
  editableTitle: any;
};

const QuestionCard = ({
  filterState,
  imageSrc,
  title,
  showFilterResume,
  editableTitle,
}: QuestionCardProps) => {
  const { t } = useTranslation();

  const targetUrl = `/questions?${getQuestionSearchParams(filterState)}`;

  const [questionNumber, setQuestionNumber] = React.useState("?");

  React.useEffect(() => {
    let isValid = true;
    robotoff
      .questions({ ...filterState, with_image: true }, 1, 1)
      .then(({ data }) => {
        if (isValid) {
          setQuestionNumber(data?.count ?? 0);
        }
      });
    return () => {
      isValid = false;
    };
  }, [filterState]);

  const [isEditMode, setIsEditMode] = React.useState(false);
  const [innerTitle, setInnerTitle] = React.useState(title);
  React.useEffect(() => {
    setInnerTitle(title);
  }, [title]);

  const startEdition = () => {
    setIsEditMode(true);
  };
  const validateEdition = () => {
    localFavorites.addQuestion(filterState, imageSrc, innerTitle);

    setIsEditMode(false);
  };
  const stopEdition = () => {
    setInnerTitle(title);
    setIsEditMode(false);
  };
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
      <Card sx={{ minWidth: 200, maxWidth: 350 }}>
        <CardContent>
          <Stack spacing={1} direction="row" alignItems="center">
            {isEditMode ? (
              <>
                <TextField
                  variant="standard"
                  value={innerTitle}
                  fullWidth
                  onChange={(event) => {
                    setInnerTitle(event.target.value);
                  }}
                  onKeyDown={(event) => {
                    switch (event.key) {
                      case "Enter":
                        validateEdition();
                        break;
                      case "Escape":
                        stopEdition();
                        break;
                      default:
                        break;
                    }
                  }}
                  autoFocus
                />
                <IconButton onClick={validateEdition}>
                  <DoneIcon />
                </IconButton>
                <IconButton onClick={stopEdition}>
                  <ClearIcon />
                </IconButton>
              </>
            ) : (
              <>
                <Typography>{innerTitle}</Typography>
                {editableTitle && (
                  <IconButton
                    onClick={(event) => {
                      startEdition();
                      event.stopPropagation();
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                )}
              </>
            )}
          </Stack>
        </CardContent>
        <CardActionArea component={Link} href={targetUrl}>
          <CardMedia
            component="img"
            height="200"
            image={imageSrc || logo}
            alt=""
            sx={{ objectFit: "contain" }}
          />
          <CardContent>
            {showFilterResume && (
              <Box
                spacing={1}
                sx={{
                  mt: 1,
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "flex-start",
                  "& .MuiChip-root": { mr: 1, mt: 0.5 },
                }}
              >
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
                {filterState?.campaign && (
                  <Chip
                    size="small"
                    label={`${t("questions.filters.short_label.campaign")}: ${
                      filterState?.campaign
                    }`}
                  />
                )}
              </Box>
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    </Badge>
  );
};

export default QuestionCard;
