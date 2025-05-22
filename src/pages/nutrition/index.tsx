import * as React from "react";

import { ErrorBoundary } from "../taxonomyWalk/Error";
import Instructions from "./Instructions";
import { RobotoffNutrients } from "../../components/OffWebcomponents";
import { Box } from "@mui/material";

export default function Nutrition() {
  return (
    <React.Suspense>
      <ErrorBoundary>
        <Instructions />
        <Box sx={{ mb: 2, px: 2 }}>
          <RobotoffNutrients />
        </Box>
      </ErrorBoundary>
    </React.Suspense>
  );
}
