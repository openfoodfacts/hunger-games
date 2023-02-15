import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { Option } from "../../hooks/useOptions";

type CustomProps = {
  options: Option[];
  value: Option | null;
  onChange: any;
};

/**
 * Returns true if motif is included in one syn
 * @param synonyms
 * @param motif
 */
const firstSynonymMatching = (synonyms, motif) => {
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

const CustomAutoComplet = (props: CustomProps) => {
  const [inputValue, setInputValue] = React.useState("");
  const { options, value, onChange } = props;

  return (
    <Autocomplete
      options={options}
      // @ts-ignore
      value={value}
      onChange={onChange}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      disablePortal
      // @ts-ignore
      renderInput={(params) => <TextField {...params} />}
      getOptionLabel={(option) =>
        typeof option === "string"
          ? option
          : firstSynonymMatching(option?.synonyms, inputValue)
      }
      filterOptions={(options) => {
        return options.filter(
          (option) => firstSynonymMatching(option.synonyms, inputValue) != null
        );
      }}
      isOptionEqualToValue={(option, value) => option.value === value.value}
    />
  );
};

const getOption = (options: Option[], key: string | null) => {
  if (!key) {
    return null;
  }
  const index = options.findIndex((option) => option.value === key);

  if (index >= 0) {
    return options[index];
  }
  return null;
};

const Row = (props) => {
  const {
    packagingMaterials,
    packagingShapes,
    packagingRecycling,
    updateRow,
    material = null,
    number_of_units: number = null,
    recycling = null,
    shape = null,
  } = props;

  const [innerMaterial, setInnerMaterial] = React.useState(() =>
    getOption(packagingMaterials, material)
  );
  React.useEffect(() => {
    setInnerMaterial(getOption(packagingMaterials, material));
  }, [material, packagingMaterials]);

  const [innerNumber, setInnerNumber] = React.useState(number);
  React.useEffect(() => {
    setInnerNumber(number);
  }, [number]);

  const [innerRecycling, setInnerRecycling] = React.useState(() =>
    getOption(packagingRecycling, recycling)
  );
  React.useEffect(() => {
    setInnerRecycling(getOption(packagingRecycling, recycling));
  }, [packagingRecycling, recycling]);

  const [innerShape, setInnerShape] = React.useState(() =>
    getOption(packagingShapes, shape)
  );
  React.useEffect(() => {
    setInnerShape(getOption(packagingShapes, shape));
  }, [packagingShapes, shape]);

  const reset = () => {
    setInnerMaterial(getOption(packagingMaterials, material));
    setInnerRecycling(getOption(packagingRecycling, recycling));
    setInnerShape(getOption(packagingShapes, shape));
    setInnerNumber(number);
    updateRow({
      material,
      number,
      recycling,
      shape,
    });
  };
  return (
    <TableRow>
      <TableCell>
        <TextField
          value={innerNumber || ""}
          onChange={(event) => {
            setInnerNumber(event.target.value);
            updateRow({ number: event.target.value });
          }}
          sx={{ width: 100 }}
        />
      </TableCell>

      <TableCell>
        <CustomAutoComplet
          options={packagingShapes}
          value={innerShape}
          onChange={(event, newValue) => {
            updateRow({ shape: newValue && newValue.value });
            setInnerShape(newValue);
          }}
        />
      </TableCell>

      <TableCell>
        <CustomAutoComplet
          options={packagingMaterials}
          value={innerMaterial}
          onChange={(event, newValue) => {
            updateRow({ material: newValue && newValue.value });
            setInnerMaterial(newValue);
          }}
        />
      </TableCell>

      <TableCell>
        <CustomAutoComplet
          options={packagingRecycling}
          value={innerRecycling}
          onChange={(event, newValue) => {
            updateRow({ recycling: newValue && newValue.value });
            setInnerRecycling(newValue);
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
