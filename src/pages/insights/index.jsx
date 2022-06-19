import { Divider, Stack } from "@mui/material";
import * as React from "react";

import FilterInsights from "./FilterInsights";
import InsightGrid from "./InsightsGrid";

export default function Insights() {
  return (
    <Stack spacing={2}>
      <p>Insights page</p>
      <FilterInsights />
      <Divider />
      <InsightGrid />
    </Stack>
  );
}
