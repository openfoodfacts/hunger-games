import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import SelectAutoWidth from "./unitSelect";
import { Box } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import AdditionalNutriments from "./additionalNutritions";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import TableRowComp from "./tableRow";

function createData(
  label, property, unit
) {
  return { label, property, unit };
}

export default function NutritionTable({nutriments, setNutriments, additionalNutriments, deleteItem, setAdditionalNutriments, onchangeHandler}) {

  const rows = nutriments.map(nutriment => <TableRowComp nutriment = {nutriment} onchangeHandler={onchangeHandler} deleteItem={deleteItem} key={nutriment.off_nutriment_id}/>)

  /*const rows = nutriments.map(nutrition => {
    return (
      createData(<Box sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "row"
        }}><TextField id="outlined-basic"
                      type={'number'}
                      label={nutrition.label}
                      variant="outlined"
                      sx={{ width: "10rem" }}
                      value={nutrition.value}
                      name={nutrition.label}
                      onChange={onchangeHandler}
        /> , <SelectAutoWidth /></Box>,
        <DeleteOutlineIcon sx={{cursor: 'pointer', color: 'red'}} onClick={() => deleteItem(nutrition)}/>));
  });

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
            {rows.map(row => (
              <TableRow
                key={row.label}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th"
                           scope="row"
                           sx={{ width: 10 }}
                >
                  {row.label}
                </TableCell>
                <TableCell align="left"
                           sx={{ width: "1rem"}}>{row.property}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <AdditionalNutriments
        options = {additionalNutriments}
        setNutriments={setNutriments}
        setAdditionalNutriments={setAdditionalNutriments}
      />

      <TableRowComp nutriment={nutriments[0]} onchangeHandler={onchangeHandler} deleteItem={deleteItem}/>
    </Box>)*/

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
        setAdditionalNutriments={setAdditionalNutriments}
      />
    </Box>
  )
}
