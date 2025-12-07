import * as React from "react";

import { ErrorBoundary } from "../../components/ErrorBoundary";
import Instructions from "./Instructions";
import { RobotoffNutrientExtraction } from "../../components/OffWebcomponents";
import { Box } from "@mui/material";

export default function Nutrition() {
  return (
    <React.Suspense>
      <ErrorBoundary>
        <Instructions />
        <Box sx={{ mb: 2, px: 2 }}>
          <RobotoffNutrientExtraction />
        </Box>
      </ErrorBoundary>
    </React.Suspense>
  );
}
