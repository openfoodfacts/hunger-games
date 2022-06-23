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

import EditIcon from "@mui/icons-material/Edit";
import { useTranslation } from "react-i18next";

import brands from "../../assets/brands.json";
import { countryNames, insightTypesNames } from "./const";

export const QuestionFilter = ({ filterState, setFilterState }) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = React.useState(false);

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

  const resetFilter = () => {
    setInnerInsightType(filterState?.insightType);
    setInnerValueTag(filterState?.valueTag);
    setInnerCountryFilter(filterState?.countryFilter);
    setInnerBrandFilter(filterState?.brandFilter);
    setInnerSortByPopularity(filterState?.sortByPopularity);
    setIsOpen(false);
  };
  const applyFilter = () => {
    setFilterState({
      insightType: innerInsightType,
      valueTag: innerValueTag,
      countryFilter: innerCountryFilter,
      brandFilter: innerBrandFilter,
      sortByPopularity: innerSortByPopularity,
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
  }, [filterState]);

  const handleInnerInsightTypeChange = (event) => {
    const newValue = event.target.value;
    setInnerInsightType(newValue);
    // setFilterState((state) => ({ ...state, insightType: newValue }));
  };
  const handleInsightTypeChange = (event) => {
    const newValue = event.target.value;
    setFilterState((state) => ({ ...state, insightType: newValue }));
  };

  return (
    <Box>
      {/* Chip indicating the current state of the filtering */}
      <Stack direction="row" spacing={1}>
        <Stack direction="row" flexWrap="wrap" spacing={1}>
          <TextField
            select
            size="small"
            value={filterState?.insightType}
            onChange={handleInsightTypeChange}
          >
            {Object.keys(insightTypesNames).map((insightType) => (
              <MenuItem key={insightType} value={insightType}>
                {t(`questions.${insightType}`)}{" "}
              </MenuItem>
            ))}
          </TextField>
          {filterState?.valueTag && (
            <Chip
              label={`${t("questions.filters.short_label.value")}: ${
                filterState?.valueTag
              }`}
              onDelete={() => {
                setFilterState((state) => ({ ...state, valueTag: "" }));
              }}
            />
          )}
          {filterState?.countryFilter && (
            <Chip
              label={`${t("questions.filters.short_label.country")}: ${
                filterState?.countryFilter
              }`}
              onDelete={() => {
                setFilterState((state) => ({ ...state, countryFilter: "" }));
              }}
            />
          )}
          {filterState?.brandFilter && (
            <Chip
              label={`${t("questions.filters.short_label.brand")}: ${
                filterState?.brandFilter
              }`}
              onDelete={() => {
                setFilterState((state) => ({ ...state, brandFilter: "" }));
              }}
            />
          )}
          {filterState?.sortByPopularity && (
            <Chip
              label={`${t("questions.filters.short_label.popularity")}`}
              onDelete={() => {
                setFilterState((state) => ({
                  ...state,
                  sortByPopularity: false,
                }));
              }}
            />
          )}
        </Stack>
      </Stack>

      {/* The filter form itself */}
      <Stack spacing={2} sx={{ display: isOpen ? undefined : "none" }}>
        <FormControl>
          <FormLabel id="insightType-radio-buttons">
            {t("questions.filters.long_label.type")}
          </FormLabel>
          <RadioGroup
            row
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
                labelPlacement="top"
              />
            ))}
          </RadioGroup>
        </FormControl>

        <TextField
          value={innerValueTag}
          onChange={(event) => {
            setInnerValueTag(event.target.value);
          }}
          label={t("questions.filters.long_label.value")}
          placeholder={t("questions.filters.placeholders.value")}
        />

        <Autocomplete
          id="free-solo-demo"
          value={innerCountryFilter}
          onChange={(event, newValue) => setInnerCountryFilter(newValue)}
          options={countryNames}
          getOptionLabel={(countryTag) => countryTag.slice(3)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("questions.filters.long_label.country")}
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
            />
          )}
        />

        <FormControlLabel
          value={innerSortByPopularity}
          onChange={(event) => setInnerSortByPopularity(event.target.checked)}
          control={<Checkbox />}
          label={t("questions.filters.long_label.popularity")}
          labelPlacement="end"
        />
      </Stack>
      {/* Form opening/validation/cancellation */}
      {isOpen ? (
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button variant="outlined" onClick={resetFilter}>
            {t("questions.filters.actions.cancel")}
          </Button>
          <Button variant="contained" onClick={applyFilter}>
            {t("questions.filters.actions.apply")}
          </Button>
        </Stack>
      ) : (
        <Box sx={{ textAlign: "center" }}>
          <Button
            variant="contained"
            onClick={() => setIsOpen(true)}
            startIcon={<EditIcon />}
            size="small"
          >
            {t("questions.filters.actions.edit")}
          </Button>
        </Box>
      )}
    </Box>
  );
};
