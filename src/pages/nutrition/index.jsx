import * as React from "react";
import NutritionTable from "./table";
import ImageTable from "./picture";
import { Box } from "@mui/material";
import { flexbox } from "@material-ui/system";

export default function Nutrition() {
  return (
    <Box display={"flex"}
         flexDirection={{ xs: "column", md: "row" }}
         gap={2}
         sx={{
           width: 1,
           height: 1,
           alignItems: { xs: 'center', md:"flex-start" },
           justifyContent: "center",
           padding: 4
         }}>
      <ImageTable />
      <NutritionTable />
    </Box>
  );
}