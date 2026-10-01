import { Suspense } from "react";
import { Box } from "@mui/material";

import { RobotoffIngredientDetection } from "../../components/OffWebcomponents";
import GameOpportunityBadge from "../../components/GameOpportunityBadge";
import Loader from "../loader";

export default function IngredientDetection() {
  return (
    <Suspense fallback={<Loader />}>
      <Box
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <GameOpportunityBadge game="ingredient-detection" />
        <RobotoffIngredientDetection />
      </Box>
    </Suspense>
  );
}
