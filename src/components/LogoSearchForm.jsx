import * as React from "react";

import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";

import { useTranslation } from "react-i18next";

import LabelFilter from "../components/QuestionFilter/LabelFilter";

const TYPE_WITHOUT_VALUE = ["packager_code", "qr_code", "no_logo"];

export const logoTypeOptions = [
  { value: "", labelKey: "logos.type" },
  { value: "label", labelKey: "logos.label" },
  { value: "brand", labelKey: "logos.brand" },
  { value: "packager_code", labelKey: "logos.packager_code" },
  { value: "packaging", labelKey: "logos.packaging" },
  { value: "qr_code", labelKey: "logos.qr_code" },
  { value: "category", labelKey: "logos.category" },
  { value: "nutrition_label", labelKey: "logos.nutrition_label" },
  { value: "store", labelKey: "logos.store" },
  { value: "no_logo", labelKey: "logos.no_logo" },
];

const getFormattedValues = ({ type, value, count, barcode }) => {
  let formattedValue = value.toLowerCase().trim();
  if (TYPE_WITHOUT_VALUE.includes(type)) {
    formattedValue = "";
  }

  let formattedBarcode = barcode.toLowerCase().trim();
  return { count, type, value: formattedValue, barcode: formattedBarcode };
};

const LogoSearchForm = (props) => {
  const {
    value,
    barcode,
    type,
    count,
    updateMode,
    validate,
    isLoading,
    ...other
  } = props;
  const { t } = useTranslation();

  const [innerValue, setInnerValue] = React.useState(value);
  const [innerType, setInnerType] = React.useState(type);
  const [innerCount, setInnerCount] = React.useState(count);
  const [innerBarcode, setInnerBarcode] = React.useState(barcode);

  React.useLayoutEffect(() => {
    setInnerValue(value);
  }, [value]);

  React.useLayoutEffect(() => {
    setInnerType(type);
  }, [type]);
  React.useLayoutEffect(() => {
    setInnerBarcode(barcode);
  }, [barcode]);
  React.useLayoutEffect(() => {
    setInnerCount(count);
  }, [count]);

  return (
    <Stack direction="column" spacing={{ xs: 1, sm: 2, md: 4 }} {...other}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} wrap="wrap">
        <p>{innerType}</p>
        <TextField
          fullWidth
          value={innerType}
          onChange={(event) => setInnerType(event.target.value)}
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
            onChange={setInnerValue}
            insightType={innerType}
            label={t("logos.value")}
            size="small"
          />
        ) : (
          <TextField
            fullWidth
            value={innerValue}
            onChange={(event) => setInnerValue(event.target.value)}
            label={t("logos.value")}
            size="small"
          />
        )}
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <TextField
          fullWidth
          value={innerBarcode}
          onChange={(event) => setInnerBarcode(event.target.value)}
          label={t("logos.barcode")}
          size="small"
        />
        <TextField
          fullWidth
          value={innerCount}
          onChange={(event) => setInnerCount(event.target.value)}
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
            })
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
