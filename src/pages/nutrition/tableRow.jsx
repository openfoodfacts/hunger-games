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

export default function TableRowComp({nutriment, onchangeHandler, deleteItem}) {
  /*{nutrition, onchangeHandler, deleteItem}*/

  function createData(
    label, property, deleteIcon
  ) {
    return { label, property, deleteIcon };
  }

  const row = createData(<Box sx={{
      display: "flex",
      alignItems: "center",
      flexDirection: "row"
    }}><TextField id="outlined-basic"
                  type={'number'}
                  label={nutriment.label}
                  variant="outlined"
                  sx={{ width: "10rem" }}
                  value={nutriment.value}
                  name={nutriment.label}
                  onChange={onchangeHandler}
    /> , <SelectAutoWidth /></Box>,
    <DeleteOutlineIcon sx={{cursor: 'pointer', color: 'red'}} onClick={() => deleteItem(nutriment)}/>)

return (
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
)
}