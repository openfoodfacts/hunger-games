import * as React from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { useTranslation } from "react-i18next";

const defaultUnitOptions = [
  { value: "g", label: "g" },
  { value: "mg", label: "mg" },
];
const qualificationOptions = [
  { value: "=", label: "=" },
  { value: ">", label: ">" },
  { value: "<", label: "<" },
];
export default function TableRowComp({
  nutriment,
  onchangeHandler,
  deleteItem,
}) {
  const { t } = useTranslation();

  const nutrimentLabel = t(`nutrition.nutriments.${nutriment.label}`);

  const unitOptions = nutriment.unitOptions ?? defaultUnitOptions;

  return (
    <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
      <TableCell component="th" scope="row">
        {nutrimentLabel}
      </TableCell>
      <TableCell>
        <TextField
          select
          onChange={onchangeHandler}
          value={nutriment.quantification}
          sx={{ minWidth: 80 }}
        >
          {qualificationOptions.map(({ label, value }) => (
            <MenuItem key={label} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
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
        {unitOptions.length > 0 && (
          <TextField
            select
            onChange={onchangeHandler}
            value={nutriment.unit}
            sx={{ minWidth: 80 }}
            label="Unit"
          >
            {unitOptions.map(({ label, value }) => (
              <MenuItem key={label} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        )}
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
