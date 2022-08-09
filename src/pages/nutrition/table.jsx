import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Box } from "@mui/material";
import AdditionalNutriments from "./additionalNutritions";

import TableRowComp from "./tableRow";

function createData(
  label, property, unit
) {
  return { label, property, unit };
}

export default function NutritionTable({nutriments, setNutriments, additionalNutriments, deleteItem, onchangeHandler}) {

  const rows = nutriments.map(nutriment => <TableRowComp nutriment = {nutriment} onchangeHandler={onchangeHandler} deleteItem={deleteItem} key={nutriment.off_nutriment_id}/>)

  return (
    <Box>
      <TableContainer sx={{ margin: 0, maxWidth: "1000px", width: "340px" }}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell sx={{
                maxWidth: "8em",
                fontSize: "large",
                fontWeight: "bold"
              }}>nutrition.table.value</TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
            {rows}
          </TableBody>
        </Table>
      </TableContainer>
      <AdditionalNutriments
        options = {additionalNutriments}
        setNutriments={setNutriments}
      />
    </Box>
  )
}
