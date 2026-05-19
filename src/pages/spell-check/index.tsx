import * as React from "react";
import { useRobotoffPredictions } from "./useRobotoffPredictions";

import { Box, Typography } from "@mui/material";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import ShowImage from "./ShowImage";
// import LinksToProduct from "../nutrition/LinksToProduct";
import { TextCorrection } from "./TextCorrection/TextCorrection";

export default function Nutrition() {
  const { isLoading, insight, nextItem, product } = useRobotoffPredictions();

  const { original, correction } = insight ?? {};

  if (isLoading) {
    return <Typography>Loading</Typography>;
  }
  if (!insight) {
    return <Typography>No prediction found.</Typography>;
  }

  return (
    <React.Suspense>
      <ErrorBoundary>
        <Box sx={{ display: "flex" }}>
          <Box sx={{ width: "50%" }}>
            <ShowImage barcode={insight.barcode} images={product?.images} />
          </Box>
          <Box sx={{ width: "50%", p: 2 }}>
            {original === undefined || correction === undefined ? (
              <Typography>Loading texts... </Typography>
            ) : (
              <TextCorrection
                nextItem={nextItem}
                original={original}
                correction={correction}
              />
            )}
          </Box>
        </Box>
      </ErrorBoundary>
    </React.Suspense>
  );
}
