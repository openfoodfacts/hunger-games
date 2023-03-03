import * as React from "react";

import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import Dialog from "@mui/material/Dialog";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DialogActions, DialogContent } from "@mui/material";

import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { useFilterSearch } from "../../components/QuestionFilter/useFilterSearch";
import LabelFilter from "../../components/QuestionFilter/LabelFilter";
import brands from "../../assets/brands.json";
import {
  countryNames,
  insightTypesNames,
  campagnes,
} from "../../components/QuestionFilter/const";
import { capitaliseName } from "../../utils";
import { filterStateSelector, updateFilter } from "./store";

const getChipsParams = (filterState, setFilterState, t) =>
  [
    {
      key: "valueTag",
      display: !!filterState?.valueTag,
      label: `${t("questions.filters.short_label.value")}: ${
        filterState?.valueTag
      }`,
      onDelete: () => {
        setFilterState({ valueTag: "" });
      },
    },

    {
      key: "countryFilter",
      display: !!filterState?.countryFilter,
      label: `${t("questions.filters.short_label.country")}: ${capitaliseName(
        filterState?.countryFilter
      )}`,
      onDelete: () => {
        setFilterState({ countryFilter: "" });
      },
    },

    {
      key: "brandFilter",
      display: !!filterState?.brandFilter,
      label: `${t("questions.filters.short_label.brand")}: ${
        filterState?.brandFilter
      }`,
      onDelete: () => {
        setFilterState({ brandFilter: "" });
      },
    },
    {
      key: "sortByPopularity",
      display: !!filterState?.sortByPopularity,
      label: t("questions.filters.short_label.popularity"),
      onDelete: () => {
        setFilterState({
          sortByPopularity: false,
        });
      },
    },
    {
      key: "campaign",
      display: !!filterState?.campaign,
      label: `${t("questions.filters.short_label.campaign")}: ${
        filterState?.campaign
      }`,
      onDelete: () => {
        setFilterState((state) => ({
          ...state,
          campaign: "",
        }));
      },
    },
  ].filter((item) => item.display);

export const QuestionFilter = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [isOpen, setIsOpen] = React.useState(false);

  const dispatch = useDispatch();
  const filterState = useSelector(filterStateSelector);

  const [exposedParameters, setSearchParams, isFavorite, toggleFavorite] =
    useFilterSearch();

  if (
    Object.keys(exposedParameters).some(
      (key) => exposedParameters[key] !== filterState[key]
    )
  ) {
    dispatch(updateFilter(exposedParameters));
  }

  const updateSearchParams = (newParams) => {
    setSearchParams(newParams);
    dispatch(updateFilter(newParams));
  };
  // internal values
  const [innerInsightType, setInnerInsightType] = React.useState(
    filterState?.insightType
  );
  const [innerValueTag, setInnerValueTag] = React.useState(
    filterState?.valueTag
  );
  const [innerCountryFilter, setInnerCountryFilter] = React.useState(
    filterState?.countryFilter
  );
  const [innerBrandFilter, setInnerBrandFilter] = React.useState(
    filterState?.brandFilter
  );
  const [innerSortByPopularity, setInnerSortByPopularity] = React.useState(
    filterState?.sortByPopularity
  );
  const [innerCampaign, setInnerCampaign] = React.useState(
    filterState?.campaign
  );

  const resetFilter = () => {
    setInnerInsightType(filterState?.insightType);
    setInnerValueTag(filterState?.valueTag);
    setInnerCountryFilter(filterState?.countryFilter);
    setInnerBrandFilter(filterState?.brandFilter);
    setInnerSortByPopularity(filterState?.sortByPopularity);
    setInnerCampaign(filterState?.campaign);
    setIsOpen(false);
  };

  const applyFilter = () => {
    updateSearchParams({
      insightType: innerInsightType,
      valueTag: innerValueTag,
      countryFilter: innerCountryFilter,
      brandFilter: innerBrandFilter,
      sortByPopularity: innerSortByPopularity,
      campaign: innerCampaign,
    });

    setIsOpen(false);
  };

  React.useEffect(() => {
    // Update internal filter state if `filterState` get updated
    setInnerInsightType((prevInsightType) =>
      prevInsightType !== filterState.insightType
        ? filterState.insightType
        : prevInsightType
    );
    setInnerValueTag((prevInnerValueTag) =>
      prevInnerValueTag !== filterState?.valueTag
        ? filterState?.valueTag
        : prevInnerValueTag
    );
    setInnerCountryFilter((prevInnerCountryFilter) =>
      prevInnerCountryFilter !== filterState?.countryFilter
        ? filterState?.countryFilter
        : prevInnerCountryFilter
    );
    setInnerBrandFilter((prevInnerBrandFilter) =>
      prevInnerBrandFilter !== filterState?.brandFilter
        ? filterState?.brandFilter
        : prevInnerBrandFilter
    );
    setInnerSortByPopularity((prevInnerSortByPopularity) =>
      prevInnerSortByPopularity !== filterState?.sortByPopularity
        ? filterState?.sortByPopularity
        : prevInnerSortByPopularity
    );
    setInnerCampaign((prevInnerInnerCampaign) =>
      prevInnerInnerCampaign !== filterState?.campaign
        ? filterState?.campaign
        : prevInnerInnerCampaign
    );
  }, [filterState]);

  const handleInnerInsightTypeChange = (event) => {
    const newValue = event.target.value;
    setInnerInsightType(newValue);
    // setFilterState((state) => ({ ...state, insightType: newValue }));
  };

  const handleInsightTypeChange = (event) => {
    const newValue = event.target.value;
    updateSearchParams({ insightType: newValue });
  };

  const chipsParams = getChipsParams(
    filterState,
    (newFilterState) => updateSearchParams(newFilterState),
    t
  );

  return (
    <Box>
      {/* Chip indicating the current state of the filtering */}
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          select
          size="small"
          sx={{
            width: {
              xs: "130px",
              md: "auto",
            },
          }}
          value={filterState?.insightType}
          onChange={handleInsightTypeChange}
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
            chipsParams.map(({ key, display, label, onDelete }) => (
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

      {/* The filter form itself */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { p: 2 },
        }}
      >
        <DialogContent>
          <Stack spacing={2} sx={{ display: isOpen ? undefined : "none" }}>
            <FormControl>
              <FormLabel id="insightType-radio-buttons">
                {t("questions.filters.long_label.type")}
              </FormLabel>
              <RadioGroup
                row={isDesktop}
                aria-labelledby="insightType-radio-buttons"
                name="insightTypes"
                value={innerInsightType}
                onChange={handleInnerInsightTypeChange}
              >
                {Object.keys(insightTypesNames).map((insightType) => (
                  <FormControlLabel
                    key={insightType}
                    value={insightType}
                    control={<Radio />}
                    label={t(`questions.${insightType}`)}
                    labelPlacement={isDesktop ? "top" : "end"}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {["category", "label"].includes(innerInsightType) ? (
              <LabelFilter
                value={innerValueTag}
                onChange={setInnerValueTag}
                insightType={innerInsightType}
                label={t("questions.filters.long_label.value")}
                placeholder={t("questions.filters.placeholders.value")}
                size="small"
              />
            ) : (
              <TextField
                value={innerValueTag}
                onChange={(event) => {
                  setInnerValueTag(event.target.value);
                }}
                label={t("questions.filters.long_label.value")}
                placeholder={t("questions.filters.placeholders.value")}
                size="small"
              />
            )}

            <Autocomplete
              id="free-solo-demo"
              value={innerCountryFilter}
              onChange={(event, newValue) => setInnerCountryFilter(newValue)}
              options={countryNames}
              getOptionLabel={(countryTag) => capitaliseName(countryTag)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("questions.filters.long_label.country")}
                  size="small"
                />
              )}
            />

            <Autocomplete
              id="free-solo-demo"
              freeSolo
              value={innerBrandFilter}
              onChange={(event, newValue) => setInnerBrandFilter(newValue)}
              options={brands}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("questions.filters.long_label.brand")}
                  placeholder={t("questions.filters.placeholders.brand")}
                  size="small"
                />
              )}
            />

            <TextField
              select
              value={innerCampaign}
              onChange={(event) => {
                setInnerCampaign(event.target.value);
              }}
              label={t("questions.filters.long_label.campaign")}
              placeholder={t("questions.filters.placeholders.campaign")}
              size="small"
            >
              {campagnes.map((val) => (
                <MenuItem key={val} value={val}>
                  {val}
                </MenuItem>
              ))}
            </TextField>

            <FormControlLabel
              value={innerSortByPopularity}
              onChange={(event) =>
                setInnerSortByPopularity(event.target.checked)
              }
              control={<Checkbox />}
              label={t("questions.filters.long_label.popularity")}
              labelPlacement="end"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button variant="outlined" onClick={resetFilter}>
              {t("questions.filters.actions.cancel")}
            </Button>
            <Button variant="contained" onClick={applyFilter}>
              {t("questions.filters.actions.apply")}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

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
