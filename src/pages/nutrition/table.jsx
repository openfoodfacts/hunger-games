import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import SelectAutoWidth from "./selectComp";
import { Box } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";

function createData(
  label, property, unit
) {
  return { label, property, unit };
}

const nutritions = [{
  off_nutriment_id: "energy_kj",
  label: "Energie (kJ)",
  value: "",
  unit: 'null',
  quantification: "=",
  robotoffPrediction: null
},
  {
    off_nutriment_id: "energy_kcal",
    label: "Protein",
    value: "",
    unit: 'null',
    quantification: "<",
    robotoffPrediction: null
  },
  {
    off_nutriment_id: "energy_kcal",
    label: "Shugar",
    value: "",
    unit: 'null',
    quantification: "<",
    robotoffPrediction: null
  },
  {
    off_nutriment_id: "energy_kcal",
    label: "Fat",
    value: "",
    unit: null,
    quantification: "<",
    robotoffPrediction: null
  },
  {
    off_nutriment_id: "energy_kcal",
    label: "Energie (kCal)",
    value: "",
    unit: null,
    quantification: "<",
    robotoffPrediction: null
  }
]

const rows = nutritions.map(nutrition => {
  return (
    createData(<Box sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
      }}><TextField id="outlined-basic"
                    label={nutrition.label}
                    variant="outlined"
                    sx={{width: '10rem',}}
      /> , <SelectAutoWidth /></Box>,
      <Checkbox sx={{}}/>))
})


export default function NutritionTable() {
  return (
    <TableContainer sx={{margin: 0, maxWidth: "1000px", minWidth: '400px', width: '30%'}}>
      <Table sx={{  border: "5px solid red"}}
             aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ maxWidth: '8em', fontSize: 'large', fontWeight: 'bold'}}>nutrition.table.value</TableCell>
            <TableCell align="left" sx={{}}>isPresent</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.label}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th"
                         scope="row"
                         sx={{border: '5px solid red', width: 10}}
                >
                {row.label}
              </TableCell>
              <TableCell align="left" sx={{border: '5px solid red'}}>{row.property}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
