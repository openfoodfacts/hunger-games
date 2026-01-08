import * as React from "react";
import { useSearchParams } from "react-router";

import { ErrorBoundary } from "../../components/ErrorBoundary";
import Instructions from "./Instructions";
import { RobotoffNutrientExtraction } from "../../components/OffWebcomponents";
import { Box } from "@mui/material";

export default function Nutrition() {
  const [searchParams] = useSearchParams();
  const productCode = searchParams.get("code") || undefined;

  return (
    <React.Suspense>
      <ErrorBoundary>
        <Instructions />
        <Box sx={{ mb: 2, px: 2 }}>
          <RobotoffNutrientExtraction productCode={productCode} />
        </Box>
      </ErrorBoundary>
    </React.Suspense>
  );
}
