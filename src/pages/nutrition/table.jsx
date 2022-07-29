import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import SelectAutoWidth from "./selectComp";
import { Box } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";

function createData(
  name: string,
  calories: number,
  fat: number
) {
  return { name, calories, fat };
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
    label: "Energie (kCal)",
    value: "",
    unit: 'null',
    quantification: "<",
    robotoffPrediction: null
  },
  {
    off_nutriment_id: "energy_kcal",
    label: "Energie (kCal)",
    value: "",
    unit: 'null',
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
    <TableContainer component={Paper}>
      <Table sx={{ maxWidth: "300px", width: '30%', border: "5px solid red" }}
             aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ maxWidth: '8em', fontSize: 'large', fontWeight: 'bold', borderRight: '1px solid gray'}}>nutrition.table.value</TableCell>
            <TableCell align="left" sx={{}}>isPresent</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th"
                         scope="row">
                {row.name}
              </TableCell>
              <TableCell align="left">{row.calories}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
