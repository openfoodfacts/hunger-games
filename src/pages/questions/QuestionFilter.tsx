import * as React from "react";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import IconButton from "@mui/material/IconButton";

import EditIcon from "@mui/icons-material/Edit";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

import { useTranslation } from "react-i18next";
import { TFunction } from "i18next/typescript/t";

import { SetURLSearchParams, useSearchParams } from "react-router";

import { useFavorite } from "../../components/QuestionFilter/useFavorite";
import { insightTypesNames } from "../../components/QuestionFilter/const";
import { capitaliseName } from "../../utils";
import FilterDialog from "./FilterDialog";
import {
  FilterParams,
  getFilterParams,
} from "../../hooks/useFilterState/getFilterParams";

const getChipsParams = (
  filterState: FilterParams,
  setSearchParams: SetURLSearchParams,
  t: TFunction<"translation", undefined>,
) =>
  [
    {
      key: "valueTag",
      display: !!filterState.valueTag,
      label: `${t(
        "questions.filters.short_label.value",
      )}: ${filterState?.valueTag}`,
      onDelete: () => {
        setSearchParams((prev) => {
          prev.delete("value_tag");
          return prev;
        });
      },
    },

    {
      key: "countryFilter",
      display: !!filterState.country,
      label: `${t("questions.filters.short_label.country")}: ${capitaliseName(
        filterState.country,
      )}`,
      onDelete: () => {
        setSearchParams((prev) => {
          prev.delete("country");
          return prev;
        });
      },
    },

    {
      key: "brandFilter",
      display: !!filterState.brand,
      label: `${t(
        "questions.filters.short_label.brand",
      )}: ${filterState.brand}`,
      onDelete: () => {
        setSearchParams((prev) => {
          prev.delete("brand");
          return prev;
        });
      },
    },
    {
      key: "sortByPopularity",
      display: !!filterState.sorted && filterState.sorted !== "false",
      label: t("questions.filters.short_label.popularity"),
      onDelete: () => {
        setSearchParams((prev) => {
          prev.set("sorted", "false");
          return prev;
        });
      },
    },
    {
      key: "campaign",
      display: !!filterState.campaign,
      label: `${t(
        "questions.filters.short_label.campaign",
      )}: ${filterState.campaign}`,
      onDelete: () => {
        setSearchParams((prev) => {
          prev.delete("campaign");
          return prev;
        });
      },
    },
  ].filter((item) => item.display);

export const QuestionFilter = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [isOpen, setIsOpen] = React.useState(false);

  // Get filter state from search params
  const [searchParams, setSearchParams] = useSearchParams();
  const filterState = React.useMemo(
    () => getFilterParams(searchParams),
    [searchParams],
  );

  const [isFavorite, toggleFavorite] = useFavorite(filterState);
  const chipsParams = React.useMemo(
    () => getChipsParams(filterState, setSearchParams, t),
    [filterState, setSearchParams, t],
  );

  return (
    <Box>
      {/* Chip indicating the current state of the filtering */}
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          select
          size="small"
          sx={{ width: { xs: "130px", md: 150 } }}
          value={filterState.insightType}
          onChange={(event) =>
            setSearchParams((prev) => {
              prev.set("type", event.target.value);
              return prev;
            })
          }
          label={t(`questions.insightTypeLabel`)}
        >
          {Object.keys(insightTypesNames).map((insightType) => (
            <MenuItem key={insightType} value={insightType}>
              {t(`questions.${insightType}`)}{" "}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ overflow: "hidden" }}>
          {isDesktop ? (
            chipsParams.map(({ key, label, onDelete }) => (
              <Chip key={key} label={label} onDelete={onDelete} />
            ))
          ) : (
            <Chip
              label={t("questions.filters.active_filter_number", {
                count: chipsParams.length,
              })}
            />
          )}
        </Box>

        <IconButton
          onClick={() => {
            toggleFavorite();
          }}
          color="primary"
        >
          {isFavorite ? <StarIcon /> : <StarBorderIcon />}
        </IconButton>
        <IconButton
          onClick={() => setIsOpen(true)}
          color="primary"
          sx={{ display: { xs: "inherit", md: "none" } }}
        >
          <EditIcon />
        </IconButton>
      </Stack>

      <FilterDialog open={isOpen} onClose={() => setIsOpen(false)} />

      {/* Edit filter on desktop only */}
      <Box sx={{ textAlign: "center", display: { xs: "none", md: "inherit" } }}>
        <Button
          variant="contained"
          onClick={() => setIsOpen(true)}
          startIcon={<EditIcon />}
          size="small"
        >
          {t("questions.filters.actions.edit")}
        </Button>
      </Box>
    </Box>
  );
};
