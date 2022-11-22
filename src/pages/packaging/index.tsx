import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { Option, useOptions } from "../../hooks/useOptions";
import { getLang } from "../../localeStorageManager";

const CustomAutoComplet = ({ options }: { options: Option[] }) => {
  return (
    <Autocomplete
      disablePortal
      options={options}
      sx={{ width: 300 }}
      renderInput={(params) => <TextField {...params} />}
      filterOptions={(options, { inputValue }) => {
        console.log(options);
        return options.filter((option) =>
          option.synonyms.some((synonym) => synonym.startsWith(inputValue))
        );
      }}
    />
  );
};

const Row = (props) => {
  const { packagingMaterials, packagingShapes, packagingRecycling } = props;

  return (
    <TableRow>
      <TableCell>
        <TextField />
      </TableCell>

      <TableCell>
        <CustomAutoComplet options={packagingShapes} />
      </TableCell>

      <TableCell>
        <CustomAutoComplet options={packagingMaterials} />
      </TableCell>

      <TableCell>
        <CustomAutoComplet options={packagingRecycling} />
      </TableCell>
    </TableRow>
  );
};
const Page = (props) => {
  const lang = getLang();
  const packagingMaterials = useOptions("packaging_materials", lang);
  const packagingShapes = useOptions("packaging_shapes", lang);
  const packagingRecycling = useOptions("packaging_recycling", lang);

  const [rows, setRows] = React.useState([{ id: 1 }]);
  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nb per unit</TableCell>

              <TableCell>Shape</TableCell>

              <TableCell>Material</TableCell>

              <TableCell>Recycling</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <Row
                key={row.id}
                packagingMaterials={packagingMaterials}
                packagingShapes={packagingShapes}
                packagingRecycling={packagingRecycling}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button
        onClick={() => setRows((prev) => [...prev, { id: prev.length + 1 }])}
      >
        Add row
      </Button>
    </>
  );
};

export default Page;
