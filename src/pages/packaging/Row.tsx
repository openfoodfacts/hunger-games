import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import type { Option } from "../../hooks/useOptions";
import type { EditablePackaging, PackagingUpdate } from "./useBuffer";

type CustomProps = {
  options: Option[];
  value: Option | null;
  onChange: (value: Option | null) => void;
};

const firstSynonymMatching = (synonyms: string[], motif: string) => {
  const normalizedMotif = motif
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return synonyms.find((synonym) => {
    const normalizedSynonym = synonym
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return normalizedSynonym.includes(normalizedMotif);
  });
};

const CustomAutoComplete = ({ options, value, onChange }: CustomProps) => {
  const [inputValue, setInputValue] = React.useState("");

  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={(_event, newValue) => onChange(newValue)}
      onInputChange={(_event, newInputValue) => setInputValue(newInputValue)}
      disablePortal
      renderInput={(params) => <TextField {...params} />}
      getOptionLabel={(option) =>
        firstSynonymMatching(option.synonyms, inputValue) ?? option.label
      }
      filterOptions={(availableOptions) =>
        availableOptions.filter(
          (option) => firstSynonymMatching(option.synonyms, inputValue) != null,
        )
      }
      isOptionEqualToValue={(option, selected) =>
        option.value === selected.value
      }
    />
  );
};

const getOption = (options: Option[], key: string | null) =>
  options.find((option) => option.value === key) ?? null;

type RowProps = EditablePackaging & {
  packagingMaterials: Option[];
  packagingShapes: Option[];
  packagingRecycling: Option[];
  updateRow: (update: PackagingUpdate) => void;
};

const Row = ({
  packagingMaterials,
  packagingShapes,
  packagingRecycling,
  updateRow,
  material,
  number,
  recycling,
  shape,
}: RowProps) => {
  const [innerMaterial, setInnerMaterial] = React.useState(material);
  const [innerNumber, setInnerNumber] = React.useState(number);
  const [innerRecycling, setInnerRecycling] = React.useState(recycling);
  const [innerShape, setInnerShape] = React.useState(shape);

  const reset = () => {
    setInnerMaterial(material);
    setInnerRecycling(recycling);
    setInnerShape(shape);
    setInnerNumber(number);
    updateRow({ material, number, recycling, shape });
  };

  return (
    <TableRow>
      <TableCell>
        <TextField
          value={innerNumber}
          onChange={(event) => {
            setInnerNumber(event.target.value);
            updateRow({ number: event.target.value });
          }}
          sx={{ width: 100 }}
        />
      </TableCell>

      <TableCell>
        <CustomAutoComplete
          options={packagingShapes}
          value={getOption(packagingShapes, innerShape)}
          onChange={(newValue) => {
            const value = newValue?.value ?? null;
            updateRow({ shape: value });
            setInnerShape(value);
          }}
        />
      </TableCell>

      <TableCell>
        <CustomAutoComplete
          options={packagingMaterials}
          value={getOption(packagingMaterials, innerMaterial)}
          onChange={(newValue) => {
            const value = newValue?.value ?? null;
            updateRow({ material: value });
            setInnerMaterial(value);
          }}
        />
      </TableCell>

      <TableCell>
        <CustomAutoComplete
          options={packagingRecycling}
          value={getOption(packagingRecycling, innerRecycling)}
          onChange={(newValue) => {
            const value = newValue?.value ?? null;
            updateRow({ recycling: value });
            setInnerRecycling(value);
          }}
        />
      </TableCell>

      <TableCell>
        <Button
          onClick={reset}
          disabled={
            material === innerMaterial &&
            number === innerNumber &&
            recycling === innerRecycling &&
            shape === innerShape
          }
        >
          Reset
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default Row;
