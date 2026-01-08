import * as React from "react";

import { ErrorBoundary } from "../../components/ErrorBoundary";
import Instructions from "./Instructions";
import { RobotoffNutrientExtraction } from "../../components/OffWebcomponents";
import { Box } from "@mui/material";
import { useRobotoffPredictions } from "./useRobotoffPredictions";

export default function Nutrition() {
  const { error } = useRobotoffPredictions(false);
  console.log(error);
  return (
    <React.Suspense>
      <ErrorBoundary>
        <Instructions />
        <Box sx={{ mb: 2, px: 2 }}>
          {error && error}
          {!error && <RobotoffNutrientExtraction />}
        </Box>
      </ErrorBoundary>
    </React.Suspense>
  );
}
