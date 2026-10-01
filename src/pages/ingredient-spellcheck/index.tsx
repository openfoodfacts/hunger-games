import { Suspense } from "react";
import { Box } from "@mui/material";

import Loader from "../loader";
import { RobotoffIngredientSpellcheck } from "../../components/OffWebcomponents";
import GameOpportunityBadge from "../../components/GameOpportunityBadge";

export default function IngredientSpellcheck() {
  return (
    <Suspense fallback={<Loader />}>
      <Box
        sx={{
          p: 4,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <GameOpportunityBadge game="ingredient-spellcheck" />
        <RobotoffIngredientSpellcheck />
      </Box>
    </Suspense>
  );
}
