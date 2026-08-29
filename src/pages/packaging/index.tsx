import * as React from "react";
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

import Row from "./Row";
import {
  useBuffer,
  type EditablePackaging,
  type PackagingUpdate,
  type ProductDescription,
} from "./useBuffer";
import { useOptions } from "../../hooks/useOptions";
import { getLang } from "../../localeStorageManager";
import ZoomableImage from "../../components/ZoomableImage";
import { getImagesUrls } from "../questions/utils";
import offService from "../../off";
import { OFF_API_URL_V3 } from "../../const";
import { useTranslation } from "react-i18next";
import useUrlParams from "../../hooks/useUrlParams";
import Loader from "../loader";
import { useCountry } from "../../contexts/CountryProvider";
import { getCountryId } from "../../utils/getCountryId";
type PackagingWrite = {
  number_of_units?: number;
  shape?: { id: string };
  material?: { id: string };
  recycling?: { id: string };
};

const formatData = (innerRows: EditablePackaging[]) => {
  const packagings = innerRows
    .map(({ material, number, recycling, shape }) => {
      const rep: PackagingWrite = {};

      if (number && !isNaN(Number.parseInt(number))) {
        rep.number_of_units = Number.parseInt(number);
      }
      if (shape) {
        rep.shape = { id: shape };
      }
      if (material) {
        rep.material = { id: material };
      }
      if (recycling) {
        rep.recycling = { id: recycling };
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

const toEditablePackaging = (
  product: ProductDescription,
): EditablePackaging[] =>
  (product.packagings ?? []).map((packaging, id) => ({
    id,
    material: packaging.material?.id ?? null,
    number: packaging.number_of_units?.toString() ?? "",
    recycling: packaging.recycling?.id ?? null,
    shape: packaging.shape?.id ?? null,
  }));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

type PackagingEditorProps = {
  product: ProductDescription;
  next: () => void;
  packagingMaterials: ReturnType<typeof useOptions>;
  packagingShapes: ReturnType<typeof useOptions>;
  packagingRecycling: ReturnType<typeof useOptions>;
};

const PackagingEditor = ({
  product,
  next,
  packagingMaterials,
  packagingShapes,
  packagingRecycling,
}: PackagingEditorProps) => {
  const { t } = useTranslation();
  const initialRows = React.useMemo(
    () => toEditablePackaging(product),
    [product],
  );
  const [rows, setRows] = React.useState(initialRows);
  const [innerRows, setInnerRows] = React.useState(initialRows);

  const updateRow = (id: number, update: PackagingUpdate) => {
    setInnerRows((previous) =>
      previous.map((row) => (row.id === id ? { ...row, ...update } : row)),
    );
  };

  const addRow = () => {
    const id = Math.max(-1, ...rows.map((row) => row.id)) + 1;
    const newRow: EditablePackaging = {
      id,
      material: null,
      number: "",
      recycling: null,
      shape: null,
    };
    setRows((previous) => [...previous, newRow]);
    setInnerRows((previous) => [...previous, newRow]);
  };

  return (
    <React.Suspense fallback={<Loader />}>
      <Stack direction="row" spacing={1} sx={{ overflow: "auto" }}>
        {getImagesUrls(product.images, product.code).map(
          ({ imageUrl, imageUrlFull }) => (
            <ZoomableImage
              key={imageUrl}
              src={imageUrl}
              srcFull={imageUrlFull}
              imageProps={{
                loading: "lazy",
                style: { maxWidth: 300, maxHeight: 300 },
              }}
            />
          ),
        )}
      </Stack>

      <Box>
        <Stack
          spacing={1}
          alignItems={{ xs: "flex-start", md: "flex-end" }}
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
                    updateRow={(update) => updateRow(row.id, update)}
                    {...row}
                  />
                ))}
              </TableBody>
            </Table>
            <Button onClick={addRow}>Add row</Button>
          </TableContainer>
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          sx={{ my: 2, justifyContent: "flex-end" }}
        >
          <Button sx={{ width: 150 }} onClick={next} variant="contained">
            Skip
          </Button>
          <Button
            sx={{ width: 150 }}
            onClick={() => {
              void axios
                .patch(
                  `${OFF_API_URL_V3}/product/${product.code}`,
                  formatData(innerRows),
                  { withCredentials: true },
                )
                .then(next)
                .catch((error: unknown) => {
                  console.error(error);
                });
            }}
            variant="contained"
            color="success"
          >
            Validate
          </Button>
        </Stack>
      </Box>
      <Stack direction="row" spacing={2}>
        <Typography>{product.product_name}</Typography>
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
    </React.Suspense>
  );
};

const Page = () => {
  const [country] = useCountry();
  const countryId = React.useMemo(
    () => getCountryId(country) || "en:france",
    [country],
  );
  const lang = getLang();
  const packagingMaterials = useOptions("packaging_materials", lang);
  const packagingShapes = useOptions("packaging_shapes", lang);
  const packagingRecycling = useOptions("packaging_recycling", lang);
  const urlParamsResult: unknown = useUrlParams(
    {
      creator: undefined,
      code: "",
    },
    {},
  );
  const rawSearchState = Array.isArray(urlParamsResult)
    ? (urlParamsResult[0] as unknown)
    : null;
  const searchState = {
    creator:
      isRecord(rawSearchState) && typeof rawSearchState.creator === "string"
        ? rawSearchState.creator
        : undefined,
    code:
      isRecord(rawSearchState) && typeof rawSearchState.code === "string"
        ? rawSearchState.code
        : "",
  };

  const [data, next, error, retry] = useBuffer({
    ...searchState,
    country: countryId,
  });

  const product = data?.[0] ?? null;
  if (error !== null) {
    return (
      <Stack spacing={2} alignItems="flex-start">
        <Typography color="error">Unable to load a product: {error}</Typography>
        <Button variant="contained" onClick={retry}>
          Retry
        </Button>
      </Stack>
    );
  }

  if (product === null) {
    return <p>Loading...</p>;
  }
  return (
    <PackagingEditor
      key={product.code}
      product={product}
      next={next}
      packagingMaterials={packagingMaterials}
      packagingShapes={packagingShapes}
      packagingRecycling={packagingRecycling}
    />
  );
};

export default Page;
