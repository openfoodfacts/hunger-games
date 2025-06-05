import * as React from "react";
import Loader from "../loader";
import { RobotoffIngredientDetection } from "../../components/OffWebcomponents";
import { Box } from "@mui/system";

export default function IngredientDetection() {
  return (
    <React.Suspense fallback={<Loader />}>
      <Box sx={{ p: 2 }}>
        <RobotoffIngredientDetection />
      </Box>
    </React.Suspense>
  );
}
