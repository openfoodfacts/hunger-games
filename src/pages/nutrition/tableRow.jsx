import * as React from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import SelectUnit from "./unitSelect";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { useTranslation } from "react-i18next";

export default function TableRowComp({
  nutriment,
  onchangeHandler,
  deleteItem,
}) {
  const { t } = useTranslation();

  const nutrimentLabel = t(`nutrition.nutriments.${nutriment.label}`);

  return (
    <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
      <TableCell component="th" scope="row">
        {nutrimentLabel}
      </TableCell>
      <TableCell>
        <SelectUnit
          options={nutriment.quantification}
          value={"quantification"}
          onchangeHandler={onchangeHandler}
        />
      </TableCell>

      <TableCell sx={{ width: 20 }}>
        <TextField
          id={nutriment.label}
          type={"number"}
          sx={{
            minWidth: "8rem",
          }}
          /*label={t(`nutrition.nutriments.${nutriment.label}`)}*/
          label="Value"
          variant="outlined"
          /*sx={{ width: "10rem" }}*/
          value={nutriment.value}
          name={"value"}
          onChange={onchangeHandler}
        />
      </TableCell>
      <TableCell>
        <SelectUnit
          options={nutriment.unit}
          value={"unit"}
          onchangeHandler={onchangeHandler}
        />
      </TableCell>
      <TableCell>
        <DeleteOutlineIcon
          sx={{ cursor: "pointer", color: "red" }}
          onClick={() => deleteItem(nutriment)}
        />
      </TableCell>
    </TableRow>
  );
}
