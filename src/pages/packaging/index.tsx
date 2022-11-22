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

import { useBuffer } from "./useBuffer";
import { Option, useOptions } from "../../hooks/useOptions";
import { getLang } from "../../localeStorageManager";
import { optionGroupUnstyledClasses } from "@mui/base";

const CustomAutoComplet = (props: {
  options: Option[];
  value: string;
  onChange: any;
}) => {
  const { options, value, onChange } = props;
  return (
    <Autocomplete
      disablePortal
      sx={{ width: 300 }}
      renderInput={(params) => <TextField {...params} />}
      filterOptions={(options, { inputValue }) => {
        return options.filter((option) =>
          option.synonyms.some((synonym) =>
            synonym.toLowerCase().includes(inputValue.toLowerCase())
          )
        );
      }}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      options={options}
      value={value && { value, synonyms: [] }}
      onChange={onChange}
    />
  );
};

const Row = (props) => {
  const {
    packagingMaterials,
    packagingShapes,
    packagingRecycling,
    material,
    number,
    recycling,
    shape,
  } = props;

  const [innerMaterial, setInnerMaterial] = React.useState(material);
  React.useEffect(() => {
    setInnerMaterial(material);
  }, [material]);

  const [innerNumber, setInnerNumber] = React.useState(number);
  React.useEffect(() => {
    setInnerNumber(number);
  }, [number]);

  const [innerRecycling, setInnerRecycling] = React.useState(recycling);
  React.useEffect(() => {
    setInnerRecycling(recycling);
  }, [recycling]);

  const [innerShape, setInnerShape] = React.useState(shape);
  React.useEffect(() => {
    setInnerShape(shape);
  }, [shape]);

  return (
    <TableRow>
      <TableCell>
        <TextField
          value={innerNumber}
          onChange={(event) => setInnerNumber(event.target.value)}
        />
      </TableCell>

      <TableCell>
        <CustomAutoComplet
          options={packagingShapes}
          value={innerMaterial}
          onChange={(event, newValue) => {
            if (newValue === null) {
              setInnerMaterial(null);
            }
            setInnerMaterial(newValue.value);
          }}
        />
      </TableCell>

      <TableCell>
        <CustomAutoComplet
          options={packagingMaterials}
          value={innerMaterial}
          onChange={(event, newValue) => {
            if (newValue === null) {
              setInnerMaterial(null);
            }
            setInnerMaterial(newValue.value);
          }}
        />
      </TableCell>

      <TableCell>
        <CustomAutoComplet
          options={packagingRecycling}
          value={innerMaterial}
          onChange={(event, newValue) => {
            if (newValue === null) {
              setInnerMaterial(null);
            }
            setInnerMaterial(newValue.value);
          }}
        />
      </TableCell>
    </TableRow>
  );
};
const Page = (props) => {
  const lang = getLang();
  const packagingMaterials = useOptions("packaging_materials", lang);
  const packagingShapes = useOptions("packaging_shapes", lang);
  const packagingRecycling = useOptions("packaging_recycling", lang);

  const [rows, setRows] = React.useState([]);

  const data = useBuffer();

  React.useEffect(() => {
    if (data[0]) {
      setRows(
        data[0].packagings.map((item, index) => ({ id: index, ...item }))
      );
    }
  }, [data[0]?.code]);

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
