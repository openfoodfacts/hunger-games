import * as React from "react";

import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

import LoadingButton from "@mui/lab/LoadingButton";

import { useTranslation } from "react-i18next";

import LabelFilter from "../components/QuestionFilter/LabelFilter";

const TYPE_WITHOUT_VALUE = ["packager_code", "qr_code", "no_logo"];

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
  { value: "no_logo", labelKey: "logos.no_logo" },
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

export const useLogoForm = (value, type, request) => {
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

  const isValid = isValidAnnotation({
    type: innerType || "",
    value: innerValue,
  });

  const hasAutoComplet = ["label", "category", "packaging"].includes(innerType);

  const typeControl = {
    value: innerType,
    onChange: (event) => setInnerType(event.target.value),
  };
  const valueControl = {
    insightType: hasAutoComplet ? innerType : undefined,
    value: innerValue,
    onChange: hasAutoComplet
      ? (newValue) => setInnerValue(newValue)
      : (event) => setInnerValue(event.target.value),
  };

  return {
    isSending,
    send,
    isDifferent,
    hasAutoComplet,
    isValid,
    typeControl,
    valueControl,
  };
};

const LogoForm = (props) => {
  const { value, type, updateMode, request, isLoading, ...other } = props;
  const { t } = useTranslation();

  const {
    isSending,
    send,
    isDifferent,
    isValid,
    hasAutoComplet,
    typeControl,
    valueControl,
  } = useLogoForm(value, type, request);

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={{ xs: 1, sm: 2, md: 4 }}
      {...other}
    >
      <TextField
        {...typeControl}
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
      {hasAutoComplet ? (
        <LabelFilter
          showKey
          {...valueControl}
          label={t("logos.value")}
          size="small"
          sx={{ minWidth: { xs: "80%", sm: 350 } }}
        />
      ) : (
        <TextField
          {...valueControl}
          label={t("logos.value")}
          sx={{ minWidth: { xs: "80%", sm: 350 } }}
          size="small"
        />
      )}
      <LoadingButton
        onClick={send}
        loading={isSending}
        disabled={isLoading || !isValid || (updateMode && !isDifferent)}
        variant="contained"
        color="primary"
      >
        {t("logos.update")}
      </LoadingButton>
    </Stack>
  );
};
export default LogoForm;
