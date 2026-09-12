import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import robotoff from "../robotoff";
import { localFavorites } from "../localeStorageManager";
import logo from "../assets/logo.png";
import { getQuestionSearchParams } from "./QuestionFilter";
import { Link as RouterLink } from "react-router";

type FilterState = {
  insightType?: string;
  valueTag?: string;
  countryFilter?: string;
  brandFilter?: string;
  sortByPopularity?: boolean;
  campaign?: string;
};

const useQuestionCount = (filterState: FilterState) =>
  useQuery({
    queryKey: ["questionCount", filterState],
    queryFn: async () => {
      const { data } = await robotoff.questions(
        { ...filterState, with_image: true },
        1,
        1,
      );
      return data?.count ?? 0;
    },
  });

type EditableCardTitleProps = {
  title: string;
  editable: boolean;
  onSave: (newTitle: string) => void;
};

function EditableCardTitle({
  title,
  editable,
  onSave,
}: EditableCardTitleProps) {
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [titleDraft, setTitleDraft] = React.useState({ source: title, title });
  const innerTitle = titleDraft.source === title ? titleDraft.title : title;
  const setInnerTitle = (newTitle: string) =>
    setTitleDraft({ source: title, title: newTitle });

  const handleStartEdit: React.MouseEventHandler = (event) => {
    event.preventDefault();
    setIsEditMode(true);
  };

  const handleSave = (event?: React.SyntheticEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    onSave(innerTitle);
    setIsEditMode(false);
  };

  const handleCancel = (event?: React.SyntheticEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    setInnerTitle(title);
    setIsEditMode(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      handleSave();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      handleCancel();
    }
  };

  if (isEditMode) {
    return (
      <Stack
        spacing={1}
        direction="row"
        sx={{
          alignItems: "center",
        }}
      >
        <TextField
          variant="standard"
          value={innerTitle}
          fullWidth
          onChange={(event) => setInnerTitle(event.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <IconButton onClick={handleSave} size="small">
          <DoneIcon />
        </IconButton>
        <IconButton onClick={handleCancel} size="small">
          <ClearIcon />
        </IconButton>
      </Stack>
    );
  }

  return (
    <Stack
      spacing={1}
      direction="row"
      sx={{
        alignItems: "center",
      }}
    >
      <Typography>{innerTitle}</Typography>
      {editable && (
        <IconButton onClick={handleStartEdit} size="small">
          <EditIcon />
        </IconButton>
      )}
    </Stack>
  );
}

type FilterSummaryChipsProps = {
  filterState: FilterState;
};

function FilterSummaryChips({ filterState }: FilterSummaryChipsProps) {
  const { t } = useTranslation();

  const filters = [
    {
      condition: filterState.insightType,
      label: `${t("questions.filters.short_label.value")}: ${filterState.insightType}`,
    },
    {
      condition: filterState.valueTag,
      label: `${t("questions.filters.short_label.value")}: ${filterState.valueTag}`,
    },
    {
      condition: filterState.countryFilter,
      label: `${t("questions.filters.short_label.country")}: ${filterState.countryFilter}`,
    },
    {
      condition: filterState.brandFilter,
      label: `${t("questions.filters.short_label.brand")}: ${filterState.brandFilter}`,
    },
    {
      condition: filterState.sortByPopularity,
      label: t("questions.filters.short_label.popularity"),
    },
    {
      condition: filterState.campaign,
      label: `${t("questions.filters.short_label.campaign")}: ${filterState.campaign}`,
    },
  ];

  const activeFilters = filters.filter((filter) => filter.condition);

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        mt: 1,
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        "& .MuiChip-root": { mr: 1, mt: 0.5 },
      }}
    >
      {activeFilters.map((filter, index) => (
        <Chip key={index} size="small" label={filter.label} />
      ))}
    </Box>
  );
}

type QuestionCountBadgeProps = {
  count: number | null;
  children: React.ReactNode;
};

function QuestionCountBadge({ count, children }: QuestionCountBadgeProps) {
  const getBadgeColor = () => {
    if (count === null) return "info";
    return count > 0 ? "error" : "success";
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
      badgeContent={count ?? "?"}
      showZero
      color={getBadgeColor()}
    >
      {children}
    </Badge>
  );
}

type QuestionCardProps = {
  filterState: FilterState;
  imageSrc?: string;
  title: string;
  showFilterResume?: boolean;
  editableTitle?: boolean;
  compact?: boolean;
  onDelete?: () => void;
};

const getQuestionCountColor = (
  count: number | null,
): "info" | "error" | "success" => {
  if (count === null) return "info";
  return count > 0 ? "error" : "success";
};

const getQuestionCountLabel = (
  count: number | null,
  t: ReturnType<typeof useTranslation>["t"],
) => {
  if (count === null) {
    return t("home.saved_filters_pending_unknown");
  }

  return t("home.saved_filters_pending", {
    count: count > 99 ? "99+" : count,
  });
};

export default function QuestionCard({
  filterState,
  imageSrc,
  title,
  showFilterResume = false,
  editableTitle = false,
  compact = false,
  onDelete,
}: QuestionCardProps) {
  const { t } = useTranslation();
  const { data: questionCount } = useQuestionCount(filterState);
  const targetUrl = `/questions?${getQuestionSearchParams(filterState)}`;

  const handleTitleSave = (newTitle: string) => {
    localFavorites.addQuestion(filterState, imageSrc ?? "", newTitle);
  };

  if (compact) {
    return (
      <Card
        sx={(theme) => ({
          width: "100%",
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: "none",
        })}
      >
        <Box sx={{ display: "flex", alignItems: "stretch" }}>
          <CardActionArea
            component={RouterLink as React.ElementType}
            to={targetUrl}
            sx={{ height: "100%", minWidth: 0, flex: 1 }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 1, sm: 2 }}
                sx={{ alignItems: { xs: "stretch", sm: "center" } }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <EditableCardTitle
                    title={title}
                    editable={editableTitle}
                    onSave={handleTitleSave}
                  />
                  {showFilterResume && (
                    <FilterSummaryChips filterState={filterState} />
                  )}
                </Box>
                <Chip
                  label={getQuestionCountLabel(questionCount ?? null, t)}
                  color={getQuestionCountColor(questionCount ?? null)}
                  size="small"
                  sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                />
                <ChevronRightRoundedIcon
                  sx={{
                    display: { xs: "none", sm: "block" },
                    color: "action.active",
                  }}
                  aria-hidden
                />
              </Stack>
            </CardContent>
          </CardActionArea>
          {onDelete && (
            <IconButton
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onDelete();
              }}
              aria-label={t("home.saved_filters_delete")}
              title={t("home.saved_filters_delete")}
              sx={{
                m: 1,
                alignSelf: { xs: "flex-start", sm: "center" },
              }}
            >
              <DeleteOutlineRoundedIcon />
            </IconButton>
          )}
        </Box>
      </Card>
    );
  }

  return (
    <QuestionCountBadge count={questionCount ?? null}>
      <Card sx={{ minWidth: 200, maxWidth: 350 }}>
        <CardContent>
          <EditableCardTitle
            title={title}
            editable={editableTitle}
            onSave={handleTitleSave}
          />
        </CardContent>
        <CardActionArea
          component={RouterLink as React.ElementType}
          to={targetUrl}
        >
          <CardMedia
            component="img"
            height="200"
            image={imageSrc || logo}
            alt=""
            sx={{ objectFit: "contain" }}
          />
          <CardContent>
            {showFilterResume && (
              <FilterSummaryChips filterState={filterState} />
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    </QuestionCountBadge>
  );
}
