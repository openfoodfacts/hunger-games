import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { useBuffer } from "./useBuffer";
import { Option, useOptions } from "../../hooks/useOptions";
import { getLang } from "../../localeStorageManager";
import ZoomableImage from "../../components/ZoomableImage";
import { getImagesUrls } from "../questions/utils";
import axios from "axios";

type CustomProps = {
  options: Option[];
  value: Option | null;
  onChange: any;
};

const CustomAutoComplet = (props: CustomProps) => {
  const { options, value, onChange } = props;

  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={onChange}
      disablePortal
      renderInput={(params) => <TextField {...params} />}
      filterOptions={(options, { inputValue }) => {
        return options.filter((option) =>
          option.synonyms.some((synonym) =>
            synonym.toLowerCase().includes(inputValue.toLowerCase())
          )
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
  console.log({ index });
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
    number = null,
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

const formatData = (innerRows) => {
  const rep = {};

  innerRows.forEach(({ material, number, recycling, shape }, index) => {
    rep[`packaging_${index + 1}_number_of_units`] = number;
    rep[`packaging_${index + 1}_shape`] = shape;
    rep[`packaging_${index + 1}_material`] = material;
    rep[`packaging_${index + 1}_recycling`] = recycling;
  });

  rep["packaging_max"] = innerRows.length;

  return rep;
};

const Page = () => {
  const lang = getLang();
  const packagingMaterials = useOptions("packaging_materials", lang);
  const packagingShapes = useOptions("packaging_shapes", lang);
  const packagingRecycling = useOptions("packaging_recycling", lang);

  const [rows, setRows] = React.useState([]);
  const [innerRows, setInnerRows] = React.useState([]);

  const [data, next] = useBuffer();

  const product = data?.[0] ?? null;
  React.useEffect(() => {
    if (product) {
      const newRows = product.packagings.map((item, index) => ({
        id: index,
        ...item,
      }));
      setRows(newRows);
      setInnerRows(newRows);
    }
  }, [product]);

  if (product === null) {
    return <p>Loading...</p>;
  }
  return (
    <>
      <Stack direction="row" spacing={1} sx={{ overflow: "auto" }}>
        {getImagesUrls(product.images, product.code).map((src) => (
          <ZoomableImage
            src={src}
            imageProps={{
              loading: "lazy",
              style: { maxWidth: 300, maxHeight: 300 },
            }}
          />
        ))}
      </Stack>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          axios.post(
            "https://world.openfoodfacts.dev/api/v3",
            new URLSearchParams({
              ...formatData(innerRows),
              code: `${product.code}`,
            }),
            { withCredentials: true }
          );
        }}
      >
        <Stack spacing={1} direction={{ xs: "column", md: "row" }}>
          <img src={product.image_packaging_url} alt="" />
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
                    updateRow={(toUpsert) => {
                      setInnerRows((prev) => {
                        return prev.map((r) => {
                          if (r.id !== row.id) {
                            return r;
                          }
                          return { ...r, ...toUpsert };
                        });
                      });
                    }}
                    {...row}
                  />
                ))}
              </TableBody>
            </Table>
            <Button
              onClick={() =>
                setInnerRows((prev) => [
                  ...prev,
                  {
                    id: prev.length + 1,
                    material: null,
                    number: null,
                    recycling: null,
                    shape: null,
                  },
                ])
              }
            >
              Add row
            </Button>
          </TableContainer>
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          sx={{ my: 2, justifyContent: "flex-end" }}
        >
          <Button
            sx={{ width: 150 }}
            onClick={() => next()}
            variant="contained"
          >
            Skip
          </Button>
          <Button
            sx={{ width: 150 }}
            onClick={() => next()}
            variant="contained"
            type="submit"
            color="success"
          >
            Validate
          </Button>
        </Stack>
      </form>
    </>
  );
};

export default Page;
