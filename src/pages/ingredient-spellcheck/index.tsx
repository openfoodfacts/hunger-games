import { Suspense } from "react";
import { Box } from "@mui/material";

import Loader from "../loader";
import { RobotoffIngredientSpellcheck } from "../../components/OffWebcomponents";

export default function IngredientSpellcheck() {
  return (
    <Suspense fallback={<Loader />}>
      <Box sx={{ p: 4, mx: "auto" }}>
        <RobotoffIngredientSpellcheck />
      </Box>
    </Suspense>
  );
}
