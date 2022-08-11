import * as React from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import SelectAutoWidth from "./unitSelect";
import { Box } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { useTranslation } from "react-i18next";

export default function TableRowComp({
  nutriment,
  onchangeHandler,
  deleteItem,
}) {
  /*{nutrition, onchangeHandler, deleteItem}*/
  const { t } = useTranslation();
  function createData(label, property, deleteIcon) {
    return { label, property, deleteIcon };
  }

  const row = createData(
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
      }}
    >
      <TextField
        id="outlined-basic"
        type={"number"}
        label={t(`nutrition.nutriments.${nutriment.label}`)}
        variant="outlined"
        sx={{ width: "10rem" }}
        value={nutriment.value}
        name={nutriment.label}
        onChange={onchangeHandler}
      />{" "}
      , <SelectAutoWidth />
    </Box>,
    <DeleteOutlineIcon
      sx={{ cursor: "pointer", color: "red" }}
      onClick={() => deleteItem(nutriment)}
    />
  );

  return (
    <TableRow
      key={row.label}
      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
    >
      <TableCell component="th" scope="row" sx={{ width: 10 }}>
        {row.label}
      </TableCell>
      <TableCell align="left" sx={{ width: "1rem" }}>
        {row.property}
      </TableCell>
    </TableRow>
  );
}
