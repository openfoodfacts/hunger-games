import * as React from "react";

import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Stack from "@mui/material/Stack";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Dialog from "@mui/material/Dialog";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DialogActions, DialogContent } from "@mui/material";

import { useTranslation } from "react-i18next";

import LabelFilter from "../../components/QuestionFilter/LabelFilter";
import countries from "../../assets/countries.json";
import {
  insightTypesNames,
  campagnes,
} from "../../components/QuestionFilter/const";
import { useFilterState } from "../../hooks/useFilterState";
import { BrandFilter } from "../../components/QuestionFilter/BrandFilter";

interface CountryObject {
  id: string;
  label: string;
  languageCode: string;
  countryCode: string;
}

function getCountryObject(
  countryCode: string | null | undefined,
): CountryObject | null {
  if (!countryCode) {
    return null;
  }
  return (
    countries.find((country) => country.countryCode === countryCode) ?? null
  );
}

interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function FilterDialog(props: FilterDialogProps) {
  const { open, onClose } = props;

  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [globalValues, setGlobalValue] = useFilterState();

  // Form state
  const [innerInsightType, setInnerInsightType] = React.useState(
    globalValues.insightType,
  );
  const [innerValueTag, setInnerValueTag] = React.useState(
    globalValues.valueTag,
  );
  const [innerCountryObject, setInnerCountryObject] =
    React.useState<CountryObject | null>(
      getCountryObject(globalValues.country),
    );
  const [innerBrandFilter, setInnerBrandFilter] = React.useState(
    globalValues.brand,
  );
  const [innerCampaign, setInnerCampaign] = React.useState(
    globalValues.campaign,
  );
  const [innerSortByPopularity, setInnerSortByPopularity] = React.useState(
    globalValues.sorted,
  );
  const [innerPredictor, setInnerPredictor] = React.useState(
    globalValues.predictor,
  );

  const resetFilter = React.useCallback(() => {
    setInnerInsightType(globalValues.insightType);
    setInnerValueTag(globalValues.valueTag);
    setInnerCountryObject(getCountryObject(globalValues.country));
    setInnerBrandFilter(globalValues.brand);
    setInnerCampaign(globalValues.campaign);
    setInnerSortByPopularity(globalValues.sorted);
    setInnerPredictor(globalValues.predictor);
  }, [globalValues]);

  const applyFilter = React.useCallback(() => {
    setGlobalValue({
      insightType: innerInsightType,
      valueTag: innerValueTag,
      country: innerCountryObject?.countryCode,
      brand: innerBrandFilter,
      campaign: innerCampaign,
      sorted: innerSortByPopularity,
      predictor: innerPredictor,
    });
    onClose();
  }, [
    setGlobalValue,
    innerInsightType,
    innerValueTag,
    innerCountryObject?.countryCode,
    innerBrandFilter,
    innerCampaign,
    innerSortByPopularity,
    innerPredictor,
    onClose,
  ]);

  React.useEffect(resetFilter, [resetFilter]);

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { p: 2 } }}>
      <DialogContent>
        <Stack spacing={2} sx={{ display: open ? undefined : "none" }}>
          <FormControl>
            <FormLabel id="insightType-radio-buttons">
              {t("questions.filters.long_label.type")}
            </FormLabel>
            <RadioGroup
              row={isDesktop}
              aria-labelledby="insightType-radio-buttons"
              name="insightTypes"
              value={innerInsightType}
              onChange={(event) => {
                if (event.target.value === innerInsightType) {
                  return;
                }
                setInnerInsightType(event.target.value);
                setInnerValueTag(""); // Reset value since the type changed
              }}
            >
              {Object.keys(insightTypesNames).map((insightTypeValue) => (
                <FormControlLabel
                  key={insightTypeValue}
                  value={insightTypeValue}
                  control={<Radio />}
                  label={t(`questions.${insightTypeValue}`)}
                  labelPlacement={isDesktop ? "top" : "end"}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {innerInsightType &&
          ["category", "label"].includes(innerInsightType) ? (
            <LabelFilter
              value={innerValueTag}
              valueTag
              onChange={(newVal: string) => setInnerValueTag(newVal)}
              insightType={innerInsightType}
              label={t("questions.filters.long_label.value")}
              placeholder={t("questions.filters.placeholders.value")}
              size="small"
            />
          ) : innerInsightType === "brand" ? (
            <BrandFilter value={innerValueTag} onChange={setInnerValueTag} />
          ) : (
            <TextField
              value={innerValueTag}
              onChange={(event) => setInnerValueTag(event.target.value)}
              label={t("questions.filters.long_label.value")}
              placeholder={t("questions.filters.placeholders.value")}
              size="small"
            />
          )}
          <Autocomplete
            value={innerCountryObject}
            onChange={(event, newValue) => setInnerCountryObject(newValue)}
            options={countries}
            getOptionLabel={(country) => country.label}
            isOptionEqualToValue={(country, value) => country.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("questions.filters.long_label.country")}
                size="small"
              />
            )}
          />

          <BrandFilter
            value={innerBrandFilter}
            onChange={setInnerBrandFilter}
          />

          <TextField
            select
            value={innerCampaign}
            onChange={(event) => setInnerCampaign(event.target.value)}
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

          <TextField
            select
            value={innerPredictor}
            onChange={(event) => setInnerPredictor(event.target.value)}
            label={t("questions.filters.long_label.predictor")}
            placeholder={t("questions.filters.placeholders.predictor")}
            size="small"
          >
            <MenuItem value="">
              <em>{t("questions.filters.all_predictors")}</em>
            </MenuItem>
            <MenuItem value="ridge_model-ml">
              {t("questions.filters.predictor.ridge_model_ml")}
            </MenuItem>
            <MenuItem value="neural">
              {t("questions.filters.predictor.neural")}
            </MenuItem>
            <MenuItem value="matcher">
              {t("questions.filters.predictor.matcher")}
            </MenuItem>
            <MenuItem value="google-could-vision">
              {t("questions.filters.predictor.google_cloud_vision")}
            </MenuItem>
            <MenuItem value="regex">
              {t("questions.filters.predictor.regex")}
            </MenuItem>
            <MenuItem value="flashtext">
              {t("questions.filters.predictor.flashtext")}
            </MenuItem>
            <MenuItem value="nutriscore">
              {t("questions.filters.predictor.nutriscore")}
            </MenuItem>
            <MenuItem value="universal-logo-detector">
              {t("questions.filters.predictor.universal_logo_detector")}
            </MenuItem>
            <MenuItem value="ocr">
              {t("questions.filters.predictor.ocr")}
            </MenuItem>
          </TextField>

          <FormControlLabel
            checked={innerSortByPopularity !== "false"}
            control={
              <Checkbox
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setInnerSortByPopularity(event.target.checked.toString())
                }
              />
            }
            label={t("questions.filters.long_label.popularity")}
            labelPlacement="end"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => {
              resetFilter();
              onClose();
            }}
          >
            {t("questions.filters.actions.cancel")}
          </Button>
          <Button variant="contained" onClick={applyFilter}>
            {t("questions.filters.actions.apply")}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
