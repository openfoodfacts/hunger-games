import * as React from "react";

import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";

import { useTranslation } from "react-i18next";

import LabelFilter from "../components/QuestionFilter/LabelFilter";
import { TYPE_WITHOUT_VALUE } from "../const";
import { logoTypeOptions } from "./logoTypeOptions";
import TaxonomyAutoSelect from "./TaxonomyAutoSelect";

const getFormattedValues = ({ type, value, count, barcode }) => {
  let formattedValue = value.toLowerCase().trim();
  if (TYPE_WITHOUT_VALUE.includes(type)) {
    formattedValue = "";
  }

  let formattedBarcode = barcode.toLowerCase().trim();
  return { count, type, value: formattedValue, barcode: formattedBarcode };
};

const LogoSearchForm = (props) => {
  const { value, barcode, type, count, validate, ...other } = props;
  const { t } = useTranslation();

  const [draft, setDraft] = React.useState({
    sourceValue: value,
    sourceType: type,
    sourceCount: count,
    sourceBarcode: barcode,
    value,
    type,
    count,
    barcode,
  });
  const isCurrentDraft =
    draft.sourceValue === value &&
    draft.sourceType === type &&
    draft.sourceCount === count &&
    draft.sourceBarcode === barcode;
  const currentDraft = isCurrentDraft ? draft : { value, type, count, barcode };
  const updateDraft = (changes) => {
    setDraft({
      sourceValue: value,
      sourceType: type,
      sourceCount: count,
      sourceBarcode: barcode,
      ...currentDraft,
      ...changes,
    });
  };
  const {
    value: innerValue,
    type: innerType,
    count: innerCount,
    barcode: innerBarcode,
  } = currentDraft;

  return (
    <Stack direction="column" spacing={{ xs: 1, sm: 2, md: 4 }} {...other}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} wrap="wrap">
        <TextField
          fullWidth
          value={innerType}
          onChange={(event) => updateDraft({ type: event.target.value })}
          select
          label={t("logos.type")}
          size="small"
        >
          {logoTypeOptions.map(({ value: typeValue, labelKey }) => (
            <MenuItem key={labelKey} value={typeValue}>
              {t(labelKey)}
            </MenuItem>
          ))}
        </TextField>
        {["label", "category", "packaging"].includes(innerType) ? (
          <LabelFilter
            showKey
            fullWidth
            value={innerValue}
            onChange={(newValue) => updateDraft({ value: newValue })}
            insightType={innerType}
            label={t("logos.value")}
            size="small"
          />
        ) : innerType === "brand" ? (
          <TaxonomyAutoSelect
            taxonomy="brand"
            value={innerValue}
            onChange={(newValue) => updateDraft({ value: newValue })}
            showKey
            fullWidth
            size="small"
            label={t("logos.value")}
          />
        ) : (
          <TextField
            fullWidth
            value={innerValue}
            onChange={(event) => updateDraft({ value: event.target.value })}
            label={t("logos.value")}
            size="small"
          />
        )}
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <TextField
          fullWidth
          value={innerBarcode}
          onChange={(event) => updateDraft({ barcode: event.target.value })}
          label={t("logos.barcode")}
          size="small"
        />
        <TextField
          fullWidth
          value={innerCount}
          onChange={(event) => updateDraft({ count: event.target.value })}
          label="Max nb"
          type="number"
          size="small"
        />
      </Stack>
      <Button
        onClick={() =>
          validate(
            getFormattedValues({
              type: innerType || "",
              value: innerValue || "",
              barcode: innerBarcode || "",
              count: innerCount,
            }),
          )
        }
        variant="contained"
        color="primary"
        fullWidth
      >
        {t("logos.search")}
      </Button>
    </Stack>
  );
};
export default LogoSearchForm;
