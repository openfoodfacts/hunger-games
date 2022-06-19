import { Divider, Stack } from "@mui/material";
import * as React from "react";

import FilterInsights from "./FilterInsights";
import InsightGrid from "./InsightsGrid";

export default function Insights() {
  const [filterState, setFilterState] = React.useState({
    barcode: "",
    valueTag: "",
    insightType: "",
    annotationStatus: "",
  });

  return (
    <Stack spacing={2}>
      <p>Insights page</p>
      <FilterInsights filterState={filterState} setFilterState={setFilterState} />
      <Divider />
      <InsightGrid filterState={filterState} />
    </Stack>
  );
}
