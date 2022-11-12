import * as React from "react";

import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

import LoadingButton from "@mui/lab/LoadingButton";

import { useTranslation } from "react-i18next";

import LabelFilter from "../components/QuestionFilter/LabelFilter";

const TYPE_WITHOUT_VALUE = ["packager_code", "qr_code"];

const logoTypeOptions = [
  { value: "", labelKey: "logos.type" },
  { value: "label", labelKey: "logos.label" },
  { value: "brand", labelKey: "logos.brand" },
  { value: "packager_code", labelKey: "logos.packager_code" },
  { value: "packaging", labelKey: "logos.packaging" },
  { value: "qr_code", labelKey: "logos.qr_code" },
  { value: "category", labelKey: "logos.category" },
  { value: "nutrition_label", labelKey: "logos.nutrition_label" },
  { value: "store", labelKey: "logos.store" },
];

const isValidAnnotation = ({ type, value }) => {
  if (type.length === 0) return false;
  if (!value && !TYPE_WITHOUT_VALUE.includes(type)) return false;
  return true;
};

const getFormattedValues = ({ type, value }) => {
  if (!isValidAnnotation({ type, value })) return null;

  let formattedValue = value.toLowerCase().trim();
  if (TYPE_WITHOUT_VALUE.includes(type)) {
    formattedValue = "";
  }
  return { type, value: formattedValue };
};

const LogoForm = (props) => {
  const { value, type, updateMode, request, isLoading, ...other } = props;
  const { t } = useTranslation();

  const [isSending, setIsSending] = React.useState(false);
  const [innerValue, setInnerValue] = React.useState(value);
  const [innerType, setInnerType] = React.useState(type);

  React.useLayoutEffect(() => {
    setInnerValue(value);
  }, [value]);

  React.useLayoutEffect(() => {
    setInnerType(type);
  }, [type]);

  const send = React.useCallback(async () => {
    setIsSending(true);
    await request(getFormattedValues({ type: innerType, value: innerValue }));
    setIsSending(false);
  }, [request, innerType, innerValue]);

  const isDifferent =
    innerType !== type ||
    (!TYPE_WITHOUT_VALUE.includes(innerType) &&
      (innerValue !== null
        ? innerValue.toLowerCase() !== value.toLowerCase()
        : innerValue !== value));

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={{ xs: 1, sm: 2, md: 4 }}
      {...other}
    >
      <TextField
        value={innerType}
        onChange={(event) => setInnerType(event.target.value)}
        select
        label={t("logos.type")}
        sx={{ minWidth: { xs: "80%", sm: 350 } }}
        size="small"
      >
        {logoTypeOptions.map(({ value, labelKey }) => (
          <MenuItem key={labelKey} value={value}>
            {t(labelKey)}
          </MenuItem>
        ))}
      </TextField>

      {["label", "category", "packaging"].includes(innerType) ? (
        <LabelFilter
          showKey
          value={innerValue}
          onChange={setInnerValue}
          insightType={innerType}
          label={t("logos.value")}
          size="small"
          sx={{ minWidth: { xs: "80%", sm: 350 } }}
        />
      ) : (
        <TextField
          value={innerValue}
          onChange={(event) => setInnerValue(event.target.value)}
          label={t("logos.value")}
          sx={{ minWidth: { xs: "80%", sm: 350 } }}
          size="small"
        />
      )}

      <LoadingButton
        onClick={send}
        loading={isSending}
        disabled={
          isLoading ||
          !isValidAnnotation({ type: innerType, value: innerValue }) ||
          (updateMode && !isDifferent)
        }
        variant="contained"
        color="primary"
      >
        {t("logos.update")}
      </LoadingButton>
    </Stack>
  );
};
export default LogoForm;
