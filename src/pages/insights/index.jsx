import { Divider, Stack } from "@mui/material";
import * as React from "react";

import Typography from "@mui/material/Typography";

import FilterInsights from "./FilterInsights";
import InsightGrid from "./InsightsGrid";
import { useTranslation } from "react-i18next";

export default function Insights() {
  const { t } = useTranslation();

  const [filterState, setFilterState] = React.useState({
    barcode: "",
    valueTag: "",
    insightType: "",
    annotationStatus: "",
  });

  return (
    <Stack spacing={2} sx={{ padding: 2 }}>
      <Typography>{t("insights.insights")}</Typography>
      <FilterInsights
        filterState={filterState}
        setFilterState={setFilterState}
      />
      <Divider />
      <div style={{ height: "250px" }}>
        <InsightGrid
          filterState={filterState}
          setFilterState={setFilterState}
        />
      </div>
    </Stack>
  );
}
