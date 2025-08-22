import { Suspense } from "react";
import { Box } from "@mui/system";

import { RobotoffIngredientDetection } from "../../components/OffWebcomponents";
import Loader from "../loader";

export default function IngredientDetection() {
  return (
    <Suspense fallback={<Loader />}>
      <Box
        sx={{
          p: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <RobotoffIngredientDetection />
      </Box>
    </Suspense>
  );
}
