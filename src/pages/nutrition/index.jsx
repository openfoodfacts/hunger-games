import * as React from "react";
import ProductNutriments from "./productCard";
import { Box } from "@mui/material";

export default function Nutrition() {
  return (
    <Box
      flexDirection={{ xs: "column", md: "row" }}
      gap={2}
      sx={{
        display: "flex",
        width: 1,
        height: 1,
        alignItems: { xs: "center", md: "flex-start" },
        justifyContent: "center",
        padding: 4,
        border: "5px solid green",
        minHeight: "89.4vh",
      }}
    >
      <ProductNutriments setNutriments={{}} nutriments={[]} />
    </Box>
  );
}
