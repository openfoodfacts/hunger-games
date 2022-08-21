import * as React from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import SelectUnit from "./unitSelect";
import { Typography } from "@mui/material";
import { Box } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { useTranslation } from "react-i18next";

function createData(label, property, deleteIcon) {
  return { label, property, deleteIcon };
}

export default function TableRowComp({
  nutriment,
  onchangeHandler,
  deleteItem,
}) {
  const { t } = useTranslation();

  const row = createData(
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "row",
        width: "400px",
      }}
    >
      <Typography>{t(`nutrition.nutriments.${nutriment.label}`)}</Typography>
      <Box
        sx={{
          display: "flex",
        }}
      >
        <SelectUnit
          options={nutriment.quantification}
          value={"quantification"}
          onchangeHandler={onchangeHandler}
        />
        <TextField
          id={nutriment.label}
          type={"number"}
          sx={{
            width: "80px",
          }}
          /*label={t(`nutrition.nutriments.${nutriment.label}`)}*/
          label="Value"
          variant="outlined"
          /*sx={{ width: "10rem" }}*/
          value={nutriment.value}
          name={"value"}
          onChange={onchangeHandler}
        />

        <SelectUnit
          options={nutriment.unit}
          value={"unit"}
          onchangeHandler={onchangeHandler}
        />
      </Box>
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
