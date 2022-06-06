import { TextField, Autocomplete, Button, MenuItem, FormControl, FormLabel, Stack, Chip, RadioGroup, FormControlLabel, Box, Radio, Divider } from "@mui/material";
import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import brands from "../../assets/brands.json";
import { countryNames, insightTypesNames, key2urlParam } from "./const";

const QuestionFilter = ({ filterState, setFilterState }) => {
  const { t } = useTranslation();
  // let [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = React.useState(false);

  // internal values
  const [innerInsightType, setInnerInsightType] = React.useState(filterState?.insightType);
  const [innerValueTag, setInnerValueTag] = React.useState(filterState?.valueTag);
  const [innerCountryFilter, setInnerCountryFilter] = React.useState(filterState?.countryFilter);
  const [innerBrandFilter, setInnerBrandFilter] = React.useState(filterState?.brandFilter);
  const [innerSortByPopularity, setInnerSortByPopularity] = React.useState(filterState?.sortByPopularity);

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
    setInnerInsightType((prevInsightType) => (prevInsightType !== filterState.insightType ? filterState.insightType : prevInsightType));
    setInnerValueTag((prevInnerValueTag) => (prevInnerValueTag !== filterState?.valueTag ? filterState?.valueTag : prevInnerValueTag));
    setInnerCountryFilter((prevInnerCountryFilter) => (prevInnerCountryFilter !== filterState?.countryFilter ? filterState?.countryFilter : prevInnerCountryFilter));
    setInnerBrandFilter((prevInnerBrandFilter) => (prevInnerBrandFilter !== filterState?.brandFilter ? filterState?.brandFilter : prevInnerBrandFilter));
    setInnerSortByPopularity((prevInnerSortByPopularity) =>
      prevInnerSortByPopularity !== filterState?.sortByPopularity ? filterState?.sortByPopularity : prevInnerSortByPopularity
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
      <Stack direction="row" flexWrap="wrap" spacing={1}>
        <TextField select size="small" value={filterState?.insightType} onChange={handleInsightTypeChange}>
          {Object.keys(insightTypesNames).map((insightType) => (
            <MenuItem key={insightType} value={insightType}>
              {t(`questions.${insightType}`)}{" "}
            </MenuItem>
          ))}
        </TextField>
        {filterState?.valueTag && (
          <Chip
            label={`${t("questions.filters.short_label.value")}: ${filterState?.valueTag}`}
            onDelete={() => {
              setFilterState((state) => ({ ...state, valueTag: undefined }));
            }}
          />
        )}
        {filterState?.countryFilter && (
          <Chip
            label={`${t("questions.filters.short_label.country")}: ${filterState?.countryFilter}`}
            onDelete={() => {
              setFilterState((state) => ({ ...state, countryFilter: undefined }));
            }}
          />
        )}
        {filterState?.brandFilter && (
          <Chip
            label={`${t("questions.filters.short_label.brand")}: ${filterState?.brandFilter}`}
            onDelete={() => {
              setFilterState((state) => ({ ...state, brandFilter: undefined }));
            }}
          />
        )}
        {filterState?.sortByPopularity && (
          <Chip
            label={`${t("questions.filters.short_label.popularity")}`}
            onDelete={() => {
              setFilterState((state) => ({ ...state, sortByPopularity: undefined }));
            }}
          />
        )}
      </Stack>

      {/* The filter form itself */}
      <Stack spacing={2} sx={{ display: isOpen ? undefined : "none" }}>
        <FormControl>
          <FormLabel id="insightType-radio-buttons">{t("questions.filters.long_label.type")}</FormLabel>
          <RadioGroup row aria-labelledby="insightType-radio-buttons" name="insightTypes" value={innerInsightType} onChange={handleInnerInsightTypeChange}>
            {Object.keys(insightTypesNames).map((insightType) => (
              <FormControlLabel key={insightType} value={insightType} control={<Radio />} label={t(`questions.${insightType}`)} labelPlacement="top" />
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
          renderInput={(params) => <TextField {...params} label={t("questions.filters.long_label.country")} />}
        />

        <Autocomplete
          id="free-solo-demo"
          freeSolo
          value={innerBrandFilter}
          onChange={(event, newValue) => setInnerBrandFilter(newValue)}
          options={brands}
          renderInput={(params) => <TextField {...params} label={t("questions.filters.long_label.brand")} placeholder={t("questions.filters.placeholders.brand")} />}
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
          <Button variant="contained" onClick={() => setIsOpen(true)} startIcon={<EditIcon />}>
            {t("questions.filters.actions.edit")}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default QuestionFilter;

//         <div class="ui field">
//           <label>{{ $t("questions.filters.long_label.value") }}</label>
//           <div class="ui icon input ">
//             <input
//               :placeholder="$t('questions.filters.placeholders.value')"
//               v-model="formValues.valueTag"
//             />
//             <i
//               @click="clearFormField('valueTag')"
//               v-if="formValues.valueTag"
//               class="times link icon"
//             ></i>
//           </div>
//         </div>

//         <div class="ui field">
//           <label>{{ $t("questions.filters.long_label.country") }}</label>
//           <select class="ui fluid dropdown" v-model="formValues.countryFilter">
//             <option value="">World</option>
//             <option
//               :value="country"
//               v-for="country in countryNames"
//               :key="country"
//               >{{ country.slice(3) }}</option
//             >
//           </select>
//         </div>

//     updateURLParams: function(params) {
//       const urlParams = {};
//       Object.keys(params).forEach((key) => {
//         const value =
//           key === "sortByPopularity"
//             ? params.sortByPopularity || ""
//             : params[key];
//         urlParams[key2urlParam[key]] = value;
//       });

//       setURLParams(urlParams);
//     },
//     validateForm: function() {
//       this.$emit("input", { ...this.formValues });
//       this.updateURLParams(this.formValues);

//       this.closeForm();
//     },
//     resetForm: function() {
//       this.formValues = { ...this.$props.value };

//       this.closeForm();
//     },
//     removeFilter: function(filterKey) {
//       this.formValues = {
//         ...this.formValues,
//         [filterKey]: filterKey === "sortByPopularity" ? false : "",
//       };
//       this.$emit("input", {
//         ...this.$props.value,
//         [filterKey]: filterKey === "sortByPopularity" ? false : "",
//       });
//     },
//     loadBrands: async function() {
//       // Load list of brand when fields is acivated
//       if (this.brands === undefined) {
//         this.brands = []; // set empty list to avoid multiple trigge of the json loading
//         const images = require.context("../../assets/", false, /\.json$/);
//         this.brands = images("./brands.json").map((x) => ({
//           text: x,
//           value: x,
//           key: x,
//         }));
//       }
//     },
//     setPopulateBrandFilter: function() {
//       this.populateBrandFilter = true;
//     },
//   },
// };
// </script>

// <style scoped>
// .root {
//   text-align: start;
// }
// .openForm {
//   width: 100%;
//   text-align: center;
// }
// </style>
