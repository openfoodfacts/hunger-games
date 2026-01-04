import { MouseEventHandler, useEffect, useState } from "react";
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
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";

import robotoff from "../robotoff";
import { localFavorites } from "../localeStorageManager";
import logo from "../assets/logo.png";
import { getQuestionSearchParams } from "./QuestionFilter";
import { useTranslation } from "react-i18next";

type FilterState = {
  insightType?: string;
  valueTag?: string;
  countryFilter?: string;
  brandFilter?: string;
  sortByPopularity?: boolean;
  campaign?: string;
};

const useQuestionCount = (filterState: FilterState) => {
  const [questionCount, setQuestionCount] = useState<number | null>(null);

  useEffect(() => {
    let isValid = true;

    robotoff
      .questions({ ...filterState, with_image: true }, 1, 1)
      .then(({ data }) => {
        if (isValid) {
          setQuestionCount(data?.count ?? 0);
        }
      })
      .catch(() => {
        if (isValid) {
          setQuestionCount(null);
        }
      });

    return () => {
      isValid = false;
    };
  }, [filterState]);

  return questionCount;
};

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [innerTitle, setInnerTitle] = useState(title);

  useEffect(() => {
    setInnerTitle(title);
  }, [title]);

  const handleStartEdit: MouseEventHandler = (event) => {
    event.stopPropagation();
    setIsEditMode(true);
  };

  const handleSave = () => {
    onSave(innerTitle);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setInnerTitle(title);
    setIsEditMode(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSave();
    } else if (event.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditMode) {
    return (
      <Stack spacing={1} direction="row" alignItems="center">
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
    <Stack spacing={1} direction="row" alignItems="center">
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
};

export default function QuestionCard({
  filterState,
  imageSrc,
  title,
  showFilterResume = false,
  editableTitle = false,
}: QuestionCardProps) {
  const questionCount = useQuestionCount(filterState);
  const targetUrl = `/questions?${getQuestionSearchParams(filterState)}`;

  const handleTitleSave = (newTitle: string) => {
    localFavorites.addQuestion(filterState, imageSrc, newTitle);
  };

  return (
    <QuestionCountBadge count={questionCount}>
      <Card sx={{ minWidth: 200, maxWidth: 350 }}>
        <CardContent>
          <EditableCardTitle
            title={title}
            editable={editableTitle}
            onSave={handleTitleSave}
          />
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
              <FilterSummaryChips filterState={filterState} />
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    </QuestionCountBadge>
  );
}
