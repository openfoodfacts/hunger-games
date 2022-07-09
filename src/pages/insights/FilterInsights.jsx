import * as React from "react";

import { Stack, Button, TextField, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";

const typeOptions = [
  { value: "", labelKey: "insights.all" },
  { value: "label", labelKey: "insights.label" },
  { value: "product_weight", labelKey: "insights.product_weight" },
  { value: "category", labelKey: "insights.category" },
  { value: "expiration_date", labelKey: "insights.expiration_date" },
  { value: "packager_code", labelKey: "insights.packager_code" },
  { value: "brand", labelKey: "logos.brand" },
  { value: "packaging", labelKey: "logos.packaging" },
  { value: "qr_code", labelKey: "logos.qr_code" },
];

const annotationOptions = [
  { value: "", labelKey: "insights.all" },
  { value: "-1", labelKey: "insights.skipped" },
  { value: "0", labelKey: "insights.rejected" },
  { value: "1", labelKey: "insights.accepted" },
  { value: "not_annotated", labelKey: "insights.not_annotated" },
];

const useControled = (exteriorValue) => {
  const [innerValue, setInnerValue] = React.useState(exteriorValue ?? "");

  React.useEffect(() => {
    setInnerValue((v) => (v !== exteriorValue ? exteriorValue : v));
  }, [exteriorValue]);

  return [innerValue, setInnerValue];
};

const FilterForm = ({ filterState = {}, setFilterState }) => {
  const { t } = useTranslation();

  const [innerBarcode, setInnerBarcode] = useControled(
    filterState.barcode ?? ""
  );
  const [innerValueTag, setInnerValueTag] = useControled(
    filterState.valueTag ?? ""
  );
  const [innerInsightType, setInnerInsightType] = useControled(
    filterState.insightType ?? ""
  );
  const [innerAnnotationStatus, setInnerAnnotationStatus] = useControled(
    filterState.annotationStatus ?? ""
  );

  const validateFilter = React.useCallback(() => {
    setFilterState({
      barcode: innerBarcode,
      valueTag: innerValueTag,
      insightType: innerInsightType,
      annotationStatus: innerAnnotationStatus,
    });
  }, [
    innerBarcode,
    innerValueTag,
    innerInsightType,
    innerAnnotationStatus,
    setFilterState,
  ]);

  return (
    <Stack direction="column" spacing={2} sx={{ padding: 2 }}>
      <Stack direction="row" spacing={2}>
        <TextField
          fullWidth
          label={t("insights.barcode")}
          placeholder={t("insights.barcode_placeholder")}
          value={innerBarcode}
          onChange={(event) => setInnerBarcode(event.target.value)}
        />
        <TextField
          fullWidth
          label={t("insights.value_tag")}
          placeholder={t("insights.value_placeholder")}
          value={innerValueTag}
          onChange={(event) => setInnerValueTag(event.target.value)}
        />
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField
          fullWidth
          label={t("insights.type")}
          value={innerInsightType}
          onChange={(event) => setInnerInsightType(event.target.value)}
          select
        >
          {typeOptions.map(({ value, labelKey }) => (
            <MenuItem key={value} value={value}>
              {t(labelKey)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          label={t("insights.annotated")}
          value={innerAnnotationStatus}
          onChange={(event) => setInnerAnnotationStatus(event.target.value)}
          select
        >
          {annotationOptions.map(({ value, labelKey }) => (
            <MenuItem key={value} value={value}>
              {t(labelKey)}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Stack direction="row" justifyContent="end">
        <Button variant="contained" onClick={validateFilter} sx={{ ml: 2 }}>
          {t("insights.search")}
        </Button>
      </Stack>
    </Stack>
  );
};

export default FilterForm;
