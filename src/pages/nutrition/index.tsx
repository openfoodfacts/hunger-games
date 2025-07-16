import * as React from "react";

import { ErrorBoundary } from "../taxonomyWalk/Error";
import Instructions from "./Instructions";
import { RobotoffNutrientExtraction } from "../../components/OffWebcomponents";
import { Box } from "@mui/material";
import { useRobotoffPredictions } from "./useRobotoffPredictions";
import Alert from "@mui/material/Alert";

export default function Nutrition() {
  // Use the hook to get the error state
  const { error } = useRobotoffPredictions(false); // or true, depending on the game mode
  return (
    <React.Suspense>
      <ErrorBoundary>
        <Instructions />
        <Box sx={{ mb: 2, px: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <RobotoffNutrientExtraction />
        </Box>
      </ErrorBoundary>
    </React.Suspense>
  );
}
