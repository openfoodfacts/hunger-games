import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

import axios from "axios";

import { useBuffer } from "./useBuffer";
import { Option, useOptions } from "../../hooks/useOptions";
import { getLang } from "../../localeStorageManager";
import ZoomableImage from "../../components/ZoomableImage";
import { getImagesUrls } from "../questions/utils";
import offService from "../../off";
import { useTranslation } from "react-i18next";
import useUrlParams from "../../hooks/useUrlParams";

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
  const packagings = innerRows
    .map(({ material, number, recycling, shape }, index) => {
      const rep = {};

      if (number && !isNaN(Number.parseInt(number))) {
        rep["number_of_units"] = Number.parseInt(number);
      }
      if (shape) {
        rep[`shape`] = { id: shape };
      }
      if (material) {
        rep[`material`] = { id: material };
      }
      if (recycling) {
        rep[`recycling`] = { id: recycling };
      }

      if (Object.keys(rep).length > 0) {
        return rep;
      }
      return null;
    })
    .filter((x) => x !== null);

  if (packagings.length === 0) {
    return {};
  }
  return { product: { fields: "updated", packagings } };
};

const Page = () => {
  const { t } = useTranslation();
  const lang = getLang();
  const packagingMaterials = useOptions("packaging_materials", lang);
  const packagingShapes = useOptions("packaging_shapes", lang);
  const packagingRecycling = useOptions("packaging_recycling", lang);
  const [searchState] = useUrlParams({
    country: "en:france",
    creator: undefined,
    code: "",
  });

  const [rows, setRows] = React.useState([]);
  const [innerRows, setInnerRows] = React.useState([]);

  const [data, next] = useBuffer(searchState);

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

      <Box>
        <Stack
          spacing={1}
          alignItems={{
            xs: "flex-start",
            md: "flex-end",
          }}
          direction={{ xs: "column", md: "row" }}
        >
          <img src={product.image_packaging_url} alt="" />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 100 }}>Nb per unit</TableCell>

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
              onClick={() => {
                setRows((prev) => [
                  ...prev,
                  {
                    id: prev.length + 1,
                    material: null,
                    number: null,
                    recycling: null,
                    shape: null,
                  },
                ]);
                setInnerRows((prev) => [
                  ...prev,
                  {
                    id: prev.length + 1,
                    material: null,
                    number: null,
                    recycling: null,
                    shape: null,
                  },
                ]);
              }}
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
            onClick={() => {
              axios.patch(
                `https://world.openfoodfacts.org/api/v3/product/${product.code}`,
                formatData(innerRows),
                { withCredentials: true }
              );
              next();
            }}
            variant="contained"
            color="success"
          >
            Validate
          </Button>
        </Stack>
      </Box>
      <Stack direction="row" spacing={2}>
        <Typography>{product?.product_name}</Typography>
        <Button
          size="small"
          component={Link}
          target="_blank"
          href={`${offService.getProductUrl(product.code)}#environment`}
          variant="outlined"
          startIcon={<VisibilityIcon />}
          sx={{ minWidth: 150 }}
        >
          {t("questions.view")}
        </Button>
        <Button
          size="small"
          component={Link}
          target="_blank"
          href={offService.getProductEditUrl(product.code)}
          variant="contained"
          startIcon={<EditIcon />}
          sx={{ ml: 2, minWidth: 150 }}
        >
          {t("questions.edit")}
        </Button>
      </Stack>
    </>
  );
};

export default Page;
